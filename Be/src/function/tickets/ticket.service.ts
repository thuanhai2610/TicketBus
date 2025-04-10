import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { Ticket, TicketDocument } from './schemas/ticket.schema';
import { Model } from 'mongoose';

import { InjectModel } from '@nestjs/mongoose';
import { TripService } from '../trip/trip.service';
import { SeatService } from '../seats/seat.service';
import { VehicleService } from '../vehicle/vehicle.service';
import { TicketRepository } from './ticket.repsitory';
import { Seat, SeatAvailabilityStatus, SeatDocument } from '../seats/schemas/seat.schema';
import { Trip, TripDocument } from '../trip/schemas/trip.schema';

@Injectable()
export class TicketService {
  constructor(
    @InjectModel(Ticket.name) private ticketModel: Model<TicketDocument>,
    @InjectModel(Seat.name) private seatModel: Model<SeatDocument>,
    @InjectModel(Trip.name) private tripModel: Model<TripDocument>,

    private readonly ticketRepository: TicketRepository,
    private tripService: TripService,
    private seatService: SeatService,
    private vehicleService: VehicleService
  ) {}

  async bookTicket(createTicketDto: CreateTicketDto, ): Promise<Ticket> {
    const trip = await this.tripService.findOne(createTicketDto.tripId);
    if (!trip) {
      throw new NotFoundException('Trip not found');
    }
  
    // Ensure seatNumber is always an array
    const seatNumbers = createTicketDto.seatNumber;
    if (!seatNumbers || seatNumbers.length === 0) {
      throw new BadRequestException('At least one seat number must be provided');
    }
  
    // Check availability for all seats
    const seats = await this.seatService.findByVehicleAndSeatNumbers(trip.vehicleId, seatNumbers);
    if (!seats || seats.length !== seatNumbers.length) {
      throw new NotFoundException('One or more seats not found for this vehicle');
    }
  
    // Check if all seats are available
    const unavailableSeats = seats.filter(
      seat => seat.availabilityStatus !== SeatAvailabilityStatus.AVAILABLE
    );
    if (unavailableSeats.length > 0) {
      throw new BadRequestException(
        `Seats ${unavailableSeats.map(seat => seat.seatNumber).join(', ')} are not available`
      );
    }
  
    // Initialize ticketStatus with a default value
    let ticketStatus: string = 'Ready'; // Default status
  
    // Calculate the exact number of seats being booked for seat count update
    const seatCount = seatNumbers.length;
    console.log(`Booking ${seatCount} seats: ${seatNumbers.join(', ')}`);
  
    if (createTicketDto.status === 'Paid') {
      // If payment is already completed
      ticketStatus = 'Paid';
      // Update the vehicle's seatCount - IMPORTANT: Pass the correct seatCount
      await this.vehicleService.updateSeatCount(trip.vehicleId, false, seatCount);
      // Update seat availability for all seats
      for (const seat of seats) {
        await this.seatService.updateAvailabilityStatus(seat.seatId, SeatAvailabilityStatus.SELECTED);
        console.log(`Set seat ${seat.seatNumber} status to ${SeatAvailabilityStatus.SELECTED}`);
      }
    } else if (createTicketDto.status === 'Booked') {
      // Payment is in process
      ticketStatus = 'Booked';
      // Hold the seats but don't decrease available count yet
      for (const seat of seats) {
        await this.seatService.updateAvailabilityStatus(seat.seatId, SeatAvailabilityStatus.BOOKED);
        console.log(`Set seat ${seat.seatNumber} status to ${SeatAvailabilityStatus.BOOKED}`);
      }
    } else {
      ticketStatus = 'Ready';
      // Mark seats as selected for Ready status
      for (const seat of seats) {
        await this.seatService.updateAvailabilityStatus(seat.seatId, SeatAvailabilityStatus.AVAILABLE);
        console.log(`Set seat ${seat.seatNumber} status to ${SeatAvailabilityStatus.AVAILABLE} (Ready status)`);
      }
    }
  
    // Create the ticket
    const ticket = new this.ticketModel({
      ...createTicketDto,
      ticketPrice: trip.price * seatCount, // Adjust price for multiple seats
      status: ticketStatus,
      bookedAt: new Date(),
    });
  
    // Save the ticket
    return ticket.save();
  }
  async updateTicketStatus(ticketId: string, newStatus: string): Promise<Ticket> {
    const ticket = await this.ticketModel.findOne({ ticketId }).exec();
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }
  
