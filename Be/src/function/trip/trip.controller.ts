import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put, BadRequestException, Query, NotFoundException } from '@nestjs/common';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import {  TripService } from './trip.service';
import { Trip } from './schemas/trip.schema';

@Controller('trip')
export class TripController {
  constructor(private readonly tripService: TripService,
    
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() createTripDto: CreateTripDto) {
    return this.tripService.create(createTripDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() updateTripDto: UpdateTripDto) {
    return this.tripService.update(id, updateTripDto);
  }

  @Delete(':tripId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('tripId') tripId: string) {
    return this.tripService.remove(tripId);
  }
   @Get()
   @UseGuards(JwtAuthGuard, RolesGuard)
   @Roles('admin')
    async findByCompanyId(@Query('companyId') companyId: string) {
      if (!companyId) {
        throw new BadRequestException('companyId query parameter is required');
      }
      
      console.log(`Received query for companyId: '${companyId}'`);
      return this.tripService.findByCompanyId(companyId);
    }
    @Get('all')
    @UseGuards(JwtAuthGuard, RolesGuard) 
    @Roles('admin', 'user')
    async findAll(): Promise<Trip[]> {
      console.log('Reached findAll in TripController');
      const trips = await this.tripService.findAll();
      console.log('Trips returned from service:', trips);
      return trips;
    }
    @Get('total')
    async getTotalTrip() {
      const trips = await this.tripService.findAll();
      const totalTrips = trips.length;
      return { totalTrips };
    }
    @Get('tripdetails')
  async findOne(@Query('tripId') tripId: string): Promise<Trip> {
    if (!tripId) {
      throw new BadRequestException('Trip ID is required');
    }
    const trip = await this.tripService.findOne(tripId);
    if (!trip) {
      throw new NotFoundException(`Trip with ID ${tripId} not found`);
    }
    return trip;
  }
  @Get('search')
async searchTrips(
  @Query('departurePoint') departurePoint: string,
  @Query('destinationPoint') destinationPoint: string,
  @Query('date') date: string
) {
  if (!departurePoint || !destinationPoint || !date) {
    throw new BadRequestException('departurePoint, destinationPoint and date are required');
  }

  return this.tripService.searchTrips(departurePoint, destinationPoint, date);
}
}