// payments/payment.service.ts
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
import { CreateTicketDto } from '../tickets/dto/create-ticket.dto';

@Injectable()
export class PaymentService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly ticketService: TicketService,
    private readonly vehicleService: VehicleService,
    @InjectModel(Ticket.name) private ticketModel: Model<TicketDocument>,
    @InjectModel(Trip.name) private tripModel: Model<TripDocument>,
    @InjectModel(Seat.name) private seatModel: Model<SeatDocument>
  ) {}

  async createPayment(dto: CreatePaymentDto): Promise<PaymentDocument> {
    // Kiểm tra vé có tồn tại không
    const ticket = await this.ticketService.findTicketById(dto.ticketId);
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${dto.ticketId} not found`);
    }
    const paymentId = `PAYMENT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Tạo thanh toán
    const payment = await this.paymentRepository.createPayment({
      paymentId,
      ticketId: dto.ticketId,
      companyId: dto.companyId,
      amount: dto.amount,
      paymentMethod: dto.paymentMethod,
      paymentStatus: dto.paymentStatus,
    });

    // Nếu thanh toán hoàn tất, cập nhật trạng thái vé và số ghế trống của xe
    if (dto.paymentStatus === 'completed') {
      // Cập nhật trạng thái vé thành 'paid'
      await this.ticketService.updateTicketStatus(dto.ticketId, 'Paid');
     
      // Lấy thông tin chuyến đi để biết vehicleId
      const trip = await this.tripModel.findOne({ tripId: ticket.tripId }).exec();
      if (!trip) {
        throw new NotFoundException('Trip not found');
      }
      let seatNumbers: string[] = [];
    
      if (typeof ticket.seatNumber === 'string') {
        // If it's a single seat as string
        seatNumbers = [ticket.seatNumber];
        await this.seatModel.findOneAndUpdate(
          { 
            tripId: ticket.tripId, 
            seatNumber: ticket.seatNumber 
          },
          { isAvailable: false, updatedAt: new Date() },
          { new: true }
        ).exec();
      } else if (Array.isArray(ticket.seatNumber)) {
        // If it's an array of seats
        seatNumbers = ticket.seatNumber;
        
        // Update all seats in the array to not available
        for (const seatNumber of seatNumbers) {
          await this.seatModel.findOneAndUpdate(
            { 
              tripId: ticket.tripId, 
              seatNumber: seatNumber 
            },
            { isAvailable: false, updatedAt: new Date() },
            { new: true }
          ).exec();
        }
      }
      
      console.log(`Processing ticket ${ticket.ticketId} with ${seatNumbers.length} seats: ${seatNumbers.join(', ')}`);
      console.log(`Decrementing seat count for vehicle ${trip.vehicleId} by ${seatNumbers.length}`);
      
      // Giảm số ghế trống của xe - pass the actual seat array
      await this.vehicleService.updateSeatCount(trip.vehicleId, seatNumbers);
    } 
    return payment;
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

    // Nếu trạng thái thanh toán chuyển sang 'completed', cập nhật vé và xe
    if (paymentStatus === 'completed' && payment.paymentStatus !== 'completed') {
      // Cập nhật trạng thái thanh toán
      const updatedPayment = await this.paymentRepository.updatePaymentStatus(
        paymentId,
        paymentStatus,
      );

      // Cập nhật trạng thái vé thành 'paid'
      await this.ticketModel
        .findOneAndUpdate(
          { ticketId: payment.ticketId },
          { status: 'paid', updatedAt: new Date() },
          { new: true },
        )
        .exec();

      // Lấy thông tin vé và chuyến đi
      const ticket = await this.ticketModel.findOne({ ticketId: payment.ticketId }).exec();
      if (!ticket) {
        throw new NotFoundException(`Ticket with ID ${payment.ticketId} not found`);
      }

      const trip = await this.tripModel.findOne({ tripId: ticket.tripId }).exec();
      if (!trip) {
        throw new NotFoundException('Trip not found');
      }

      // Giảm số ghế trống của xe
      await this.vehicleService.updateSeatCount(trip.vehicleId);

      return updatedPayment;
    }

    // Nếu không phải chuyển sang 'completed', chỉ cập nhật trạng thái thanh toán
    return this.paymentRepository.updatePaymentStatus(paymentId, paymentStatus);
  }
}