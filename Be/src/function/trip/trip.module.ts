import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Trip, TripSchema } from './schemas/trip.schema';
import { TripRepository } from './trip.repsitory';
import { TripController } from './trip.controller';
import {  TripService } from './trip.service';
import { Company, CompanySchema } from '../companies/schemas/company.schema';
import { VehicleModule } from '../vehicle/vehicle.module';
import { DriverModule } from '../driver/driver.module';
import { SeatModule } from '../seats/seat.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Trip.name, schema: TripSchema },
      { name: Company.name, schema: CompanySchema },
    
    ]),
    VehicleModule, DriverModule, SeatModule
  ],
  controllers: [TripController],
  providers: [ TripRepository, TripService], 
  exports: [ TripService, MongooseModule.forFeature([{ name: Trip.name, schema: TripSchema }]), TripRepository],
})
export class TripModule {}