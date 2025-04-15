// src/seats/seat-cleanup.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SeatService } from './seat.service';

@Injectable()
export class SeatCleanupService {
  private readonly logger = new Logger(SeatCleanupService.name);

  constructor(private readonly seatService: SeatService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleExpiredSeats() {
    this.logger.log('Checking for expired seat holds...');
    try {
      await this.seatService.releaseExpiredSeats();
      this.logger.log('Expired seats released successfully');
    } catch (error) {
      this.logger.error('Error releasing expired seats:', error);
    }
  }
}