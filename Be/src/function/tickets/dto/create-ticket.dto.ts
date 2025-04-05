import { Prop } from '@nestjs/mongoose';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateTicketDto {
    @IsNotEmpty()
    @IsString()
    ticketId: string;
    
  @IsNotEmpty()
    @IsString()
    @Prop({required: true, type: String, ref : 'Company' })
    companyId: string;

    @IsNotEmpty()
    @IsString()
    @Prop({required: true, type: String, ref : 'User' })
   userId: string;


    @IsNotEmpty()
    @IsString()
    @Prop({required: true, type: String, ref : 'Trip' })
    tripId: string;


  @IsNotEmpty()
  @IsString()
  seatNumber: string;

  @IsNotEmpty()
  ticketPrice: number;

  @IsNotEmpty()
   @IsEnum(['Paid', 'Ordered',  'Cancelled'])
   status: string;

   @IsNotEmpty()
   @IsString()
   bookedAt: Date;
}