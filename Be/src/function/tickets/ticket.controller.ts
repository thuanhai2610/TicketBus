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

  @Post('book')
  async bookTicket(@Body() createTicketDto: CreateTicketDto) {
    try {
      // Use the existing bookTicket service method
      const ticket = await this.ticketsService.bookTicket(createTicketDto);
      return {
        message: 'Ticket booked successfully',
        ticket
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to book ticket');
    }
  }

  @Get(':ticketId')
  async getTicketById(@Param('ticketId') ticketId: string) {
    return this.ticketsService.getTicketById(ticketId);
  }
  
  // New endpoint to get ticket information when a seat is selected
  @Post('get-seat-info')
  async getSeatInfo(@Body() body: { tripId: string, seatNumber: string[] }) {
    if (!body.tripId || !body.seatNumber) {
      throw new BadRequestException('tripId and seatNumber are required');
    }
    
    // Use the new service method to get ticket info by seat
    return this.ticketsService.getTicketInfoBySeat(body.tripId, body.seatNumber);
  }
  
  // New endpoint to place a temporary hold on a seat before payment
  
  @Post('hold-seat')
async holdSeat(@Body() body: { tripId: string, seatNumber: string[], username: string, vehicleId: string }) {
  if (!body.tripId || !body.seatNumber || !body.username || !body.vehicleId) {
    throw new BadRequestException('tripId, seatNumber, username, and vehicleId are required');
  }

  try {
    // Fetch the trip to get companyId, ticketPrice, and vehicleId
    const trip = await this.tripService.findOne(body.tripId);
    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    // Verify that the trip belongs to the specified vehicleId
    if (trip.vehicleId !== body.vehicleId) {
      throw new BadRequestException('Trip does not belong to the specified vehicle');
    }

    // Fetch seats for the specific vehicleId to check availability
    const seats = await this.seatService.findByVehicleId(body.vehicleId);
    if (!seats || seats.length === 0) {
      throw new NotFoundException('No seats found for this vehicle');
    }

    // Check if the requested seats are available
    const unavailableSeats = body.seatNumber.filter(seatNumber => {
      const seat = seats.find(s => s.seatNumber === seatNumber);
      return !seat || seat.availabilityStatus === 'Booked';
    });

    if (unavailableSeats.length > 0) {
      throw new BadRequestException(`Seats ${unavailableSeats.join(', ')} are already taken for this vehicle`);
    }

    // Generate a unique ticketId
    const ticketId = `TICKET-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Calculate total price based on number of seats
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
  
  @Post(':ticketId/update-status')
  async updateTicketStatus(
    @Param('ticketId') ticketId: string,
    @Body() body: { status: string }
  ) {
    if (!body.status) {
      throw new BadRequestException('Status is required');
    }
    
    const validStatuses = ['Ready', 'Ordered', 'Paid', 'Cancelled'];
    if (!validStatuses.includes(body.status)) {
      throw new BadRequestException(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }
    
    return this.ticketsService.updateTicketStatus(ticketId, body.status);
  }
  
  // Get tickets by user ID
  @Get('user/:userId')
  async getTicketsByUser(@Param('userId') userId: string) {
    return this.ticketsService.findByUserId(userId);
  }
  
  // Get tickets by trip ID
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
}