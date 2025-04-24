import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { Trip, TripDocument } from './schemas/trip.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Company, CompanyDocument } from '../companies/schemas/company.schema';
import { Model } from 'mongoose';
import { Vehicle, VehicleDocument } from '../vehicle/schemas/vehicle.schema';
import { Driver, DriverDocument } from '../driver/schemas/driver.schema';
import { Seat, SeatDocument } from '../seats/schemas/seat.schema';
import { CreateSeatDto } from '../seats/dto/create-seat.dto';
import { validate } from 'class-validator';
import { TripRepository } from './trip.repsitory';
import { plainToInstance } from 'class-transformer';
@Injectable()
export class TripService {
  constructor(
    @InjectModel(Trip.name) private tripModel: Model<TripDocument>,
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
    @InjectModel(Vehicle.name) private vehicleModel: Model<VehicleDocument>,
    @InjectModel(Driver.name) private driverModel: Model<DriverDocument>,
    @InjectModel(Seat.name) private seatModel: Model<SeatDocument>,
    private readonly tripRepository: TripRepository,
  ) {}

  async create(createTripDto: CreateTripDto): Promise<Trip | null> {
    console.log('Received createTripDto:', createTripDto);

    // Set default coordinates
    const dtoInstance = plainToInstance(CreateTripDto, createTripDto);
  dtoInstance.setDefaultCoordinates();

    // Validate company
    const company = await this.companyModel
      .findOne({ companyId: createTripDto.companyId })
      .exec();
    if (!company) {
      console.log(`Company ${createTripDto.companyId} not found`);
      throw new BadRequestException(
        `Company with ID ${createTripDto.companyId} does not exist`,
      );
    }

    // Validate vehicle
    const vehicle = await this.vehicleModel
      .findOne({ vehicleId: createTripDto.vehicleId })
      .exec();
    if (!vehicle) {
      console.log(`Vehicle ${createTripDto.vehicleId} not found`);
      throw new BadRequestException(
        `Vehicle with ID ${createTripDto.vehicleId} does not exist`,
      );
    }

    // Validate driver
    const driver = await this.driverModel
      .findOne({ driverId: createTripDto.driverId })
      .exec();
    if (!driver) {
      console.log(`Driver ${createTripDto.driverId} not found`);
      throw new BadRequestException(
        `Driver with ID ${createTripDto.driverId} does not exist`,
      );
    }

    // Check if driver is already assigned
    const existingTripWithDriver = await this.tripModel
      .findOne({
        driverId: createTripDto.driverId,
        status: { $in: ['PENDING', 'IN_PROGRESS'] },
      })
      .exec();
    if (existingTripWithDriver) {
      console.log(
        `Tài xế ${createTripDto.driverId} đã được phân công cho chuyến đi khác (ID: ${existingTripWithDriver.tripId}) và chưa hoàn thành`,
      );
      return null;
    }

    // Check if vehicle is already assigned
    const existingTripVehicle = await this.tripModel
      .findOne({
        vehicleId: createTripDto.vehicleId,
        status: { $in: ['PENDING', 'IN_PROGRESS'] },
      })
      .exec();
    if (existingTripVehicle) {
      console.log(
        `Xe ${createTripDto.vehicleId} đã được phân công cho chuyến đi khác (ID: ${existingTripVehicle.tripId}) và chưa hoàn thành`,
      );
      return null;
    }
    const departureDateParts = createTripDto.departureDate.split('-');
    if (departureDateParts.length !== 3) {
      console.log('Invalid departureDate format:', createTripDto.departureDate);
      throw new BadRequestException(
        'departureDate must be in the format DD-MM-YYYY (e.g., 05-04-2025)',
      );
    }
    const departureDateFormatted = `${departureDateParts[2]}-${departureDateParts[1]}-${departureDateParts[0]}`;
    const departureTimeString = `${departureDateFormatted}T${createTripDto.departureHour}:00Z`;
    const departureTime = new Date(departureTimeString);
    if (isNaN(departureTime.getTime())) {
      console.log('Invalid departureTime:', departureTimeString);
      throw new BadRequestException('Invalid departure date or time');
    }

    // Convert arrivalDate
    const arrivalDateParts = createTripDto.arrivalDate.split('-');
    if (arrivalDateParts.length !== 3) {
      console.log('Invalid arrivalDate format:', createTripDto.arrivalDate);
      throw new BadRequestException(
        'arrivalDate must be in the format DD-MM-YYYY (e.g., 06-05-2025)',
      );
    }
    const arrivalDateFormatted = `${arrivalDateParts[2]}-${arrivalDateParts[1]}-${arrivalDateParts[0]}`;
    const arrivalTimeString = `${arrivalDateFormatted}T${createTripDto.arrivalHour}:00Z`;
    const arrivalTime = new Date(arrivalTimeString);
    if (isNaN(arrivalTime.getTime())) {
      console.log('Invalid arrivalTime:', arrivalTimeString);
      throw new BadRequestException('Invalid arrival date or time');
    }

    if (arrivalTime <= departureTime) {
      console.log('arrivalTime is not after departureTime:', { departureTime, arrivalTime });
      throw new BadRequestException('arrivalTime must be after departureTime');
    }

    console.log('Creating trip with data:', {
      ...createTripDto,
      departureTime,
      arrivalTime,
      departureLatitude: createTripDto.departureLatitude,
      departureLongtitude: createTripDto.departureLongtitude,
      destinationLatitude: createTripDto.destinationLatitude,
      destinationLongtitude: createTripDto.destinationLongtitude,
    });

    // Create the trip
    const trip = new this.tripModel({
      ...createTripDto,
      tripId: createTripDto.tripId,
      vehicleId: createTripDto.vehicleId,
      companyId: createTripDto.companyId,
      departureTime: departureTime,
      departurePoint: createTripDto.departurePoint,
      destinationPoint: createTripDto.destinationPoint,
      departureLatitude: createTripDto.departureLatitude,
      departureLongtitude: createTripDto.departureLongtitude,
      destinationLatitude: createTripDto.destinationLatitude,
      destinationLongtitude: createTripDto.destinationLongtitude,
      arrivalTime: arrivalTime,
      status: createTripDto.status || 'PENDING',
      price: createTripDto.price,
    });

    // Save the trip
    const savedTrip = await trip.save();
    console.log('Trip saved successfully:', savedTrip);

    // Generate seats
    const seatCount = vehicle.seatCount || 32;
    if (seatCount > 0) {
      const seats: CreateSeatDto[] = [];
      const rows = Math.ceil(seatCount / 4);

      for (let row = 1; row <= rows; row++) {
        const seatsInRow = Math.min(4, seatCount - (row - 1) * 4);
        for (let col = 1; col <= seatsInRow; col++) {
          const seatLetter = String.fromCharCode(65 + (col - 1));
          const seatNumber = `${seatLetter}${row}`;
          const seatDto = new CreateSeatDto();
          seatDto.seatId = `${savedTrip.tripId}-${seatNumber}`;
          seatDto.vehicleId = savedTrip.vehicleId;
          seatDto.tripId = savedTrip.tripId;
          seatDto.seatNumber = seatNumber;
          seatDto.isAvailable = true;
          seatDto.price = createTripDto.price || 0;

          const errors = await validate(seatDto);
          if (errors.length > 0) {
            console.log('Invalid seat data:', errors);
            throw new BadRequestException(`Invalid seat data: ${errors}`);
          }

          seats.push(seatDto);
        }
      }

      await this.seatModel.insertMany(seats);
      console.log('Seats created:', seats.length);

      await this.vehicleModel.updateOne(
        { vehicleId: savedTrip.vehicleId },
        { availableSeats: seats.length },
      );
      console.log('Vehicle updated with availableSeats:', seats.length);
    }

    return savedTrip;
  }

