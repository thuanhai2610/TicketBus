/* eslint-disable prettier/prettier */
// eslint-disable-next-line prettier/prettier
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { Controller, Post, Request, UseGuards, Body, Get, Headers, HttpCode, HttpStatus, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { RegisterDto } from './dto/register.dto';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AuthController {
  constructor(private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const { username, password, email, role } = registerDto;
    return this.authService.register(username, password, email, role ?? 'user');
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Headers('authorization') authorization?: string) {
    let accessToken: string | undefined;
    if (authorization && authorization.startsWith('Bearer ')) {
        accessToken = authorization.split(' ')[1]; 
    }
    return this.authService.login(req.user, accessToken);
}

@Post('verify-otp')
async verifyOtp(@Body('otp') otp: string) {
    return this.authService.verifyOtp(otp);
}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('protected')
  getProtected(@Request() req) {
    return { message: 'this is protected for admin', user: req.user };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: { email: string }) {
      return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('change-password')
    @HttpCode(HttpStatus.OK)
    async changePassword(@Body() changePasswordDto: { userId: string; newPassword: string }) {
        return this.authService.changePassword(changePasswordDto.userId, changePasswordDto.newPassword);
    }
    @Post('google-login')
    async googleLogin(@Body() body: { credential: string }) {
        return this.authService.verifyGoogleCredential(body.credential);
    }

    }
  


