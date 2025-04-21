// payments/dto/create-payment.dto.ts
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

enum PaymentMethod {
  CASH = 'cash',
  BANK_TRANSFER = 'vn_pay',
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsString()
  ticketId: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;
  @IsNotEmpty()
  @IsString()
  companyId: string;
  
  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsEnum(PaymentStatus)
  paymentStatus: PaymentStatus;
  tripId: string;
  cretedAt: Date;
  paymentUrl?: string;
  @IsString()
  @IsOptional()
  couponCode?: string;
}

