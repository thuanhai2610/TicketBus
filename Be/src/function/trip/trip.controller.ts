import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put, BadRequestException, Query } from '@nestjs/common';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import {  TripService } from './trip.service';
import { Trip } from './schemas/trip.schema';

@Controller('trip')
export class TripController {
  constructor(private readonly tripService: TripService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() createTripDto: CreateTripDto) {
    return this.tripService.create(createTripDto);
  }

  

  // @Get(':id')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('admin')
  // findOne(@Param('id') id: string) {
  //   return this.tripService.findOne(id);
  // }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() updateTripDto: UpdateTripDto) {
    return this.tripService.update(id, updateTripDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.tripService.remove(id);
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
}