import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Otp } from './otp.schema';

@Injectable()
export class OtpService {
  constructor(@InjectModel(Otp.name) private otpModel: Model<Otp>) {}

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

async findByOtp(otp: string): Promise<Otp | null> {
    const now = new Date();
    return this.otpModel.findOne({ otp, expiresAt: { $gt: now } }).exec();
}

async delete(userId: string, otp: string): Promise<void> {
    const userIdObject = new Types.ObjectId(userId);
    await this.otpModel.deleteOne({ userId: userIdObject, otp }).exec();
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
}