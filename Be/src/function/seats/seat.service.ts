import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateSeatDto } from './dto/create-seat.dto';
import { Seat, SeatAvailabilityStatus, SeatDocument } from './schemas/seat.schema';
import { Vehicle, VehicleDocument } from '../vehicle/schemas/vehicle.schema';

@Injectable()
export class SeatService {
  constructor(
    @InjectModel(Seat.name) private seatModel: Model<SeatDocument>,
    @InjectModel(Vehicle.name) private vehicleModel: Model<VehicleDocument>,
  ) {}

  async create(createSeatDto: CreateSeatDto): Promise<Seat> {
    // Check if vehicleId exists in Vehicle collection
    const vehicle = await this.vehicleModel.findOne({ vehicleId: createSeatDto.vehicleId }).exec();
    if (!vehicle) {
      throw new BadRequestException(`Vehicle with ID ${createSeatDto.vehicleId} does not exist`);
    }

    // Optional: Check if seatNumber already exists for this vehicle
    const existingSeat = await this.seatModel.findOne({
      vehicleId: createSeatDto.vehicleId,
      seatNumber: createSeatDto.seatNumber,
    }).exec();
    if (existingSeat) {
      throw new BadRequestException(
        `Seat number ${createSeatDto.seatNumber} already exists for vehicle ${createSeatDto.vehicleId}`,
      );
    }

    // Optional: Check if adding this seat exceeds vehicle's seatCount
    const seatCount = await this.seatModel.countDocuments({ vehicleId: createSeatDto.vehicleId }).exec();
    if (seatCount >= vehicle.seatCount) {
      throw new BadRequestException(
        `Cannot add more seats. Vehicle ${createSeatDto.vehicleId} has reached its seat capacity of ${vehicle.seatCount}`,
      );
    }

    const createdSeat = new this.seatModel(createSeatDto);
    return createdSeat.save();
  }

  async findOne(seatId: string): Promise<Seat> {
    const seat = await this.seatModel.findOne({ seatId }).exec();
    if (!seat) {
      throw new BadRequestException(`Seat with ID ${seatId} not found`);
    }
    return seat;
  }

  async findByVehicleAndSeatNumber(vehicleId: string, seatNumber: string[]): Promise<Seat> {
    const seat = await this.seatModel.findOne({ vehicleId, seatNumber }).exec();
    if (!seat) {
      throw new NotFoundException('Seat not found for this vehicle');
    }
    return seat;
  }
  async findByVehicleAndSeatNumbers(vehicleId: string, seatNumbers: string[]): Promise<Seat[]> {
    const seats = await this.seatModel
      .find({
        vehicleId,
        seatNumber: { $in: seatNumbers }, // Find seats where seatNumber is in the provided array
      })
      .exec();
  
    // Ensure all requested seats are found
    const foundSeatNumbers = seats.map(seat => seat.seatNumber);
    const missingSeats = seatNumbers.filter(num => !foundSeatNumbers.includes(num));
    if (missingSeats.length > 0) {
      throw new NotFoundException(`Seats ${missingSeats.join(', ')} not found for vehicle ${vehicleId}`);
    }
  
    return seats;
  }
  async updateAvailabilityStatus(seatId: string, status: SeatAvailabilityStatus): Promise<Seat> {
    const seat = await this.seatModel.findOne({ seatId }).exec();
    if (!seat) {
      throw new NotFoundException(`Seat with ID ${seatId} not found`);
    }
    
    seat.availabilityStatus = status;
    if (status !== SeatAvailabilityStatus.BOOKED) {
      seat.holdUntil = null;
    }
    return seat.save();
  }
  
  async findByVehicleId(vehicleId: string): Promise<Seat[]> {
    return this.seatModel.find({ vehicleId }).exec();
  }
  async checkSeatsAvailability(vehicleId: string, seatNumbers: string[]): Promise<{ 
    available: boolean,
    unavailableSeats: string[] 
  }> {
    const seats = await this.seatModel
      .find({
        vehicleId,
        seatNumber: { $in: seatNumbers },
      })
      .exec();
    
    if (seats.length !== seatNumbers.length) {
      const foundSeatNumbers = seats.map(seat => seat.seatNumber);
      const missingSeats = seatNumbers.filter(num => !foundSeatNumbers.includes(num));
      throw new NotFoundException(`Seats ${missingSeats.join(', ')} not found for vehicle ${vehicleId}`);
    }
    
    const unavailableSeats = seats
      .filter(seat => seat.availabilityStatus !== SeatAvailabilityStatus.AVAILABLE)
      .map(seat => seat.seatNumber);
    
    return {
      available: unavailableSeats.length === 0,
      unavailableSeats
    };
  }
  async holdSeats(tripId: string, seatNumbers: string[], holdDurationMinutes: number = 5): Promise<void> {
    const holdUntil = new Date();
    holdUntil.setMinutes(holdUntil.getMinutes() + holdDurationMinutes);

    for (const seatNumber of seatNumbers) {
      const seat = await this.seatModel.findOne({ tripId, seatNumber }).exec();
      if (!seat) {
        throw new NotFoundException(`Seat ${seatNumber} not found for trip ${tripId}`);
      }
      if (seat.availabilityStatus !== SeatAvailabilityStatus.AVAILABLE) {
        throw new BadRequestException(`Seat ${seatNumber} is not available`);
      }

      await this.seatModel
        .findOneAndUpdate(
          { tripId, seatNumber },
          { availabilityStatus: SeatAvailabilityStatus.BOOKED, holdUntil, updatedAt: new Date() },
          { new: true },
        )
        .exec();
    }
  }

  async releaseSeats(tripId: string, seatNumbers: string[]): Promise<void> {
    for (const seatNumber of seatNumbers) {
      await this.seatModel
        .findOneAndUpdate(
          { tripId, seatNumber },
          { availabilityStatus: SeatAvailabilityStatus.AVAILABLE, holdUntil: null, updatedAt: new Date() },
          { new: true },
        )
        .exec();
    }
  }

  async releaseExpiredSeats(): Promise<void> {
    const now = new Date();
    const expiredSeats = await this.seatModel
      .find({
        availabilityStatus: SeatAvailabilityStatus.BOOKED,
        holdUntil: { $lte: now },
      })
      .exec();

    for (const seat of expiredSeats) {
      await this.seatModel
        .findOneAndUpdate(
          { _id: seat._id },
          { availabilityStatus: SeatAvailabilityStatus.AVAILABLE, holdUntil: null, updatedAt: new Date() },
          { new: true },
        )
        .exec();
    }
  }
}