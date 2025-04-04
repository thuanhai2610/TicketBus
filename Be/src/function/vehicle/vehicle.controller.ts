import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put, Query, BadRequestException } from '@nestjs/common';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { VehicleService } from './vehicle.service';

@Controller('vehicle')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Post()
  create(@Body() createVehicleDto: CreateVehicleDto) {
    return this.vehicleService.create(createVehicleDto);
  }

  // @Get()
  // findAll() {
  //   return this.vehicleService.findAll();
  // }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vehicleService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateVehicleDto: UpdateVehicleDto) {
    return this.vehicleService.update(id, updateVehicleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vehicleService.remove(id);
  }

  @Get()
  async findByCompanyId(@Query('companyId') companyId: string) {
    if (!companyId) {
      throw new BadRequestException('companyId query parameter is required');
    }
    
    console.log(`Received query for companyId: '${companyId}'`);
    return this.vehicleService.findByCompanyId(companyId);
  }
}