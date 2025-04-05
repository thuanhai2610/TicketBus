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

@Injectable()
export class TicketService {
  constructor(
    @InjectModel(Ticket.name) private ticketModel: Model<TicketDocument>,
    private readonly ticketRepository: TicketRepository,
    private tripService: TripService,
    private seatService: SeatService,
    private vehicleService: VehicleService
  ) {}

  async bookTicket(createTicketDto: CreateTicketDto): Promise<Ticket> {
    const trip = await this.tripService.findOne(createTicketDto.tripId);
    if (!trip) {
      throw new NotFoundException('Trip not found');
    }
    const seat = await this.seatService.findByVehicleAndSeatNumber(trip.vehicleId, createTicketDto.seatNumber);
    if (!seat) {
      throw new NotFoundException('Seat not found for this vehicle');
    }
    if (!seat.isAvailable) {
      throw new BadRequestException('Seat is not available');
    }
    let ticketStatus: string;
    
    if (createTicketDto.status === 'paid') {
      // If payment is already completed
      ticketStatus = 'paid';
      // Update the vehicle's seatCount (decrement available seats)
      await this.vehicleService.updateSeatCount(trip.vehicleId);
      // Update seat availability
      await this.seatService.updateAvailability(seat.seatId, false);
    } else if (createTicketDto.status === 'ordered') {
      // Payment is in process
      ticketStatus = 'ordered';
      // Hold the seat but don't decrease available count yet
      await this.seatService.updateAvailability(seat.seatId, false);
    } else {
      // Initial booking state, not paid yet
      ticketStatus = 'Ready';
      // No need to update seat or vehicle counts at this point
    }

    // Create the ticket
    const ticket = new this.ticketModel({
      ...createTicketDto,
      
      ticketPrice: trip.price,
      status: ticketStatus,
      bookedAt: new Date(),
    });

    // Save the ticket
    return ticket.save();
  }

  // Update ticket status
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
      if (oldStatus !== 'Paid' && newStatus === 'Paid') {
        // When moving to Paid status, explicitly update vehicle's available seat count
        const trip = await this.tripService.findOne(ticket.tripId);
        if (trip && trip.vehicleId) {
          console.log(`Decrementing seat count for vehicle ${trip.vehicleId}`);
          await this.vehicleService.updateSeatCount(trip.vehicleId, false); // Explicitly set increment=false
        } else {
          console.error(`Trip not found or missing vehicleId for ticket ${ticketId}`);
        }
        
        // Also handle the seat status
        try {
          const seat = await this.seatService.findByVehicleAndSeatNumber(
            trip.vehicleId,
            ticket.seatNumber
          );
          if (seat) {
            await this.seatService.updateAvailability(seat.seatId, false);
          }
        } catch (seatError) {
          console.error(`Failed to update seat: ${seatError.message}`);
        }
      } else if (oldStatus === 'Ready' && newStatus === 'Ordered') {
        // When moving from Ready to Ordered, mark seat as unavailable
        const trip = await this.tripService.findOne(ticket.tripId);
        try {
          const seat = await this.seatService.findByVehicleAndSeatNumber(
            trip.vehicleId,
            ticket.seatNumber
          );
          if (seat) {
            await this.seatService.updateAvailability(seat.seatId, false);
          }
        } catch (seatError) {
          console.error(`Failed to update seat: ${seatError.message}`);
        }
      } else if ((oldStatus === 'Ordered' || oldStatus === 'Paid') && newStatus === 'Cancelled') {
        // When cancelling a ticket that was ordered or paid, free up the seat
        const trip = await this.tripService.findOne(ticket.tripId);
        
        try {
          const seat = await this.seatService.findByVehicleAndSeatNumber(
            trip.vehicleId,
            ticket.seatNumber
          );
          if (seat) {
            await this.seatService.updateAvailability(seat.seatId, true);
          }
        } catch (seatError) {
          console.error(`Failed to update seat: ${seatError.message}`);
        }
        
        // If it was paid, increase the available count
        if (oldStatus === 'Paid') {
          await this.vehicleService.updateSeatCount(trip.vehicleId, true); // increment=true
        }
      }
    } catch (error) {
      console.error(`Error processing ticket status change: ${error.message}`);
      // The ticket status is already saved, so we don't throw an error here
      // to avoid leaving the status update incomplete
    }
    
    return ticket;
  }
  // Get ticket status
  async getTicketStatus(ticketId: string): Promise<string> {
    const ticket = await this.ticketModel.findOne({ ticketId }).exec();
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }
    return ticket.status;
  }

  // New method to get ticket information by seat and trip
  async getTicketInfoBySeat(tripId: string, seatNumber: string): Promise<object> {
    const trip = await this.tripService.findOne(tripId);
    if (!trip) {
      throw new NotFoundException('Trip not found');
    }
    
    const seat = await this.seatService.findByVehicleAndSeatNumber(trip.vehicleId, seatNumber);
    if (!seat) {
      throw new NotFoundException('Seat not found for this vehicle');
    }
    
    if (!seat.isAvailable) {
      throw new BadRequestException('Seat is already taken');
    }
    
    return {
      tripInfo: {
        tripId: trip.tripId,
        departurePoint: trip.departurePoint,
        destinationPoint: trip.destinationPoint,
        departureTime: trip.departureTime,
        arrivalTime: trip.arrivalTime,
      },
      seatInfo: {
        seatId: seat.seatId,
        seatNumber: seat.seatNumber,
        isAvailable: seat.isAvailable
      },
      ticketPrice: trip.price
    };
  }
  
  // Find tickets by user ID
  async findByUserId(userId: string): Promise<Ticket[]> {
    return this.ticketModel.find({ userId }).exec();
  }
  
  // Find tickets by trip ID
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
}