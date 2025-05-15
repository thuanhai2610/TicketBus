/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prettier/prettier */
// eslint-disable-next-line prettier/prettier
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { OtpService } from 'src/otp/otp.service';
import { MailerService } from '@nestjs-modules/mailer';
import { randomInt } from 'crypto';
import { Types } from 'mongoose';
import { PendingUsersService } from 'src/pending-users/pending-users.service';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private otpService: OtpService,
    private mailerService: MailerService,
    private pendingUsersService: PendingUsersService,
  ) { this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID); }
  async verifyToken(token: string): Promise<any> {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      return { user, payload };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.validateUser(username, password);
    if (user) {
      const userObject = user.toObject ? user.toObject() : user;
      const { password, ...result } = userObject;
      if (!result.role) {
        throw new BadRequestException('User role is missing');
      }
      return result;
    }
    return null;
  }

  async login(user: any, accessToken: string | undefined) {
    try {
      console.log('Starting login for user:', user.username);
  
      if (!user.emailVerified) {
        console.log('Email not verified for user:', user.username);
        throw new BadRequestException('Đăng nhập lỗi, kiểm tra lại thông tin đăng nhập.');
      }
  
      if (accessToken && typeof accessToken === 'string') {
        try {
          const { user: tokenUser } = await this.verifyToken(accessToken);
          if (tokenUser.username === user.username) {
            console.log('Valid token for user:', user.username);
            return {
              access_token: accessToken,
              role: user.role,
            };
          }
          console.log('Token mismatch, generating new token');
        } catch (error) {
          console.log('Token verification failed:', error.message);
        }
      }
  
      const payload = { username: user.username, userId: user._id.toString(), role: user.role, avatar: user.avatar };
      console.log('Generating new token with payload:', payload);
      const newToken = this.jwtService.sign(payload);
  
      return {
        access_token: newToken,
        role: user.role,
        userId: user._id.toString(),
        avatar: user.avatar 
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  async register(
    username: string,
    password: string,
    email: string,
    role: string = 'user',
  ) {
    try {
      const existringUserEmail = await this.usersService.findByEmail(email);
      const existUsername = await this.usersService.findOne(username);
      if (existringUserEmail) {
        throw new BadRequestException('Email này đã được sử dụng');
      }   if (existUsername) {
        throw new BadRequestException('Username này đã được sử dụng');
      } 
      if (!email) {
        throw new BadRequestException('Bắt buộc phải có Email');
      }
  
      const hashedPassword = await this.usersService.hashedPassword(password);
      console.log('Password hashed successfully');
  
      const pendingUser = await this.pendingUsersService.create(
        username,
        hashedPassword,
        email,
        role,
        false, 
      );
      console.log('Pending user created:', pendingUser._id);
  
      const otp = randomInt(100000, 999999).toString();
      const otpRecord = await this.otpService.create(pendingUser._id.toString(), otp);
      console.log('OTP saved for pending user:', pendingUser._id, 'OTP:', otp);
  
      await this.mailerService.sendMail({
        to: email,
        subject: 'Verify your email',
        template: './verify-email',
        context: { name: username, otp },
      });
      console.log('OTP email sent to:', email);
  
      return { message: 'OTP sent to your email', userId: pendingUser._id.toString() };
    } catch (error) {
      console.error('Registration error:', error);
      throw new BadRequestException(error.message || 'Registration failed');
    }
  }
  async verifyOtp(otp: string, userId: string) {
    try {
      console.log('Verifying OTP for userId:', userId, 'with otp:', otp);
  
      // Find the OTP record based on the OTP value and userId
      const otpRecord = await this.otpService.findByOtpAndUserId(otp, userId);
      
      if (!otpRecord) {
        console.log('OTP not found for the given userId and otp:', otp, userId);
  
       throw new BadRequestException('Không tìm thấy mã hoặc mã sai')
      }
      const otpUserId = new Types.ObjectId(otpRecord.userId);
  
      const pendingUser = await this.pendingUsersService.findPendingUserById(otpUserId.toString());
      if (pendingUser) {
        console.log('Pending user found:', pendingUser);
        const user = await this.usersService.create(
          pendingUser.username,
          pendingUser.password,
          pendingUser.email,
          pendingUser.role,
          true, 
          true, 
        );
        console.log('User created from pending user:', user._id);
        await this.pendingUsersService.delete(otpUserId.toString());
        console.log('Pending user deleted:', otpUserId);
        await this.otpService.delete(otpUserId.toString(), otp);
        console.log('OTP deleted:', otp);
  
        return { message: 'Email verified successfully. You can now log in.' };
      }
      const user = await this.usersService.findById(otpUserId.toString());
      if (!user) {
        console.log('User not found for userId:', otpUserId);
        await this.otpService.delete(otpUserId.toString(), otp);
        throw new BadRequestException('User not found. Please register again.');
      }
      console.log('User found:', user);
      await this.otpService.delete(otpUserId.toString(), otp);
      console.log('OTP deleted:', otp);
  
      return {
        message: 'OTP verified successfully. You can now change your password.',
        userId: otpUserId.toString(),
      };
    } catch (error) {
      console.error('OTP verification error:', error);
      throw new BadRequestException(error.message || 'OTP verification failed');
    }
  }
  
  
  async forgotPassword(email: string) {
    try {
      console.log('Starting forgot password process for email:', email);

      const user = await this.usersService.findByEmail(email);
      if (!user) {
        console.log('User not found for email:', email);
        throw new BadRequestException('Không tìm thấy email.');
      }
      console.log('User found:', user);
      await this.otpService.resendOtp(user._id.toString(), true);
      console.log('OTP sent for password reset for user:', user._id);
      return {
        message: 'OTP sent to your email for password reset.',
        userId: user._id.toString(),
      };
    } catch (error) {
      console.error('Error during forgot password process:', error);
      const errorMessage =
        error.message || 'Unknown error occurred during forgot password process';
      throw new BadRequestException(errorMessage);
    }
  }
  async changePassword(userId: string, newPassword: string) {
    try {
      console.log('Changing password for userId:', userId);

      const user = await this.usersService.findById(userId);
      if (!user) {
        console.log('User not found for userId:', userId);
        throw new BadRequestException('User not found.');
      }
      console.log('User found:', user);

      await this.usersService.updatePassword(userId, newPassword);
      console.log('Password updated successfully for user:', userId);

      return {
        message:
          'Mật khẩu đã thay đổi. Bạn có thể đăng nhập lại!',
      };
    } catch (error) {
      console.error('Error during password change:', error);
      const errorMessage =
        error.message || 'Unknown error occurred during password change';
      throw new BadRequestException(errorMessage);
    }
  }
  async loginWithSocial(user: any) {
    console.log('User data from social provider:', user);
    if (!user.email) {
        throw new BadRequestException('Email is required for social login.');
    }

    let existingUser = await this.usersService.findByEmail(user.email);
    console.log('Existing user:', existingUser);

    if (!existingUser) {
        const username = user.firstName && user.lastName 
            ? `${user.firstName}_${user.lastName}` 
            : `social_user_${Date.now()}`;
        existingUser = await this.usersService.create(
            username,
            '', 
            user.email,
            'user',
            true,
        );
        console.log('New user created:', existingUser);
    }

    const payload = { username: existingUser.username, userId: existingUser._id.toString(), role: existingUser.role };
    return {
        access_token: this.jwtService.sign(payload),
        role: existingUser.role,
    };
}
async verifyGoogleCredential(credential: string) {
  try {
      const ticket = await this.googleClient.verifyIdToken({
          idToken: credential,
          audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (!payload) {
          throw new BadRequestException('Invalid Google credential');
      }

      const user = {
          email: payload.email,
          firstName: payload.given_name,
          lastName: payload.family_name,
          picture: payload.picture,
          accessToken: credential,
      };
      return this.loginWithSocial(user);
  } catch (error) {
      console.error('Error verifying Google credential:', error);
      throw new BadRequestException('Failed to verify Google credential: ' + error.message);
  }
}

}
