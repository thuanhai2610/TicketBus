import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put, HttpCode, HttpStatus } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { PaymentService } from './payment.service';
import { Payment, PaymentDocument } from './schemas/payment.schema';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentsService: PaymentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPayment(@Body() dto: CreatePaymentDto): Promise<PaymentDocument> {
    return this.paymentsService.createPayment(dto);
  }

  @Get(':paymentId')
  async getPaymentById(@Param('paymentId') paymentId: string): Promise<PaymentDocument> {
    return this.paymentsService.getPaymentById(paymentId);
  }

  @Get('ticket/:ticketId')
  async getPaymentsByTicketId(
    @Param('ticketId') ticketId: string,
  ): Promise<PaymentDocument[]> {
    return this.paymentsService.getPaymentsByTicketId(ticketId);
  }
  @Put(':ticketId')
  @HttpCode(HttpStatus.OK)
  async updatePayment(
    @Param('ticketId') ticketId: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ): Promise<PaymentDocument | null> {
    return this.paymentsService.updatePaymentStatusByTicketId(ticketId, updatePaymentDto.paymentStatus);
  }
}