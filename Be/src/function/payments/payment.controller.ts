import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put, HttpCode, HttpStatus, Query, BadRequestException, NotFoundException } from '@nestjs/common';
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

  // @Get(':paymentId')
  // async getPaymentById(@Param('paymentId') paymentId: string): Promise<PaymentDocument> {
  //   return this.paymentsService.getPaymentById(paymentId);
  // }

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
  @Get('all')
  async getAllPayments() {
    return this.paymentsService.findAll();
  }
  @Get('revenues')
  async getAllPaymentsRevenue() {
    return this.paymentsService.findAll();
  }
  @Get('revenues/total')
  async getTotalRevenue() {
    const payments = await this.paymentsService.findAll();
    const completedPayments = payments.filter(p => p.paymentStatus === 'completed');
    const total = completedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalTickets = completedPayments.length;
    return { total, totalTickets };
  }
  @Get('vnpay/return')
  async handleVnpayReturn(@Query() query: any) {
    const result = await this.paymentsService.handleVnpayReturn(query);
    if (result.status === 'success') {
      return { message: 'Payment successful', paymentId: result.paymentId,  finalAmount: result.finalAmount, };
    } else {
      return { message: 'Payment failed', code: result.message };
    }
  }
  @Get('tickets/ticketvnpay')
  async getTicketByPaymentId(@Query('paymentId') paymentId: string) {
    if (!paymentId) {
      throw new BadRequestException('Payment ID is required');
     
    } 
    const ticket = await this.paymentsService.getTicketByPaymentId(paymentId);
    if (!ticket) {
      throw new NotFoundException('Ticket not found for this payment ID');
    }
    return ticket;
  }
}

