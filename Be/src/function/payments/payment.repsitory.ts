// payments/repositories/payment.repository.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Payment, PaymentDocument } from './schemas/payment.schema';


@Injectable()
export class PaymentRepository {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
  ) {}

  async createPayment(data: {  paymentId: string;
    ticketId: string;
    companyId: string;
    amount: number;
    paymentMethod: string;
    paymentStatus: string;
  }): Promise<PaymentDocument> {
    const payment = new this.paymentModel({
      ...data,
      paymentTime: new Date(),
    });
    return payment.save();
  }

  async findPaymentById(paymentId: string): Promise<PaymentDocument | null> {
    return this.paymentModel.findOne({ paymentId }).exec();
  }

  async findPaymentsByTicketId(ticketId: string): Promise<PaymentDocument[]> {
    return this.paymentModel.find({ ticketId }).exec();
  }

  async updatePaymentStatus(
    paymentId: string,
    paymentStatus: string,
  ): Promise<PaymentDocument | null > {
    return this.paymentModel
      .findOneAndUpdate(
        { paymentId },
        { paymentStatus, updatedAt: new Date() },
        { new: true },
      )
      .exec();
  }
}