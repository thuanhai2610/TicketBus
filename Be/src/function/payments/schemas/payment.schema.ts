// payments/schemas/payment.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Model } from 'mongoose';
import { TicketDocument } from 'src/function/tickets/schemas/ticket.schema';

export type PaymentDocument = Payment & Document;

@Schema({ timestamps: true, collection: 'payments' })
export class Payment extends Document {
  @Prop({ required: true, type: String })
  paymentId: string;

  @Prop({ required: true, type: String, ref: 'Ticket' })
  ticketId: string;
  // @Prop({ required: true, type: String, ref: 'Trip' })
  tripId: string;
  @Prop({ required: true, type: String, ref: 'Company' })
  companyId: string;

  @Prop({ required: true, type: Number })
  amount: number;

  @Prop({ required: true, enum: ['cash', 'vn_pay'] })
  paymentMethod: string;

  @Prop({  enum: ['pending', 'completed', 'failed'] })
  paymentStatus: string;

  @Prop({ required: true, type: Date, default: Date.now })
  paymentTime: Date;

  cretedAt: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

// Middleware để kiểm tra companyId trước khi lưu
PaymentSchema.pre('save', async function (next) {
  const payment = this as PaymentDocument;

  // Kiểm tra companyId
  const company = await (this.model('Company') as Model<Document>).findOne({ companyId: payment.companyId }).exec();
  if (!company) {
    const error = new Error(`Company with ID ${payment.companyId} does not exist`);
    return next(error);
  }

  // Kiểm tra ticketId
  const ticket = await (this.model('Ticket') as Model<TicketDocument>).findOne({ ticketId: payment.ticketId }).exec();
  if (!ticket) {
    const error = new Error(`Ticket with ID ${payment.ticketId} does not exist`);
    return next(error);
  }

  // Kiểm tra amount có khớp với ticketPrice không
  // if (payment.amount !== ticket.ticketPrice) {
  //   const error = new Error(
  //     `Payment amount (${payment.amount}) does not match ticket price (${ticket.ticketPrice})`,
  //   );
  //   return next(error);
  // }

  next();
}
);