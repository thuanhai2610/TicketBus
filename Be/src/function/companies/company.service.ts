import { Injectable } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company } from './schemas/company.schema';
import { CompanyRepository } from './company.repsitory';

@Injectable()
export class CompaniesService {
  constructor(private readonly companyRepository: CompanyRepository) {}

  create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    return this.companyRepository.create(createCompanyDto);
  }

  findAll(): Promise<Company[]> {
    return this.companyRepository.findAll();
  }

  findOne(id: string): Promise<Company> {
    return this.companyRepository.findOne(id);
  }

  update(id: string, updateCompanyDto: UpdateCompanyDto): Promise<Company> {
    return this.companyRepository.update(id, updateCompanyDto);
  }

  remove(id: string): Promise<Company> {
    return this.companyRepository.remove(id);
  }
}