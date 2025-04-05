import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateSeatDto } from './dto/create-seat.dto';
import { Seat, SeatDocument } from './schemas/seat.schema';

@Injectable()
export class SeatService {
  constructor(
    @InjectModel(Seat.name) private seatModel: Model<SeatDocument>,
  ) {}

  async create(createSeatDto: CreateSeatDto): Promise<Seat> {
    const seat = new this.seatModel(createSeatDto);
    return seat.save();
  }

  async findOne(seatId: string): Promise<Seat> {
    const seat = await this.seatModel.findOne({ seatId }).exec();
    if (!seat) {
      throw new NotFoundException('Seat not found');
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