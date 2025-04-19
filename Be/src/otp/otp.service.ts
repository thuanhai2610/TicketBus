import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Otp } from './otp.schema';
import { randomInt } from 'crypto';
import * as nodemailer from 'nodemailer';
import { PendingUser } from 'src/pending-users/schemas/pending-user.schema';
import { User } from 'src/users/user.schema';
@Injectable()
export class OtpService {
  private transporter: nodemailer.Transporter;
  constructor(@InjectModel(Otp.name) private otpModel: Model<Otp>,
@InjectModel(PendingUser.name) private pendingUserModel: Model<PendingUser>,
@InjectModel(User.name) private userModel: Model<User>
) {
  this.transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD, // Sử dụng biến môi trường
    },
  });
}

  async create(userId: string, otp: string): Promise<Otp> {
    const userIdObject = new Types.ObjectId(userId);
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + 10 * 60 * 1000);  
    const newOtp = new this.otpModel({
      userId: userIdObject,
      otp,
      createdAt,
      expiresAt,
    });
    return newOtp.save();
  }
  async findByOtpAndUserId(otp: string, userId: string): Promise<Otp | null> {
    const userIdObject = new Types.ObjectId(userId);
    const now = new Date();
    return this.otpModel.findOne({
      otp,
      userId: userIdObject,
      expiresAt: { $gt: now },
    }).exec();
  }

  async findByOtpWithoutExpiration(otp: string): Promise<Otp | null> {
    const otpRecord = await this.otpModel.findOne({ otp }).exec();
    if (!otpRecord) {
      console.log('No OTP record found for:', otp);
    } else {
      console.log('OTP record found :', otpRecord);
    }
    return otpRecord;
  }
  async delete(userId: string, otp: string): Promise<void> {
    const userIdObject = new Types.ObjectId(userId);
    await this.otpModel.deleteOne({ userId: userIdObject, otp }).exec();
  }
  async resendOtp(userId: string, isForgotPassword: boolean = false): Promise<Otp> {
    const userIdObject = new Types.ObjectId(userId);

    let user: User | PendingUser | null;
    if (isForgotPassword) {
      user = await this.userModel.findById(userIdObject).exec();
    } else {
      user = await this.pendingUserModel.findById(userIdObject).exec();
    }

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.delete1(userId);

    const newOtp = randomInt(100000, 999999).toString();
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + 10 * 60 * 1000);

    const otpRecord = new this.otpModel({
      userId: userIdObject,
      otp: newOtp,
      createdAt,
      expiresAt,
    });

    await otpRecord.save();
    await this.sendOtpEmail(userId, newOtp, isForgotPassword);

    return otpRecord;
  }

  async sendOtpEmail(userId: string, otp: string, isForgotPassword: boolean = false): Promise<void> {
    let user: User | PendingUser | null;
    if (isForgotPassword) {
      user = await this.userModel.findById(userId).exec();
    } else {
      user = await this.pendingUserModel.findById(userId).exec();
    }

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Mã OTP mới của bạn',
      text: `Mã OTP mới của bạn là: ${otp}. Mã này có hiệu lực trong 10 phút.`,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`OTP sent to ${user.email}`);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send OTP email');
    }
  }
  async delete1(userId: string, otp?: string): Promise<void> {
    const userIdObject = new Types.ObjectId(userId);
    const query: any = { userId: userIdObject };
    if (otp) query.otp = otp;
    await this.otpModel.deleteMany(query).exec();
  }
}
