import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Coupon, CouponSchema } from "./schemas/coupon.schema";
import { CouponService } from "./coupon.service";
import { CouponController } from "./coupon.controller";

@Module({
    imports: [MongooseModule.forFeature([{ name: Coupon.name, schema: CouponSchema }])],
    controllers: [CouponController],
    providers: [CouponService],
    exports: [CouponService, MongooseModule], // cần để dùng bên PaymentService
  })
  export class CouponModule {}
  