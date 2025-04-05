import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { Trip, TripDocument } from './schemas/trip.schema';
import { TripRepository } from './trip.repsitory';
import { InjectModel } from '@nestjs/mongoose';
import { Company, CompanyDocument } from '../companies/schemas/company.schema';
import { Model } from 'mongoose';
import { Vehicle, VehicleDocument } from '../vehicle/schemas/vehicle.schema';
import { Driver, DriverDocument } from '../driver/schemas/driver.schema';

@Injectable()
export class TripService {
  constructor(@InjectModel(Trip.name) private tripModel: Model<TripDocument>,
  @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
  @InjectModel(Vehicle.name) private vehicleModel: Model<VehicleDocument>,
  @InjectModel(Driver.name) private driverModel: Model<DriverDocument>,
  private readonly tripRepository: TripRepository) {}

  async create(createTripDto: CreateTripDto): Promise<Trip> {
    const company = await this.companyModel.findOne({ companyId: createTripDto.companyId }).exec();
    const vehicle = await this.vehicleModel.findOne({ vehicleId: createTripDto.vehicleId }).exec();
    const driver = await this.driverModel.findOne({ driverId: createTripDto.driverId }).exec();
  
    if (!company) {
      throw new BadRequestException(`Company with ID ${createTripDto.companyId} does not exist`);
    }
    if (!driver) {
      throw new BadRequestException(`Driver with ID ${createTripDto.driverId} does not exist`);
    }
    if (!vehicle) {
      throw new BadRequestException(`Vehicle with ID ${createTripDto.vehicleId} does not exist`);
    }
  
    // Convert departureDate from DD-MM-YYYY to YYYY-MM-DD
    const departureDateParts = createTripDto.departureDate.split('-');
    if (departureDateParts.length !== 3) {
      throw new BadRequestException('departureDate must be in the format DD-MM-YYYY (e.g., 05-04-2025)');
    }
    const departureDateFormatted = `${departureDateParts[2]}-${departureDateParts[1]}-${departureDateParts[0]}`; // e.g., "2025-04-05"
  
    // Combine departureDate and departureHour into departureTime
    const departureTimeString = `${departureDateFormatted}T${createTripDto.departureHour}:00Z`;
    const departureTime = new Date(departureTimeString);
    if (isNaN(departureTime.getTime())) {
      throw new BadRequestException('Invalid departure date or time');
    }
  
    // Convert arrivalDate from DD-MM-YYYY to YYYY-MM-DD
    const arrivalDateParts = createTripDto.arrivalDate.split('-');
    if (arrivalDateParts.length !== 3) {
      throw new BadRequestException('arrivalDate must be in the format DD-MM-YYYY (e.g., 06-05-2025)');
    }
    const arrivalDateFormatted = `${arrivalDateParts[2]}-${arrivalDateParts[1]}-${arrivalDateParts[0]}`; // e.g., "2025-05-06"
  
    // Combine arrivalDate and arrivalHour into arrivalTime
    const arrivalTimeString = `${arrivalDateFormatted}T${createTripDto.arrivalHour}:00Z`;
    const arrivalTime = new Date(arrivalTimeString);
    if (isNaN(arrivalTime.getTime())) {
      throw new BadRequestException('Invalid arrival date or time');
    }
  
    if (arrivalTime <= departureTime) {
      throw new BadRequestException('arrivalTime must be after departureTime');
    }
  
    // Create the trip with the parsed Date objects
    const trip = new this.tripModel({
      ...createTripDto,
      tripId: createTripDto.tripId,
      vehicleId: createTripDto.vehicleId,
      companyId: vehicle.companyId,
      departureTime: departureTime, // Use the parsed Date object
      departurePoint: createTripDto.departurePoint,
      destinationPoint: createTripDto.destinationPoint,
      arrivalTime: arrivalTime, // Use the parsed Date object
    });
  
    return trip.save();
  }

  findAll(): Promise<Trip[]> {
    return this.tripRepository.findAll();
  }

  async findOne(tripId: string): Promise<Trip> {
    const trip = await this.tripModel.findOne({ tripId }).exec();
    if (!trip) {
      throw new NotFoundException(`Trip with ID ${tripId} not found`);
    }
    return trip;
  }

  update(id: string, updateTripDto: UpdateTripDto): Promise<Trip> {
    return this.tripRepository.update(id, updateTripDto);
  }

  remove(id: string): Promise<Trip> {
    return this.tripRepository.remove(id);
  }
  async findByCompanyId(companyId: string): Promise<Trip[]> {
    console.log(`Fetching trip for companyId: ${companyId}`);
    
    const trip = await this.tripModel.aggregate([
      {
        $match: {
          companyId: companyId
        }
      }
    ]).exec();
    return trip || [];
  }
}