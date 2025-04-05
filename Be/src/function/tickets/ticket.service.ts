import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { Ticket, TicketDocument } from './schemas/ticket.schema';
import { TicketRepository } from './ticket.repsitory';
import { Model } from 'mongoose';

import { InjectModel } from '@nestjs/mongoose';
import { Company, CompanyDocument } from '../companies/schemas/company.schema';
import { TripService } from '../trip/trip.service';
import { SeatService } from '../seats/seat.service';
import { VehicleService } from '../vehicle/vehicle.service';

@Injectable()
export class TicketService {
  constructor(@InjectModel(Ticket.name) private ticketModel: Model<TicketDocument>,
  private tripService: TripService,
  private seatService: SeatService,
private vehicleService: VehicleService) {}

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
    ticketStatus = 'ready';
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

// Add a new method to update ticket status
async updateTicketStatus(ticketId: string, newStatus: string): Promise<Ticket> {
  const ticket = await this.ticketModel.findOne({ ticketId }).exec();
  if (!ticket) {
    throw new NotFoundException('Ticket not found');
  }

  const oldStatus = ticket.status;
  ticket.status = newStatus;

  // Handle seat and vehicle updates based on status change
  if (oldStatus !== 'paid' && newStatus === 'paid') {
    // When moving to paid status, update vehicle seat count
    const trip = await this.tripService.findOne(ticket.tripId);
    await this.vehicleService.updateSeatCount(trip.vehicleId);
  } else if (oldStatus === 'ready' && newStatus === 'ordered') {
    // When moving from ready to ordered, mark seat as unavailable
    const trip = await this.tripService.findOne(ticket.tripId);
    const seat = await this.seatService.findByVehicleAndSeatNumber(
      trip.vehicleId, 
      ticket.seatNumber
    );
    await this.seatService.updateAvailability(seat.seatId, false);
  } else if ((oldStatus === 'ordered' || oldStatus === 'paid') && newStatus === 'cancelled') {
    // When cancelling a ticket that was ordered or paid, free up the seat
    const trip = await this.tripService.findOne(ticket.tripId);
    const seat = await this.seatService.findByVehicleAndSeatNumber(
      trip.vehicleId, 
      ticket.seatNumber
    );
    await this.seatService.updateAvailability(seat.seatId, true);
    
    // If it was paid, increase the available count
    if (oldStatus === 'paid') {
      await this.vehicleService.updateSeatCount(trip.vehicleId, true); // increment=true
    }
  }

  return ticket.save();
}

// Enhancement for the existing getTicketStatus method
async getTicketStatus(ticketId: string): Promise<string> {
  const ticket = await this.ticketModel.findOne({ ticketId }).exec();
  if (!ticket) {
    throw new NotFoundException('Ticket not found');
  }
  return ticket.status;
}
}