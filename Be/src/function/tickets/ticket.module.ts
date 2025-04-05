import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Ticket, TicketSchema } from './schemas/ticket.schema';
import { TicketRepository } from './ticket.repsitory';
import { TicketController } from './ticket.controller';
import { TicketService } from './ticket.service';
import { Company, CompanySchema } from '../companies/schemas/company.schema';
import { Seat, SeatSchema } from '../seats/schemas/seat.schema';
import { TripModule } from '../trip/trip.module';
import { SeatModule } from '../seats/seat.module';
import { VehicleModule } from '../vehicle/vehicle.module';



@Module({
  imports: [
    MongooseModule.forFeature([{ name: Ticket.name, schema: TicketSchema },
       { name: Company.name, schema: CompanySchema }, 
       { name: Seat.name, schema: SeatSchema },
    ]), TripModule, SeatModule, VehicleModule
  ],
  controllers: [TicketController],
  providers: [TicketService, TicketRepository],
  exports: [TicketService, MongooseModule.forFeature([{ name: Ticket.name, schema: TicketSchema }]), TicketRepository, SeatModule],
})
export class TicketModule {}