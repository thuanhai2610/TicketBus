import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TicketDocument = Ticket & Document;

@Schema({ timestamps: true , collection: 'ticket'})
export class Ticket {
  @Prop({required: true, type: String})
      ticketId: string;
      
 
      @Prop({required: true, type: String, ref : 'Company' })
      companyId: string;
  
    
      @Prop({required: true, type: String, ref : 'User' })
     userId: string;
  
  
   
      @Prop({required: true, type: String, ref : 'Trip' })
      tripId: string;
  
  
      @Prop({required: true, type: String, ref : 'Seat' })
    seatNumber: string;
    
    @Prop({required: true, type: Number, ref : 'Trip' })
    ticketPrice: number;
  

    @Prop({required: true, type: String, enum: ['Ready', 'Paid', 'Ordered', 'Cancelled'], default: 'Ready' })
     status: string;
  
     @Prop({ required: true, type: Date })
     bookedAt: Date;
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);
