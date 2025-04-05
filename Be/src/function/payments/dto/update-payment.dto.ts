import { PartialType } from '@nestjs/mapped-types';
import { CreatePaymentDto, PaymentStatus } from './create-payment.dto';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdatePaymentDto extends PartialType(CreatePaymentDto) {
    @IsNotEmpty()
  @IsEnum(PaymentStatus)
  paymentStatus: PaymentStatus;
}