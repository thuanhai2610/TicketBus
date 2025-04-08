// companies/repositories/driver.repository.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { Driver, DriverDocument } from './schemas/driver.schema';


@Injectable()
export class DriverRepository {
  constructor(
    @InjectModel(Driver.name) private driverModel: Model<DriverDocument>,
  ) {}

   async create(createDriverDto: CreateDriverDto): Promise<Driver> {
     
       const driver = await this.driverModel.findOne({driverId: createDriverDto.driverId}).exec();
       if (!driver) {
         throw new BadRequestException(`DriverId with ID ${createDriverDto.driverId} does not exist`);
       }
   
       const createdDriver = new this.driverModel(createDriverDto);
       return createdDriver.save();
     }

  async findAll(): Promise<Driver[]> {
    return this.driverModel.find().exec();
  }

  async findOne(driverId: string): Promise<Driver> {
    const driver = await this.driverModel.findOne({driverId}).exec();
    if (!driver) {
      throw new NotFoundException(`Driver with ID ${driverId} not found`);
    }
    return driver;
  }
  async update(driverId: string, updateDriverDto: UpdateDriverDto): Promise<Driver> {
    const updatedDriver = await this.driverModel
      .findOneAndUpdate({ driverId }, updateDriverDto, { new: true }) // new: true => trả về bản ghi sau khi update
      .exec();
  
    if (!updatedDriver) {
      throw new NotFoundException(`Driver with ID ${driverId} not found`);
    }
  
    return updatedDriver;
  }

  async remove(driverId: string): Promise<Driver> {
    const deletedDriver = await this.driverModel
      .findOneAndDelete({ driverId }) // Tìm theo driverId, không phải _id
      .exec();
  
    if (!deletedDriver) {
      throw new NotFoundException(`Driver with ID ${driverId} not found`);
    }
  
    return deletedDriver;
  }
}