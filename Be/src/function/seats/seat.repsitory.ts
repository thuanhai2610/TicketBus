// seats/repositories/seat.repository.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateSeatDto } from './dto/create-seat.dto';
import { UpdateSeatDto } from './dto/update-seat.dto';
import { Seat, SeatDocument } from './schemas/seat.schema';


@Injectable()
export class SeatRepository {
  constructor(
    @InjectModel(Seat.name) private seatModel: Model<SeatDocument>,
  ) {}

  async create(createSeatDto: CreateSeatDto): Promise<Seat> {
    const newSeat = new this.seatModel(createSeatDto);
    return newSeat.save();
  }

  async findAll(): Promise<Seat[]> {
    return this.seatModel.find().exec();
  }

  async findOne(id: string): Promise<Seat> {
    const seat = await this.seatModel.findById(id).exec();
    if (!seat) {
      throw new NotFoundException(`Seat with ID ${id} not found`);
    }
    return seat;
  }

  async update(id: string, updateSeatDto: UpdateSeatDto): Promise<Seat> {
    const updatedSeat = await this.seatModel
      .findByIdAndUpdate(id, updateSeatDto, { new: true })
      .exec();
    
    if (!updatedSeat) {
      throw new NotFoundException(`Seat with ID ${id} not found`);
    }
    
    return updatedSeat;
  }

  async remove(id: string): Promise<Seat> {
    const deletedSeat = await this.seatModel.findByIdAndDelete(id).exec();
    
    if (!deletedSeat) {
      throw new NotFoundException(`Seat with ID ${id} not found`);
    }
    
    return deletedSeat;
  }
}