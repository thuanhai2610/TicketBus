import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { Vehicle, VehicleDocument } from './schemas/vehicle.schema';
import { VehicleRepository } from './vehicle.repsitory';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Company, CompanyDocument } from '../companies/schemas/company.schema';

@Injectable()
export class VehicleService {
  constructor(@InjectModel(Vehicle.name) private vehicleModel: Model<VehicleDocument>,
  @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
  private readonly vehicleRepository: VehicleRepository) {}

  async create(createVehicleDto: CreateVehicleDto): Promise<Vehicle> {
  
    const company = await this.companyModel.findOne({companyId: createVehicleDto.companyId}).exec();
    if (!company) {
      throw new BadRequestException(`Company with ID ${createVehicleDto.companyId} does not exist`);
    }

    const createdVehicle = new this.vehicleModel(createVehicleDto);
    return createdVehicle.save();
  }
  findAll(): Promise<Vehicle[]> {
    return this.vehicleRepository.findAll();
  }
  findOneId(id: string): Promise<Vehicle> {
    return this.vehicleRepository.findOne(id);
  }

  async findOne(vehicleId: string): Promise<Vehicle> {
    try {
      const vehicle = await this.vehicleModel.findOne({ vehicleId }).exec();
      if (vehicle) {
        return vehicle;
      }
      
      throw new NotFoundException(`Vehicle with ID ${vehicleId} not found`);
    } catch (error) {
      throw new NotFoundException(`Vehicle with ID ${vehicleId} not found: ${error.message}`);
    }
  }

  update(id: string, updateVehicleDto: UpdateVehicleDto): Promise<Vehicle> {
    return this.vehicleRepository.update(id, updateVehicleDto);
  }

  remove(vehicleId: string): Promise<Vehicle> {
    return this.vehicleRepository.remove(vehicleId);
  }

  async findByCompanyId(companyId: string): Promise<Vehicle[]> {
    console.log(`Fetching vehicles for companyId: ${companyId}`);
    
    const vehicles = await this.vehicleModel.aggregate([
      {
        $match: {
          companyId: companyId
        }
      }
    ]).exec();
    
    return vehicles || [];
  }
  async updateSeatCount(vehicleId: string, arg2?: string[] | boolean, arg3?: number | boolean): Promise<Vehicle> {
    console.log(`Starting updateSeatCount for vehicle ${vehicleId}`);
    
    let seatNumbers: string[] = [];
    let increment: boolean = false;
    let count: number = 1;
    
    // Handle different calling patterns
    if (Array.isArray(arg2)) {
      // New style: (vehicleId, seatNumbers[], increment?)
      seatNumbers = arg2;
      count = seatNumbers.length;
      increment = typeof arg3 === 'boolean' ? arg3 : false;
    } else {
      // Old style: (vehicleId, increment?, count?)
      increment = typeof arg2 === 'boolean' ? arg2 : false;
      count = typeof arg3 === 'number' ? arg3 : 1;
    }

    // Ensure count is a valid number
    if (isNaN(count) || count <= 0) {
      console.warn(`Invalid seat count value: ${count}, using default of 1`);
      count = 1;
    }
    
    let retries = 3;
    while (retries > 0) {
      // Fetch the vehicle
      const vehicle = await this.findOne(vehicleId);
      if (!vehicle) {
        throw new NotFoundException('Vehicle not found');
      }
  
      // Get current seat counts
      const available = vehicle.availableSeats;
      const total = vehicle.seatCount;
  
      // Debug logging
      console.log(`Current available seats: ${available}, total seats: ${total}, operation: ${increment ? 'increment' : 'decrement'} by ${count}`);
  
      // Validate seat counts
      if (typeof available !== 'number' || typeof total !== 'number' || total <= 0) {
        throw new BadRequestException('Invalid seat count values');
      }
  
      let newAvailable: number;
      if (increment) {
        newAvailable = Math.min(available + count, total);
        console.log(`Incrementing seats by ${count}, new available: ${newAvailable}`);
      } else {
        if (available < count) {
          throw new BadRequestException(`Not enough seats available. Requested: ${count}, Available: ${available}`);
        }
        newAvailable = available - count;
        console.log(`Decrementing seats by ${count}, new available: ${newAvailable}`);
      }
  
      try {
        const updateResult = await this.vehicleModel.updateOne(
          { vehicleId, availableSeats: available }, 
          { $set: { availableSeats: newAvailable } }
        ).exec();
  
        if (updateResult.matchedCount === 0) {
          retries--;
          console.warn(`Concurrency conflict detected, retrying (${retries} attempts left)`);
          if (retries === 0) {
            throw new BadRequestException('Failed to update vehicle seat count due to concurrency conflict');
          }
          continue;
        }
        const updatedVehicle = await this.findOne(vehicleId);
        if (!updatedVehicle) {
          throw new BadRequestException('Failed to retrieve updated vehicle');
        }
  
        console.log(`Successfully updated vehicle availableSeats from ${available} to ${updatedVehicle.availableSeats}`);
        return updatedVehicle;
      } catch (error) {
        console.error(`Error updating seat count: ${error.message}`);
        retries--;
        if (retries === 0) {
          throw new BadRequestException(`Failed to update vehicle seat count: ${error.message}`);
        }
      }
    }
  
    throw new BadRequestException('Failed to update vehicle seat count after multiple retries');
  }
  async increaseSeatCount(vehicleId: string, seatCount: number): Promise<void> {
    const vehicle = await this.vehicleModel.findOne({ vehicleId }).exec();
    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${vehicleId} not found`);
    }

    const newAvailableSeats = vehicle.availableSeats + seatCount;

    await this.vehicleModel
      .findOneAndUpdate(
        { vehicleId },
        { availableSeats: newAvailableSeats, updatedAt: new Date() },
        { new: true }
      )
      .exec();
  }
}