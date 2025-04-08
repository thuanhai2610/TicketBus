import { Prop } from '@nestjs/mongoose';
import { IsArray, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

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
    vehicleId: string;

    @IsNotEmpty()
    @IsString()
    @Prop({required: true, type: String, ref : 'User' })
   username: string;


    @IsNotEmpty()
    @IsString()
    @Prop({required: true, type: String, ref : 'Trip' })
    tripId: string;


  @IsNotEmpty()
 
  @IsArray({ each: true })
  seatNumber: string[];

  @IsNotEmpty()
  ticketPrice: number;

  @IsNotEmpty()
   @IsEnum(['Paid', 'Booked',  'Cancelled'])
   status: string;

   @IsNotEmpty()
   @IsString()
   bookedAt: Date;
   @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;
}