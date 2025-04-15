import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Seat, SeatSchema } from './schemas/seat.schema';
import { SeatRepository } from './seat.repsitory';
import { SeatController } from './seat.controller';
import { SeatService } from './seat.service';
import { Company, CompanySchema } from '../companies/schemas/company.schema';
import { VehicleModule } from '../vehicle/vehicle.module';
import { SeatCleanupService } from './seat-cleanup.service';



@Module({
  imports: [
    MongooseModule.forFeature([{ name: Seat.name, schema: SeatSchema },
       { name: Company.name, schema: CompanySchema }
    ]),VehicleModule,
  ], 
  controllers: [SeatController],
  providers: [SeatService, SeatRepository, SeatCleanupService],
  exports: [SeatService, MongooseModule],
})
export class SeatModule {}