import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put, Query } from '@nestjs/common';
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
  async findByTripId(@Query('tripId') tripId: string) {
    return this.seatsService.findByTripId(tripId);
  }
  @Get(':seatId')
  @UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
  async findOne(@Param('seatId') seatId: string) {
    return this.seatsService.findOne(seatId);
  }
}