  async findAll(): Promise<Trip[]> {
    return this.tripRepository.findAll();
  }

  async findOne(tripId: string): Promise<Trip> {
    const trip = await this.tripModel.findOne({ tripId }).exec();
    if (!trip) {
      throw new NotFoundException(`Trip with ID ${tripId} not found`);
    }
    return trip;
  }

  async update(tripId: string, updateTripDto: UpdateTripDto): Promise<Trip> {
    const updateTrip = this.tripRepository.update(tripId, updateTripDto);
    if (updateTripDto.price !== undefined) {
      const result = await this.seatModel
        .updateMany(
          { tripId },
          { $set: { price: updateTripDto.price } },
        )
        .exec();
      console.log(`Updated ${result.modifiedCount} seats for tripId: ${tripId}`);
    }
    return updateTrip;
  }

  remove(tripId: string): Promise<Trip> {
    return this.tripRepository.remove(tripId);
  }

  async findByCompanyId(companyId: string): Promise<Trip[]> {
    console.log(`Fetching trip for companyId: ${companyId}`);
    const trip = await this.tripModel
      .aggregate([
        {
          $match: {
            companyId: companyId,
          },
        },
      ])
      .exec();
    return trip || [];
  }

  async searchTrips(departurePoint: string, destinationPoint: string, date: string): Promise<Trip[]> {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      throw new BadRequestException('Invalid date format');
    }

    return this.tripModel
      .find({
        departurePoint: { $regex: new RegExp(departurePoint, 'i') },
        destinationPoint: { $regex: new RegExp(destinationPoint, 'i') },
        departureTime: {
          $gte: new Date(parsedDate.setHours(0, 0, 0, 0)),
          $lte: new Date(parsedDate.setHours(23, 59, 59, 999)),
        },
      })
      .exec();
  }
}