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

  findOne(id: string): Promise<Vehicle> {
    return this.vehicleRepository.findOne(id);
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
    
    console.log(`Found vehicles: ${JSON.stringify(vehicles)}`);
    return vehicles || [];
  }
  async updateSeatCount(vehicleId: string, increment: boolean = false): Promise<VehicleDocument> {
    // Fetch the vehicle
    const vehicle = await this.findOne(vehicleId);
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }
  
    // Get current seat counts
    const available = vehicle.availableSeats;
    const total = vehicle.seatCount;
  
    // Validate seat counts
    if (typeof available !== 'number' || typeof total !== 'number' || total <= 0) {
      throw new BadRequestException('Invalid seat count values');
    }
  
    let newAvailable: number;
    if (increment) {
      // Increment available seats (e.g., when a booking is cancelled)
      newAvailable = Math.min(available + 1, total); // Ensure it doesn't exceed total
    } else {
      // Decrement available seats (e.g., when a ticket is booked)
      if (available <= 0) {
        throw new BadRequestException('No seats available');
      }
      newAvailable = available - 1;
    }
  
    // Update the availableSeats field
    const updatedVehicle = await this.vehicleModel
  .findOneAndUpdate(
    { vehicleId, availableSeats: available }, // Check current availableSeats
    { $set: { availableSeats: newAvailable } },
    { new: true }
  )
  .exec();
if (!updatedVehicle) {
  throw new BadRequestException('Seat count changed during update, please try again');
}
  
    return updatedVehicle;
  }}