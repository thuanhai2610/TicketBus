// seat/dto/create-seat.dto.ts
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateSeatDto {
  @IsNotEmpty()
  @IsString()
  seatId: string;

  @IsNotEmpty()
  @IsString()
  vehicleId: string;

  @IsNotEmpty()
  @IsString()
  tripId: string; 

  @IsNotEmpty()
  @IsString()
  seatNumber: string;

  @IsNotEmpty()
  @IsBoolean()
  isAvailable: boolean;

  @IsNotEmpty()
  @IsNumber()
  price: number; // Added to match the Seat schema
}