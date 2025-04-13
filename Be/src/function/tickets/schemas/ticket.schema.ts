import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TicketDocument = Ticket & Document;

@Schema({ timestamps: true , collection: 'ticket'})
export class Ticket extends Document{
  @Prop({required: true, type: String})
      ticketId: string;
      
 
      @Prop({required: true, type: String, ref : 'Company' })
      companyId: string;
  
      @Prop({required: true, type: String})
      vehicleId: string;
      @Prop({required: true, type: String, ref : 'User' })
     username: string;
   
      @Prop({required: true, type: String, ref : 'Trip' })
      tripId: string;
  
  
      @Prop({required: true, type: [String], ref : 'Seat' })
    seatNumber: string[];
    
    @Prop({required: true, type: Number, ref : 'Trip' })
    ticketPrice: number;
  
    @Prop({required: true, type: String, enum: ['Paid', 'Booked', 'Cancelled'] })
     status: string;
  
     @Prop({ required: true, type: Date })
     bookedAt: Date;

     @Prop()
  fullName?: string;

  @Prop()
  email?: string;

  @Prop()
  phone?: string;

  @Prop()
  address?: string;

   
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);
