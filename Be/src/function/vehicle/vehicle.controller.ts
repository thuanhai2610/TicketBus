import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put, Query, BadRequestException } from '@nestjs/common';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { VehicleService } from './vehicle.service';
import { Vehicle } from './schemas/vehicle.schema';

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
  @Put(':vehicleId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('vehicleId') vehicleId: string, @Body() updateVehicleDto: UpdateVehicleDto) {
    return this.vehicleService.update(vehicleId, updateVehicleDto);
  }

  @Delete(':vehicleId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('vehicleId') vehicleId: string) {
    return this.vehicleService.remove(vehicleId);
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

  @Get('get/details')
  async findOnez(@Query('vehicleId') vehicleId: string): Promise<Vehicle> {
    if (!vehicleId) {
      throw new BadRequestException('Vehicle ID is required');
    }
    return this.vehicleService.findOne(vehicleId); // This will throw NotFoundException if the vehicle isn't found
  }
}