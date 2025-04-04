import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put, BadRequestException, Query } from '@nestjs/common';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import {  TripService } from './trip.service';

@Controller('trip')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class TripController {
  constructor(private readonly tripService: TripService) {}

  @Post()
  create(@Body() createTripDto: CreateTripDto) {
    return this.tripService.create(createTripDto);
  }

  // @Get()
  // findAll() {
  //   return this.tripService.findAll();
  // }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tripService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateTripDto: UpdateTripDto) {
    return this.tripService.update(id, updateTripDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tripService.remove(id);
  }
   @Get()
    async findByCompanyId(@Query('companyId') companyId: string) {
      if (!companyId) {
        throw new BadRequestException('companyId query parameter is required');
      }
      
      console.log(`Received query for companyId: '${companyId}'`);
      return this.tripService.findByCompanyId(companyId);
    }
}