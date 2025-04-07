import { Controller, Get, Post, Body, Param, NotFoundException, BadRequestException, Query } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TripService } from '../trip/trip.service';
import { SeatService } from '../seats/seat.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { SeatAvailabilityStatus } from '../seats/schemas/seat.schema';

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

  @Get(':ticketId/status')
  async getTicketStatus(@Param('ticketId') ticketId: string) {
    return this.ticketsService.getTicketStatus(ticketId);
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
  async holdSeat(@Body() body: { tripId: string, seatNumber: string[], userId: string }) {
    if (!body.tripId || !body.seatNumber || !body.userId) {
      throw new BadRequestException('tripId, seatNumber, and userId are required');
    }
  
    try {
      // Fetch the trip to get companyId and ticketPrice
      const trip = await this.tripService.findOne(body.tripId);
      if (!trip) {
        throw new NotFoundException('Trip not found');
      }
  
      // Generate a unique ticketId
      const ticketId = `TICKET-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Calculate total price based on number of seats
      const totalPrice = trip.price * body.seatNumber.length;
      
      const ticketData: CreateTicketDto = {
        ticketId, 
        tripId: body.tripId,
        userId: body.userId,
        seatNumber: body.seatNumber,
        companyId: trip.companyId, 
        ticketPrice: totalPrice,
        bookedAt: new Date(), 
        status: 'Booked'  
      };
  
      const ticket = await this.ticketsService.bookTicket(ticketData);
      return {
        message: 'Seats booked successfully',
        ticket: {
          ticketId: ticket.ticketId,
          status: ticket.status,
          ticketPrice: ticket.ticketPrice,
          seatNumber: ticket.seatNumber
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
}