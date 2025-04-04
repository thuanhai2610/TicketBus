import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Driver, DriverSchema } from './schemas/driver.schema';
import { DriverRepository } from './driver.repsitory';
import { DriverController } from './driver.controller';
import { DriverService } from './driver.service';
import { Company, CompanySchema } from '../companies/schemas/company.schema';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: Driver.name, schema: DriverSchema },
       { name: Company.name, schema: CompanySchema }
    ]),
  ],
  controllers: [DriverController],
  providers: [DriverService, DriverRepository],
  exports: [DriverService, MongooseModule],
})
export class DriverModule {}