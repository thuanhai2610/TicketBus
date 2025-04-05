import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateSeatDto } from './dto/create-seat.dto';
import { Seat, SeatDocument } from './schemas/seat.schema';
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

  async findByVehicleAndSeatNumber(vehicleId: string, seatNumber: string): Promise<Seat> {
    const seat = await this.seatModel.findOne({ vehicleId, seatNumber }).exec();
    if (!seat) {
      throw new NotFoundException('Seat not found for this vehicle');
    }
    return seat;
  }
  async updateAvailability(seatId: string, isAvailable: boolean): Promise<SeatDocument> {
    const updatedSeat = await this.seatModel
      .findOneAndUpdate(
        { seatId },
        { $set: { isAvailable } },
        { new: true }, // Return the updated document
      )
      .exec();
    if (!updatedSeat) {
      throw new NotFoundException('Seat not found');
    }
    return updatedSeat;
  }
}