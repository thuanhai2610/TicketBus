import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Trip, TripSchema } from './schemas/trip.schema';
import { TripRepository } from './trip.repsitory';
import { CompaniesController } from './trip.controller';
import { CompaniesService } from './trip.service';
import { Company, CompanySchema } from '../companies/schemas/company.schema';
import { VehicleModule } from '../vehicle/vehicle.module';
import { DriverModule } from '../driver/driver.module';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: Trip.name, schema: TripSchema },
      { name: Company.name, schema: CompanySchema },
    ]),
    VehicleModule, DriverModule
  ],
  controllers: [CompaniesController],
  providers: [CompaniesService, TripRepository],
  exports: [CompaniesService],
})
export class TripModule {}