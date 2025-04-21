// coupons/schemas/coupon.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Coupon extends Document {
  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true })
  discountType: 'percentage' | 'fixed'; // phần trăm hoặc số tiền

  @Prop({ required: true })
  discountValue: number; // ví dụ: 20 hoặc 50000

  @Prop()
  expiresAt: Date;

  @Prop({ default: false })
  isUsed: boolean;

  @Prop()
  description?: string;
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);
