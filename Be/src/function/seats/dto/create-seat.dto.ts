import { Prop } from '@nestjs/mongoose';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreateSeatDto {
    @IsNotEmpty()
    @IsString()
    seatId: string;
    
  @IsNotEmpty()
    @IsString()
    @Prop({required: true, type: String, ref : 'Vehicle' })
   vehicleId: string;

   @IsNotEmpty()
   @IsString()
   seatNumber: string;
    
   @IsNotEmpty()
   @IsBoolean()
   isAvailable: boolean
}