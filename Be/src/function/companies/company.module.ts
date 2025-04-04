import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Company, CompanySchema } from './schemas/company.schema';
import { CompanyRepository } from './company.repsitory';
import { CompaniesController } from './company.controller';
import { CompaniesService } from './company.service';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: Company.name, schema: CompanySchema }]),
  ],
  controllers: [CompaniesController],
  providers: [CompaniesService, CompanyRepository],
  exports: [CompaniesService, MongooseModule],
})
export class CompaniesModule {}