// companies/repositories/trip.repository.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { Trip, TripDocument } from './schemas/trip.schema';


@Injectable()
export class TripRepository {
  constructor(
    @InjectModel(Trip.name) private tripModel: Model<TripDocument>,
  ) {}

  async create(createTripDto: CreateTripDto): Promise<Trip> {
    const newTrip = new this.tripModel(createTripDto);
    return newTrip.save();
  }

  async findAll(): Promise<Trip[]> { 
    return this.tripModel.find().exec();
  }

  async findOne(id: string): Promise<Trip> {
    const trip = await this.tripModel.findById(id).exec();
    if (!trip) {
      throw new NotFoundException(`Trip with ID ${id} not found`);
    }
    return trip;
  }

  async update(tripId: string, updateTripDto: UpdateTripDto): Promise<Trip> {
    const updatedTrip = await this.tripModel
      .findOneAndUpdate({tripId}, updateTripDto, { new: true })
      .exec();
    
    if (!updatedTrip) {
      throw new NotFoundException(`Trip with ID ${tripId} not found`);
    }
    
    return updatedTrip;
  }

  async remove(tripId: string): Promise<Trip> {
    const deletedTrip = await this.tripModel.findOneAndDelete({tripId}).exec();
    
    if (!deletedTrip) {
      throw new NotFoundException(`Trip with ID ${tripId} not found`);
    }
    
    return deletedTrip;
  }
  async findByTripId(tripId: string): Promise<Trip | null> {
    return this.tripModel.findOne({ tripId }).exec();
  }
}