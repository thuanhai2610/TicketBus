import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SeatDocument = Seat & Document;

@Schema({ timestamps: true , collection: 'seat'})
export class Seat {
  @Prop({required: true, type: String, ref : 'Vehicle' })
      seatId: string;
      
      @Prop({required: true, type: String, ref : 'Vehicle' })
     vehicleId: string;
     @Prop({required: true, type: String, ref : 'Trip' })
     seatNumber: string;
     @Prop({ type: Boolean, default: 'true' })
     isAvailable: boolean;
}

export const SeatSchema = SchemaFactory.createForClass(Seat);

