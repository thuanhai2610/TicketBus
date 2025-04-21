import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Coupon } from "./schemas/coupon.schema";
import { Model } from "mongoose";
import { CreateCouponDto } from "./dto/create-coupon.dto";
import { UpdateCouponDto } from "./dto/update-coupon.dto";

// coupons/coupon.service.ts
@Injectable()
export class CouponService {
  constructor(@InjectModel(Coupon.name) private couponModel: Model<Coupon>) {}
  async create(dto: CreateCouponDto): Promise<Coupon> {
    return this.couponModel.create(dto);
  }

  async findAll(): Promise<Coupon[]> {
    return this.couponModel.find();
  }

  async findByCode(code: string): Promise<Coupon | null> {
    return this.couponModel.findOne({ code });
  }

  async findOne(id: string): Promise<Coupon | null> {
    return this.couponModel.findById(id);
  }

  async update(id: string, dto: UpdateCouponDto): Promise<Coupon | null> {
    return this.couponModel.findByIdAndUpdate(id, dto, { new: true });
  }

  async remove(id: string): Promise<void> {
    await this.couponModel.findByIdAndDelete(id);
  }
  async calculateDiscount(code: string, originalAmount: number): Promise<number> {
    const coupon = await this.couponModel.findOne({ code });

    if (!coupon) throw new NotFoundException('Coupon not found');
    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      throw new BadRequestException('Coupon expired');
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (originalAmount * coupon.discountValue) / 100;
    } else if (coupon.discountType === 'fixed') {
      discount = coupon.discountValue;
    }

    // Giới hạn không vượt quá tổng
    return Math.min(discount, originalAmount);
  }
}
