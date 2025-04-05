import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put, NotFoundException } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { TicketService } from './ticket.service';
import { TripService } from '../trip/trip.service';

@Controller('tickets')
// @UseGuards(JwtAuthGuard, RolesGuard)
// @Roles('admin')
export class TicketController {
  constructor(private readonly ticketsService: TicketService,
    private readonly tripService: TripService
  ) {}
  @Post('book')
  async bookTicket(@Body() body: any) {
    console.log('Received body:', body); // Debug log
    const trip = await this.tripService.findOne(body.tripId);
    if (!trip) {
      throw new NotFoundException(`Trip with ID ${body.tripId} not found`);
    }
    // Proceed with booking logic (e.g., create ticket)
    return {
      message: 'Ticket booked successfully',
      tripId: body.tripId,
      // Add ticket creation logic here if needed
    };
  }

  @Get(':ticketId/status')
  async getTicketStatus(@Param('ticketId') ticketId: string) {
    return this.ticketsService.getTicketStatus(ticketId);
  }
}