import { Controller, Get, Post, Body, Param, NotFoundException, BadRequestException, Query, Put } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TripService } from '../trip/trip.service';
import { SeatService } from '../seats/seat.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { SeatAvailabilityStatus } from '../seats/schemas/seat.schema';
import { UpdateTicketDto } from './dto/update-ticket.dto';

@Controller('tickets')
export class TicketController {
  constructor(
    private readonly ticketsService: TicketService,
    private readonly tripService: TripService,
    private readonly seatService: SeatService
  ) {}

  @Get(':ticketId')
  async getTicketById(@Param('ticketId') ticketId: string) {
    return this.ticketsService.getTicketById(ticketId);
  }
  
  @Post('hold-seat')
async holdSeat(@Body() body: { tripId: string, seatNumber: string[], username: string, vehicleId: string }) {
  if (!body.tripId || !body.seatNumber || !body.username || !body.vehicleId) {
    throw new BadRequestException('tripId, seatNumber, username, and vehicleId are required');
  }

  try {
    const trip = await this.tripService.findOne(body.tripId);
    if (!trip) {
      throw new NotFoundException('Trip not found');
    }
    if (trip.vehicleId !== body.vehicleId) {
      throw new BadRequestException('Trip does not belong to the specified vehicle');
    }
    const seats = await this.seatService.findByVehicleId(body.vehicleId);
    if (!seats || seats.length === 0) {
      throw new NotFoundException('No seats found for this vehicle');
    }
    const unavailableSeats = body.seatNumber.filter(seatNumber => {
      const seat = seats.find(s => s.seatNumber === seatNumber);
      return !seat || seat.availabilityStatus === 'Booked';
    });

    if (unavailableSeats.length > 0) {
      throw new BadRequestException(`Seats ${unavailableSeats.join(', ')} are already taken for this vehicle`);
    }
    const ticketId = `TICKET-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const totalPrice = trip.price * body.seatNumber.length;
    
    const ticketData: CreateTicketDto = {
      ticketId, 
      tripId: body.tripId,
      username: body.username,
      seatNumber: body.seatNumber,
      vehicleId: body.vehicleId,
      companyId: trip.companyId, 
      ticketPrice: totalPrice,
      bookedAt: new Date(), 
      status: 'Booked'  
    };

    // Book the ticket
    const ticket = await this.ticketsService.bookTicket(ticketData);
    return {
      message: 'Seats booked successfully',
      ticket: {
        ticketId: ticket.ticketId,
        status: ticket.status,
        ticketPrice: ticket.ticketPrice,
        seatNumber: ticket.seatNumber,
        vehicleId: ticket.vehicleId
      },
      paymentDetails: {
        amount: ticket.ticketPrice,
      }
    };
  } catch (error) {
    throw error;
  }
}
  
  @Get('trip/:tripId')
  async getTicketsByTrip(@Param('tripId') tripId: string) {
    return this.ticketsService.findByTripId(tripId);
  }
  @Put(':ticketId')
async updateTicket(
  @Param('ticketId') ticketId: string,
  @Body() updateTicketDto: UpdateTicketDto,
) {
  try {
    const updatedTicket = await this.ticketsService.updateTicket(ticketId, updateTicketDto);
    return {
      message: 'Ticket updated successfully',
      ticket: updatedTicket,
    };
  } catch (error) {
    if (error instanceof NotFoundException || error instanceof BadRequestException) {
      throw error;
    }
    throw new BadRequestException('Failed to update ticket');
  }
}

@Get('vn-pay/details')
  async getTicketDetailsById(@Query('ticketId') ticketId: string) {
    if (!ticketId) {
      throw new BadRequestException('Ticket ID is required');
    }
    const ticket = await this.ticketsService.getTicketById(ticketId);
    return ticket; 
  }
  @Get('user/:username')
  async getTicketsByUsername(@Param('username') username: string) {
    if (!username) {
      throw new BadRequestException('Username is required');
    }
  
    const tickets = await this.ticketsService.findByUsername(username);
  
    // Lấy thông tin trip cho mỗi vé
    const enrichedTickets = await Promise.all(
      tickets.map(async (ticket) => {
        const trip = await this.ticketsService.findTripById(ticket.tripId);
  
        return {
          ...ticket,
          departurePoint: trip?.departurePoint || null,
          destinationPoint: trip?.destinationPoint || null,
          departureTime: trip?.departureTime || null,
        };
      })
    );
  
    return enrichedTickets;
  }
  
}