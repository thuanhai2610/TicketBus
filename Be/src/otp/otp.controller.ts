import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { OtpService } from './otp.service';

@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService,
  ) {}
  @Post('resend')
  @HttpCode(HttpStatus.OK)
  async resendOtp(
    @Body('userId') userId: string,
    @Body('isForgotPassword') isForgotPassword: boolean = false,
  ) {
    if (!userId) {
      throw new HttpException('userId is required', HttpStatus.BAD_REQUEST);
    }

    try {
      const otpRecord = await this.otpService.resendOtp(userId, isForgotPassword);
      return { success: true, message: 'Đã gửi lại OTP' };
    } catch (error) {
      throw new HttpException(
        error.message || 'Lỗi khi gửi lại OTP',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}