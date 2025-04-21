// coupons/dto/create-coupon.dto.ts
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCouponDto {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsEnum(['percentage', 'fixed'])
  discountType: 'percentage' | 'fixed';


  @IsNotEmpty()
  @IsNumber()
  discountValue: number;

  @IsOptional()
  expiresAt?: Date;

  @IsOptional()
  @IsString()
  description?: string;
}
