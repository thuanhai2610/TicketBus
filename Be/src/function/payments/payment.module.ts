import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from './schemas/payment.schema';
import { PaymentRepository } from './payment.repsitory';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { TicketService } from '../tickets/ticket.service';
import { TicketRepository } from '../tickets/ticket.repsitory';
import { VehicleService } from '../vehicle/vehicle.service';
import { CompaniesModule } from '../companies/company.module';
import { TicketModule } from '../tickets/ticket.module';
import { TripModule } from '../trip/trip.module';
import { VehicleModule } from '../vehicle/vehicle.module';
import { MailModule } from '../tickets/mail/mail.module';
import { CouponService } from '../coupons/coupon.service';
import { CouponModule } from '../coupons/coupon.module';



@Module({
  imports: [
    MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }   
    ]), CompaniesModule, TicketModule, TripModule, VehicleModule, MailModule, CouponModule
  ],
  controllers: [PaymentController],
  providers: [PaymentService, PaymentRepository, TicketService, TicketRepository, CouponService],
  exports: [PaymentService],
})
export class PaymentModule {}