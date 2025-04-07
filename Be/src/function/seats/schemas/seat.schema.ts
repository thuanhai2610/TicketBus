import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SeatDocument = Seat & Document;

// Create an enum for seat availability status
export enum SeatAvailabilityStatus {
  AVAILABLE = 'Available',
  BOOKED = 'Booked',
  SELECTED = 'Selected'
}

@Schema({ timestamps: true, collection: 'seat' })
export class Seat {
  @Prop({ required: true, type: String, ref: 'Vehicle' })
  seatId: string;

  @Prop({ required: true, type: String, ref: 'Trip' })
  tripId: string;

  @Prop({ required: true, type: String, ref: 'Vehicle' })
  vehicleId: string;

  @Prop({ required: true, type: String, ref: 'Trip' })
  seatNumber: string;

  @Prop({ 
    type: String, 
    enum: SeatAvailabilityStatus,
    default: SeatAvailabilityStatus.AVAILABLE 
  })
  availabilityStatus: SeatAvailabilityStatus;

  @Prop({ required: true, type: Number })
  price: number;
}

export const SeatSchema = SchemaFactory.createForClass(Seat);