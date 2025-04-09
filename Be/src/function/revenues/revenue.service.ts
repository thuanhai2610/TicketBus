import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Revenue } from './revenue.schema';
import { Payment } from '../payments/schemas/payment.schema';

@Injectable()
export class RevenueService {
  constructor(
    @InjectModel('Payment') private paymentModel: Model<Payment>,
    @InjectModel('Revenue') private revenueModel: Model<Revenue>,
  ) {}

  // Fetch all revenues
  async findAll(): Promise<Revenue[]> {
    return this.revenueModel.find().exec();
  }


  async updateDailyRevenue(): Promise<void> {
    const completedPayments = await this.paymentModel
      .find({ paymentStatus: 'completed' })
      .exec();
    const revenueMap = new Map<string, { totalTicket: number; totalRevenues: number }>();
    completedPayments.forEach((payment) => {
      const date = new Date(payment.cretedAt).toISOString().split('T')[0]; // e.g., "2025-04-05"
      const current = revenueMap.get(date) || { totalTicket: 0, totalRevenues: 0 };
      current.totalTicket += 1;
      current.totalRevenues += payment.amount || 0;
      revenueMap.set(date, current);
    });

    // Update or insert into revenues collection
    for (const [date, data] of revenueMap) {
      await this.revenueModel.updateOne(
        { date: new Date(date) },
        {
          $set: {
            totalTicket: data.totalTicket,
            totalRevenues: data.totalRevenues,
          },
        },
        { upsert: true }, // Insert if not exists
      );
    }
  }
  // async getTotalRevenue(): Promise<number> {
  //   const allRevenues = await this.revenueModel.find().exec();
  //   return allRevenues.reduce((sum, rev) => sum + (rev.totalRevenues || 0), 0);
  // }
}