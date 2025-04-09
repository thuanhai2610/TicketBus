import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { Driver, DriverDocument } from './schemas/driver.schema';
import { DriverRepository } from './driver.repsitory';
import { Model } from 'mongoose';

import { InjectModel } from '@nestjs/mongoose';
import { Company, CompanyDocument } from '../companies/schemas/company.schema';

@Injectable()
export class DriverService {
  constructor(@InjectModel(Driver.name) private driverModel: Model<DriverDocument>,
      @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
  
    private readonly driverRepository: DriverRepository) {}

    async create(createDriverDto: CreateDriverDto): Promise<Driver> {
      const driver = await this.driverModel.findOne({ driverId: createDriverDto.driverId }).exec();
    
      if (driver) {
        throw new BadRequestException(`Driver Id ${createDriverDto.driverId} đã tồn tại`);
      }
      const company = await this.companyModel.findOne({ companyId: createDriverDto.companyId }).exec();
      if (!company) {
        throw new BadRequestException(`Company with ID ${createDriverDto.companyId} không tồn tại`);
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