import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put, Query, BadRequestException } from '@nestjs/common';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { VehicleService } from './vehicle.service';

@Controller('vehicle')


export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Post()
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  create(@Body() createVehicleDto: CreateVehicleDto) {
    return this.vehicleService.create(createVehicleDto);
  }

  // @Get()
  // findAll() {
  //   return this.vehicleService.findAll();
  // }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  @Get(':vehicleId')
  findOne(@Param('vehicleId') vehicleId: string) {
    return this.vehicleService.findOne(vehicleId);
  }
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() updateVehicleDto: UpdateVehicleDto) {
    return this.vehicleService.update(id, updateVehicleDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.vehicleService.remove(id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findByCompanyId(@Query('companyId') companyId: string) {
    if (!companyId) {
      throw new BadRequestException('companyId query parameter is required');
    }
    
    console.log(`Received query for companyId: '${companyId}'`);
    return this.vehicleService.findByCompanyId(companyId);
  }
}