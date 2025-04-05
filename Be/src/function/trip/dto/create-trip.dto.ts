import { InjectModel, Prop, Schema } from '@nestjs/mongoose';
import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsNumber, IsString, Matches, Validate, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Company, CompanyDocument } from 'src/function/companies/schemas/company.schema';
import { Model } from 'mongoose';

export class CreateTripDto {

  @IsNotEmpty()
  @IsString()
  tripId: string;
  
  @IsNotEmpty()
  @IsString()
  @Prop({required: true, type: String, ref : 'Company' })
  companyId: string;
  @IsNotEmpty()
  @IsString()
  vehicleId: string;

  @IsNotEmpty()
  @IsString()
  driverId: string;

  @IsNotEmpty()
  @IsString()
  departurePoint: string;

  @IsNotEmpty()
  @IsString()
  destinationPoint: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{2}-\d{2}-\d{4}$/)
  departureDate: string; 
  
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  departureHour: string; 

  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{2}-\d{2}-\d{4}$/)
  arrivalDate: string; 

  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  arrivalHour: string; 
  
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsNotEmpty()
  @IsEnum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
  status: string;
}