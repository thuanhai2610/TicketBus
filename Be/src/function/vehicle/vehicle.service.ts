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

  remove(id: string): Promise<Vehicle> {
    return this.vehicleRepository.remove(id);
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
  async updateSeatCount(vehicleId: string, increment: boolean = false): Promise<Vehicle> {
    console.log(`Starting updateSeatCount for vehicle ${vehicleId}, increment=${increment}`);
    
    // Fetch the vehicle
    const vehicle = await this.findOne(vehicleId);
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }
    
    // Get current seat counts
    const available = vehicle.availableSeats;
    const total = vehicle.seatCount;
    
    // Debug logging
    console.log(`Current available seats: ${available}, total seats: ${total}`);
    
    // Validate seat counts
    if (typeof available !== 'number' || typeof total !== 'number' || total <= 0) {
      throw new BadRequestException('Invalid seat count values');
    }
    
    let newAvailable: number;
    if (increment) {
      newAvailable = Math.min(available + 1, total); 
      console.log(`Incrementing seats, new available: ${newAvailable}`);
    } else {
      if (available <= 0) {
        throw new BadRequestException('No seats available');
      }
      newAvailable = available - 1;
      console.log(`Decrementing seats, new available: ${newAvailable}`);
    }
    
    try {
      // Force update using updateOne instead of findOneAndUpdate to avoid potential issues
      const updateResult = await this.vehicleModel.updateOne(
        { vehicleId },
        { $set: { availableSeats: newAvailable } }
      ).exec();
      
      if (updateResult.matchedCount === 0) {
        throw new BadRequestException('Vehicle not found during update');
      }
      
      // Now fetch the updated vehicle to return
      const updatedVehicle = await this.findOne(vehicleId);
      if (!updatedVehicle) {
        throw new BadRequestException('Failed to retrieve updated vehicle');
      }
      
      console.log(`Updated vehicle availableSeats: ${updatedVehicle.availableSeats}`);
      return updatedVehicle;
    } catch (error) {
      console.error(`Error updating vehicle seat count: ${error.message}`);
      throw new BadRequestException(`Failed to update vehicle seat count: ${error.message}`);
    }
  }
}