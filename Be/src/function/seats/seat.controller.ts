import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put } from '@nestjs/common';
import { CreateSeatDto } from './dto/create-seat.dto';
import { UpdateSeatDto } from './dto/update-seat.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { SeatService } from './seat.service';

@Controller('seats')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class SeatController {
  constructor(private readonly seatsService: SeatService) {}

  @Post()
  async create(@Body() createSeatDto: CreateSeatDto) {
    return this.seatsService.create(createSeatDto);
  }

  @Get(':seatId')
  async findOne(@Param('seatId') seatId: string) {
    return this.seatsService.findOne(seatId);
  }
}