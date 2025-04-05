import { InjectModel, Prop, Schema } from '@nestjs/mongoose';
import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsString, Validate, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { vehicleEnum } from '../enum/vehicle.enum';

export class CreateVehicleDto {


    @IsNotEmpty()
    @IsString()
    vehicleId: string;

   @IsNotEmpty()
    @IsString()
    @Prop({required: true, type: String, ref : 'Vehicle' })
    companyId: string;

  @IsNotEmpty()
  @IsString()
  lisencePlate: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(vehicleEnum)
  vehicleType: string;

  @IsNotEmpty()
  @IsNumber()
  seatCount: number;
}