import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { Driver, DriverDocument } from './schemas/driver.schema';
import { DriverRepository } from './driver.repsitory';
import { Model } from 'mongoose';
import { Company, CompanyDocument } from '../companies/schemas/company.schema';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class DriverService {
  constructor(@InjectModel(Driver.name) private driverModel: Model<DriverDocument>,
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,private readonly driverRepository: DriverRepository) {}

   async create(createDriverDto: CreateDriverDto): Promise<Driver> {
   
     const company = await this.companyModel.findOne({companyId: createDriverDto.companyId}).exec();
     if (!company) {
       throw new BadRequestException(`Company with ID ${createDriverDto.companyId} does not exist`);
     }
 
     const createdDriver = new this.driverModel(createDriverDto);
     return createdDriver.save();
   }

  findAll(): Promise<Driver[]> {
    return this.driverRepository.findAll();
  }

  findOne(id: string): Promise<Driver> {
    return this.driverRepository.findOne(id);
  }

  update(id: string, updateDriverDto: UpdateDriverDto): Promise<Driver> {
    return this.driverRepository.update(id, updateDriverDto);
  }

  remove(id: string): Promise<Driver> {
    return this.driverRepository.remove(id);
  }
}