    const oldStatus = ticket.status;
    ticket.status = newStatus;
  
    // Save the status change first to ensure it's recorded
    await ticket.save();
  
    try {
      // Handle seat and vehicle updates based on status change
      const trip = await this.tripService.findOne(ticket.tripId);
      if (!trip || !trip.vehicleId) {
        console.error(`Trip not found or missing vehicleId for ticket ${ticketId}`);
        return ticket; // Early return to avoid further processing
      }
  
      const seatNumbers = Array.isArray(ticket.seatNumber) ? ticket.seatNumber : [ticket.seatNumber];
      const seatCount = seatNumbers.length;
      console.log(`Processing ticket ${ticketId} with ${seatCount} seats: ${seatNumbers.join(', ')}`);
  
      const seats = await this.seatService.findByVehicleAndSeatNumbers(trip.vehicleId, seatNumbers);
      if (!seats || seats.length !== seatNumbers.length) {
        console.warn(`One or more seats not found for vehicle ${trip.vehicleId}`);
      }
  
      if (oldStatus === 'Booked' && newStatus === 'Paid') {
        console.log(`Decrementing seat count for vehicle ${trip.vehicleId} by ${seatCount}`);  
        if (seats) {
          for (const seat of seats) {
            try {
              await this.seatService.updateAvailabilityStatus(seat.seatId, SeatAvailabilityStatus.SELECTED);
              console.log(`Set seat ${seat.seatNumber} status to ${SeatAvailabilityStatus.SELECTED}`);
            } catch (seatError) {
              console.error(`Failed to update seat ${seat.seatNumber}: ${seatError.message}`);
            }
          }
        }
      } else if (oldStatus === 'Booked' && newStatus === 'Paid') {
        // No changes needed as seats are already SELECTED from holdSeat
      } else if (( oldStatus === 'Paid' || oldStatus === 'Booked') && newStatus === 'Cancelled') {
        // When cancelling a ticket, free up all seats
        if (seats) {
          for (const seat of seats) {
            try {
              await this.seatService.updateAvailabilityStatus(seat.seatId, SeatAvailabilityStatus.AVAILABLE);
              console.log(`Set seat ${seat.seatNumber} status to ${SeatAvailabilityStatus.AVAILABLE}`);
            } catch (seatError) {
              console.error(`Failed to update seat ${seat.seatNumber}: ${seatError.message}`);
            }
          }
        }
  
        // If it was paid, increase the available count for all seats
        if (oldStatus === 'Paid') {
          console.log(`Incrementing seat count for vehicle ${trip.vehicleId} by ${seatCount}`);
          await this.vehicleService.updateSeatCount(trip.vehicleId, true, seatCount);
        }
      }
    } catch (error) {
      console.error(`Error processing ticket status change: ${error.message}`);
      // The ticket status is already saved, so we don't throw an error here
    }
  
