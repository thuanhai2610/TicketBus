import { Prop } from '@nestjs/mongoose';
import { Expose, Type } from 'class-transformer';
import { IsArray, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CreateTripDto } from 'src/function/trip/dto/create-trip.dto';
import { Trip } from 'src/function/trip/schemas/trip.schema';
import { CreateVehicleDto } from 'src/function/vehicle/dto/create-vehicle.dto';
import { Vehicle } from 'src/function/vehicle/schemas/vehicle.schema';

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