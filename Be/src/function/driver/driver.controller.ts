import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put } from '@nestjs/common';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { DriverService } from './driver.service';

@Controller('drivers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class DriverController {
  constructor(private readonly driversService: DriverService) {}

  @Post()
  create(@Body() createDriverDto: CreateDriverDto) {
    return this.driversService.create(createDriverDto);
  }

  @Get('all')
  findAll() {
    return this.driversService.findAll();
  }

  @Get(':driverId')
  findOne(@Param('driverId') driverId: string) {
    return this.driversService.findOne(driverId);
  }

  @Put(':driverId')
  update(@Param('driverId') driverId: string, @Body() updateDriverDto: UpdateDriverDto) {
    return this.driversService.update(driverId, updateDriverDto);
  }

  @Delete(':driverId')
  remove(@Param('driverId') driverId: string) {
    return this.driversService.remove(driverId);
  }
}