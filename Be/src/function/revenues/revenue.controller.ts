import { Controller, Get, Post } from '@nestjs/common';
import { RevenueService } from './revenue.service';

@Controller('revenues')
export class RevenueController {
  constructor(private readonly revenueService: RevenueService) {}

  @Get()
  async getAllRevenues() {
    return this.revenueService.findAll();
  }

  @Post('update')
  async updateRevenue() {
    await this.revenueService.updateDailyRevenue();
    return { message: 'Revenue data updated successfully' };
  }
//   @Get('total')
// async getTotalRevenue() {
//   const total = await this.revenueService.getTotalRevenue();
//   return { total };
// }
}