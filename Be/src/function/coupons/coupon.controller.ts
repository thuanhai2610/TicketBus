// coupons/coupon.controller.ts
import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
  } from '@nestjs/common';
  import { CouponService } from './coupon.service';
  import { CreateCouponDto } from './dto/create-coupon.dto';
  import { UpdateCouponDto } from './dto/update-coupon.dto';
import { ApplyCouponDto } from './dto/apply-coupon.dto';
  
  @Controller('coupons')
  export class CouponController {
    constructor(private readonly couponService: CouponService) {}
  
    @Post()
    create(@Body() dto: CreateCouponDto) {
      return this.couponService.create(dto);
    }
  
    @Get()
    findAll() {
      return this.couponService.findAll();
    }
  
    @Get(':id')
    findOne(@Param('id') id: string) {
      return this.couponService.findOne(id);
    }
  
    @Put(':id')
    update(@Param('id') id: string, @Body() dto: UpdateCouponDto) {
      return this.couponService.update(id, dto);
    }
  
    @Delete(':id')
    remove(@Param('id') id: string) {
      return this.couponService.remove(id);
    }
    @Post('apply')
  async applyCoupon(@Body() dto: ApplyCouponDto) {
    const coupon = await this.couponService.findByCode(dto.code);
    if (!coupon) {
      throw new BadRequestException(`Coupon code ${dto.code} not found`);
    }
    if (coupon.expiresAt && new Date() > new Date(coupon.expiresAt)) {
      throw new BadRequestException(`Coupon ${dto.code} has expired`);
    }
    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (dto.amount * coupon.discountValue) / 100;
    } else {
      discount = coupon.discountValue;
    }
    discount = Math.min(discount, dto.amount);

    const finalAmount = dto.amount - discount;
    return {
      code: coupon.code,
      originalAmount: dto.amount,
      discount,
      finalAmount,
      expiresAt: coupon.expiresAt,
    };
  }
  }
  