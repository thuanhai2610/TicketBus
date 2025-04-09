import { Schema, Document } from 'mongoose';

export interface Revenue extends Document {
  totalTicket: number;
  totalRevenues: number;
  date: Date;
}

export const RevenueSchema = new Schema({
  totalTicket: { type: Number, required: true }, // Number of completed tickets
  totalRevenues: { type: Number, required: true }, // Total revenue in VND
  date: { type: Date, required: true }, // Date of revenue (e.g., "2025-04-05")
});