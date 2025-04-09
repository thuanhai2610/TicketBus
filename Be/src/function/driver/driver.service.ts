import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { Driver, DriverDocument } from './schemas/driver.schema';
import { DriverRepository } from './driver.repsitory';
import { Model } from 'mongoose';

import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class DriverService {
  constructor(@InjectModel(Driver.name) private driverModel: Model<DriverDocument>,
    private readonly driverRepository: DriverRepository) {}

   async create(createDriverDto: CreateDriverDto): Promise<Driver> {
   
     const driver = await this.driverModel.findOne({driverId: createDriverDto.driverId}).exec();
     if (driver) {
       throw new BadRequestException(`DriverId with ID ${createDriverDto.driverId} does not exist`);
     }
 
     const createdDriver = new this.driverModel(createDriverDto);
     return createdDriver.save();
   }

  findAll(): Promise<Driver[]> {
    return this.driverRepository.findAll();
  }

  findOne(driverId: string): Promise<Driver> {
    return this.driverRepository.findOne(driverId);
  }

  update(driverId: string, updateDriverDto: UpdateDriverDto): Promise<Driver> {
    return this.driverRepository.update(driverId, updateDriverDto);
  }

  remove(driverId: string): Promise<Driver> {
    return this.driverRepository.remove(driverId);
  }
}