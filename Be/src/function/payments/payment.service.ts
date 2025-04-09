import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { TicketService } from '../tickets/ticket.service';
import { VehicleService } from '../vehicle/vehicle.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Payment, PaymentDocument } from './schemas/payment.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ticket, TicketDocument } from '../tickets/schemas/ticket.schema';
import { Trip, TripDocument } from '../trip/schemas/trip.schema';
import { PaymentRepository } from './payment.repsitory';
import { Seat, SeatDocument } from '../seats/schemas/seat.schema';
import * as querystring from 'querystring';
import * as crypto from 'crypto';

@Injectable()
export class PaymentService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly ticketService: TicketService,
    private readonly vehicleService: VehicleService,
    @InjectModel(Ticket.name) private ticketModel: Model<TicketDocument>,
    @InjectModel(Trip.name) private tripModel: Model<TripDocument>,
    @InjectModel(Seat.name) private seatModel: Model<SeatDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
  ) {}

  async createPayment(dto: CreatePaymentDto): Promise<PaymentDocument> {
    const ticket = await this.ticketService.findTicketById(dto.ticketId);
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${dto.ticketId} not found`);
    }

    const paymentId = `PAYMENT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    let paymentUrl = '';
    let payment : any ;
    if (dto.paymentMethod === 'cash') {
      // Handle Cash Payment
      payment = await this.paymentRepository.createPayment({
        paymentId,
        ticketId: dto.ticketId,
        companyId: dto.companyId,
        amount: dto.amount,
        paymentMethod: 'cash',
        paymentStatus: 'completed', 
        paymentUrl,
      });

      // Update ticket and seat status for cash payment
      await this.processTicketAndSeats(ticket, payment);
    } else if (dto.paymentMethod === 'vn_pay') {
      // Handle VNPay Payment
      const vnpayUrl = process.env.VNPAY_URL;
      const tmnCode = process.env.VNPAY_TMN_CODE;
      const hashSecret = process.env.VNPAY_HASH_SECRET;
      const returnUrl = process.env.RETURN_URL;

      const vnpParams: any = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: tmnCode,
        vnp_Amount: dto.amount * 100 ,
        vnp_CurrCode: 'VND',
        vnp_TxnRef: paymentId,
        vnp_OrderInfo: `Thanhtoanve${dto.ticketId}`,
        vnp_OrderType: '250000',
        vnp_Locale: 'vn',
        vnp_ReturnUrl: returnUrl,
        vnp_IpAddr: '127.0.0.1', // Replace with actual client IP in production
        vnp_CreateDate: this.formatDate(new Date()),
      };

      const sortedParams = this.sortObject(vnpParams);
      const signData = querystring.stringify(sortedParams);
      const hmac = crypto.createHmac('sha512', hashSecret!);
      const secureHash = hmac.update(signData).digest('hex');
      vnpParams['vnp_SecureHash'] = secureHash;

      paymentUrl = `${vnpayUrl}?${querystring.stringify(vnpParams)}`;

      payment = await this.paymentRepository.createPayment({
        paymentId,
        ticketId: dto.ticketId,
        companyId: dto.companyId,
        amount: dto.amount,
        paymentMethod: 'vn_pay',
        paymentStatus: 'pending', // VNPay starts as pending
        paymentUrl, // Store URL for frontend redirection
      });
      const paymentObj = payment.toObject ? payment.toObject() : payment;
      return { ...paymentObj, paymentUrl }; // Return payment with URL for VNPay
    } else {
      throw new NotFoundException(`Unsupported payment method: ${dto.paymentMethod}`);
    }

    return payment;
  }

  // Extracted logic for updating ticket and seats
  private async processTicketAndSeats(ticket: any, payment: PaymentDocument) {
    await this.ticketService.updateTicketStatus(payment.ticketId, 'Paid');
    const trip = await this.tripModel.findOne({ tripId: ticket.tripId }).exec();
    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    let seatNumbers: string[] = [];
    if (typeof ticket.seatNumber === 'string') {
      seatNumbers = [ticket.seatNumber];
      await this.seatModel
        .findOneAndUpdate(
          { tripId: ticket.tripId, seatNumber: ticket.seatNumber },
          { availabilityStatus: 'Selected', updatedAt: new Date() },
          { new: true }
        )
        .exec();
    } else if (Array.isArray(ticket.seatNumber)) {
      seatNumbers = ticket.seatNumber;
      for (const seatNumber of seatNumbers) {
        await this.seatModel
          .findOneAndUpdate(
            { tripId: ticket.tripId, seatNumber },
            { availabilityStatus: 'Selected', updatedAt: new Date() },
            { new: true }
          )
          .exec();
      }
    }

    console.log(`Processing ticket ${ticket.ticketId} with ${seatNumbers.length} seats: ${seatNumbers.join(', ')}`);
    console.log(`Decrementing seat count for vehicle ${trip.vehicleId} by ${seatNumbers.length}`);

    await this.vehicleService.updateSeatCount(trip.vehicleId, seatNumbers);
  }

  // VNPay return handler
  async handleVnpayReturn(query: any): Promise<any> {
    const hashSecret = process.env.VNPAY_HASH_SECRET;
    const vnpParams = { ...query };
    const secureHash = vnpParams['vnp_SecureHash'];

    delete vnpParams['vnp_SecureHash'];
    delete vnpParams['vnp_SecureHashType'];

    const sortedParams = this.sortObject(vnpParams);
    const signData = querystring.stringify(sortedParams);
    const hmac = crypto.createHmac('sha512', hashSecret!);
    const calculatedHash = hmac.update(signData).digest('hex');

    if (secureHash !== calculatedHash) {
      throw new Error('Invalid VNPay signature');
    }

    const paymentId = vnpParams['vnp_TxnRef'];
    const payment = await this.paymentRepository.findPaymentById(paymentId);

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${paymentId} not found`);
    }

    if (vnpParams['vnp_ResponseCode'] === '00') {
      await this.paymentRepository.updatePaymentStatus(paymentId, 'completed');
      const ticket = await this.ticketService.findTicketById(payment.ticketId);
      await this.processTicketAndSeats(ticket, payment);
      return { status: 'success', paymentId };
    } else {
      await this.paymentRepository.updatePaymentStatus(paymentId, 'failed');
      return { status: 'failed', message: vnpParams['vnp_ResponseCode'] };
    }
  }

  private formatDate(date: Date): string {
    return date.toISOString().replace(/[^0-9]/g, '').slice(0, 14);
  }
  private sortObject(obj: any): any {
    const sorted: any = {};
    Object.keys(obj)
      .sort()
      .forEach((key) => {
        sorted[key] = obj[key];
      });
    return sorted;
  }

 
  async getPaymentById(paymentId: string): Promise<PaymentDocument> {
    const payment = await this.paymentRepository.findPaymentById(paymentId);
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${paymentId} not found`);
    }
    return payment;
  }

  async getPaymentsByTicketId(ticketId: string): Promise<PaymentDocument[]> {
    return this.paymentRepository.findPaymentsByTicketId(ticketId);
  }

  async updatePaymentStatus(
    paymentId: string,
    paymentStatus: string,
  ): Promise<PaymentDocument | null> {
    const payment = await this.paymentRepository.findPaymentById(paymentId);
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${paymentId} not found`);
    }

    const ticket = await this.ticketModel.findOne({ ticketId: payment.ticketId }).exec();
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${payment.ticketId} not found`);
    }

    const trip = await this.tripModel.findOne({ tripId: ticket.tripId }).exec();
    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    let seatNumbers: string[] = [];
    if (typeof ticket.seatNumber === 'string') {
      seatNumbers = [ticket.seatNumber];
    } else if (Array.isArray(ticket.seatNumber)) {
      seatNumbers = ticket.seatNumber;
    }

    if (paymentStatus === 'completed' && payment.paymentStatus !== 'completed') {
      const updatedPayment = await this.paymentRepository.updatePaymentStatus(paymentId, paymentStatus);

      await this.ticketModel
        .findOneAndUpdate(
          { ticketId: payment.ticketId },
          { status: 'Paid', updatedAt: new Date() },
          { new: true }
        )
        .exec();

      for (const seatNumber of seatNumbers) {
        await this.seatModel
          .findOneAndUpdate(
            { 
              tripId: ticket.tripId, 
              seatNumber: seatNumber 
            },
            { availabilityStatus: 'Selected', updatedAt: new Date() },
            { new: true }
          )
          .exec();
      }

      await this.vehicleService.updateSeatCount(trip.vehicleId, seatNumbers);

      return updatedPayment;
    }

    if (paymentStatus === 'failed' && payment.paymentStatus !== 'failed') {
      const updatedPayment = await this.paymentRepository.updatePaymentStatus(paymentId, paymentStatus);

      await this.ticketModel
        .findOneAndUpdate(
          { ticketId: payment.ticketId },
          { status: 'Booked', updatedAt: new Date() },
          { new: true }
        )
        .exec();

      for (const seatNumber of seatNumbers) {
        await this.seatModel
          .findOneAndUpdate(
            { 
              tripId: ticket.tripId, 
              seatNumber: seatNumber 
            },
            { availabilityStatus: 'Booked', updatedAt: new Date() },
            { new: true }
          )
          .exec();
      } 

      await this.vehicleService.increaseSeatCount(trip.vehicleId, seatNumbers.length);

      return updatedPayment;
    }

    return this.paymentRepository.updatePaymentStatus(paymentId, paymentStatus);
  }

  async updatePaymentStatusByTicketId(
    ticketId: string,
    paymentStatus: string,
  ): Promise<PaymentDocument | null> {
    const payments = await this.paymentRepository.findPaymentsByTicketId(ticketId);
    if (!payments || payments.length === 0) {
      throw new NotFoundException(`No payment found for ticket ID ${ticketId}`);
    }
  
    const payment = payments[0];
  
    const ticket = await this.ticketModel.findOne({ ticketId }).exec();
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${ticketId} not found`);
    }
  
    const trip = await this.tripModel.findOne({ tripId: ticket.tripId }).exec();
    if (!trip) {
      throw new NotFoundException('Trip not found');
    }
  
    let seatNumbers: string[] = [];
    if (typeof ticket.seatNumber === 'string') {
      seatNumbers = [ticket.seatNumber];
    } else if (Array.isArray(ticket.seatNumber)) {
      seatNumbers = ticket.seatNumber;
    }
  
    if (paymentStatus === 'completed' && payment.paymentStatus !== 'completed') {
      const updatedPayment = await this.paymentRepository.updatePaymentStatus(payment.paymentId, paymentStatus);
  
      await this.ticketModel
        .findOneAndUpdate(
          { ticketId },
          { status: 'Paid', updatedAt: new Date() },
          { new: true }
        )
        .exec();
  
      for (const seatNumber of seatNumbers) {
        await this.seatModel
          .findOneAndUpdate(
            { 
              tripId: ticket.tripId, 
              seatNumber: seatNumber 
            },
            { availabilityStatus: 'Selected', updatedAt: new Date() },
            { new: true }
          )
          .exec();
      }
  
      await this.vehicleService.updateSeatCount(trip.vehicleId, seatNumbers);
  
      return updatedPayment;
    }
  
    if (paymentStatus === 'failed' && payment.paymentStatus !== 'failed') {
      const updatedPayment = await this.paymentRepository.updatePaymentStatus(payment.paymentId, paymentStatus);
  
      await this.ticketModel
        .findOneAndUpdate(
          { ticketId },
          { status: 'Cancelled', updatedAt: new Date() },
          { new: true }
        )
        .exec();
  
      for (const seatNumber of seatNumbers) {
        await this.seatModel
          .findOneAndUpdate(
            { 
              tripId: ticket.tripId, 
              seatNumber: seatNumber 
            },
            { availabilityStatus: 'Available', updatedAt: new Date() },
            { new: true }
          )
          .exec();
      }
  
      await this.vehicleService.increaseSeatCount(trip.vehicleId, seatNumbers.length);
  
      return updatedPayment;
    }
  
    return this.paymentRepository.updatePaymentStatus(payment.paymentId, paymentStatus);
  }

  async findAll(): Promise<Payment[]> {
    return this.paymentModel.find().exec();
  }
}