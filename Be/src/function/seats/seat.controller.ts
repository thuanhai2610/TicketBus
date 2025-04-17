
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put, Query, BadRequestException } from '@nestjs/common';
import { CreateSeatDto } from './dto/create-seat.dto';
import { UpdateSeatDto } from './dto/update-seat.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { SeatService } from './seat.service';

@Controller('seats')

export class SeatController {
  constructor(private readonly seatsService: SeatService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
  async create(@Body() createSeatDto: CreateSeatDto) {
    return this.seatsService.create(createSeatDto);
  }
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'user')
  async getSeats(@Query('vehicleId') vehicleId: string) {
    if (!vehicleId) {
      throw new BadRequestException('vehicleId is required');
    }
  
    const seats = await this.seatsService.findByVehicleId(vehicleId);
    return seats.map(seat => ({
      seatNumber: seat.seatNumber,
      availabilityStatus: seat.availabilityStatus, // e.g., "Available" or "Booked"
      price: seat.price,
      vehicleId: seat.vehicleId,
    }));
  }

  @Get(':seatId')
  @UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
  async findOne(@Param('seatId') seatId: string) {
    return this.seatsService.findOne(seatId);
  }
  @Delete('trip/:tripId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async deleteByTripId(@Param('tripId') tripId: string) {
    const result = await this.seatsService.deleteByTripId(tripId);
    return { message: `Đã xóa ${result.deletedCount} ghế liên quan đến chuyến đi ${tripId}` };
  }
}