    return ticket;
  }
  async getTicketById(ticketId: string): Promise<Ticket> {
    const ticket = await this.ticketModel.findOne({ ticketId }).exec();
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }
    return ticket;
  }

  // async getTicketInfoBySeat(tripId: string, seatNumber: string[]): Promise<object> {
  //   const trip = await this.tripService.findOne(tripId);
  //   if (!trip) {
  //     throw new NotFoundException('Trip not found');
  //   }
  //   if (Array.isArray(seatNumber) && seatNumber.length > 1) {
  //     const seats = await this.seatService.findByVehicleAndSeatNumbers(trip.vehicleId, seatNumber);
  //     const unavailableSeats = seats.filter(
  //       seat => seat.availabilityStatus !== SeatAvailabilityStatus.AVAILABLE
  //     );
      
  //     if (unavailableSeats.length > 0) {
  //       throw new BadRequestException(
  //         `Seats ${unavailableSeats.map(seat => seat.seatNumber).join(', ')} are not available`
  //       );
  //     }
      
  //     return {
  //       tripInfo: {
  //         tripId: trip.tripId,
  //         departurePoint: trip.departurePoint,
  //         destinationPoint: trip.destinationPoint,
  //         departureTime: trip.departureTime,
  //         arrivalTime: trip.arrivalTime,
  //       },
  //       seatsInfo: seats.map(seat => ({
  //         seatId: seat.seatId,
  //         seatNumber: seat.seatNumber,
  //         availabilityStatus: seat.availabilityStatus
  //       })),
  //       ticketPrice: trip.price * seats.length
  //     };
  //   } else {
  //     const singleSeatNumber = Array.isArray(seatNumber) ? seatNumber[0] : seatNumber;
  //     const seat = await this.seatService.findByVehicleAndSeatNumber(trip.vehicleId, [singleSeatNumber]);
      
  //     if (seat.availabilityStatus !== SeatAvailabilityStatus.AVAILABLE) {
  //       throw new BadRequestException(`Seat ${seat.seatNumber} is not available (Status: ${seat.availabilityStatus})`);
  //     }
      
  //     return {
  //       tripInfo: {
  //         tripId: trip.tripId,
  //         departurePoint: trip.departurePoint,
  //         destinationPoint: trip.destinationPoint,
  //         departureTime: trip.departureTime,
  //         arrivalTime: trip.arrivalTime,
  //       },
  //       seatInfo: {
  //         seatId: seat.seatId,
  //         seatNumber: seat.seatNumber,
  //         availabilityStatus: seat.availabilityStatus
  //       },
  //       ticketPrice: trip.price
  //     };
  //   }
  // }
  async findByUserId(userId: string): Promise<Ticket[]> {
    return this.ticketModel.find({ userId }).exec();
  }
  
  async findByTripId(tripId: string): Promise<Ticket[]> {
    return this.ticketModel.find({ tripId }).exec();
  }
  async findTicketById(ticketId: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findTicketById(ticketId);
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${ticketId} not found`);
    }
    return ticket;
  }
  async updateTicket(ticketId: string, updateTicketDto: UpdateTicketDto): Promise<Ticket> {
    const ticket = await this.ticketModel.findOne({ ticketId }).exec();
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${ticketId} not found`);
    }

    // If the status is being updated to "Cancelled", update seats and vehicle
    if (updateTicketDto.status === 'Cancelled') {
      const trip = await this.tripModel.findOne({ tripId: ticket.tripId }).exec();
      if (!trip) {
        throw new NotFoundException(`Trip with ID ${ticket.tripId} not found`);
      }

      let seatNumbers: string[] = [];
      if (typeof ticket.seatNumber === 'string') {
        seatNumbers = [ticket.seatNumber];
      } else if (Array.isArray(ticket.seatNumber)) {
        seatNumbers = ticket.seatNumber;
      }

      // Update seats to "Available"
      for (const seatNumber of seatNumbers) {
        await this.seatModel
          .findOneAndUpdate(
            { tripId: ticket.tripId, seatNumber: seatNumber },
            { availabilityStatus: 'Available', updatedAt: new Date() },
            { new: true }
          )
          .exec();
      }

      // Increment vehicle seat count
      await this.vehicleService.increaseSeatCount(trip.vehicleId, seatNumbers.length);
    }

    // Update the ticket with the fields from updateTicketDto
    Object.assign(ticket, updateTicketDto);
    // ticket.updatedAt = new Date(); // Ensure updatedAt is set

    // Save the updated ticket
    return ticket.save();
  }
}