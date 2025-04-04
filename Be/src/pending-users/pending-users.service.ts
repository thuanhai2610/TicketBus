import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PendingUser, PendingUserDocument } from './schemas/pending-user.schema';

@Injectable()
export class PendingUsersService {
    constructor(@InjectModel(PendingUser.name) private pendingUserModel: Model<PendingUserDocument>) {}

    async create(
        username: string,
        hashedPassword: string,
        email: string,
        role: string = 'user',
        isEmailVerified: boolean = false,
      ): Promise<PendingUserDocument> {
        try {
          // Check for existing pending user
          const existingPendingUser = await this.pendingUserModel
            .findOne({ username })
            .exec();
          if (existingPendingUser) {
            console.log('Pending user already exists:', username);
            throw new BadRequestException('Pending user already exists');
          }
    
          const newPendingUser = new this.pendingUserModel({
            username,
            password: hashedPassword,
            email,
            role,
            isEmailVerified,
          });
          const savedPendingUser = await newPendingUser.save();
          console.log('Pending user created:', savedPendingUser._id);
          return savedPendingUser;
        } catch (error) {
          console.error('Error creating pending user:', error);
          throw new BadRequestException('Failed to create pending user: ' + error.message);
        }
      }

    async findById(id: string): Promise<PendingUserDocument | null> {
        const userId = new Types.ObjectId(id);
        return this.pendingUserModel.findById(userId).exec();
    }

    async findByUsername(username: string): Promise<PendingUserDocument | null> {
        return this.pendingUserModel.findOne({ username }).exec();
    }

    async delete(id: string): Promise<void> {
        const userId = new Types.ObjectId(id);
        const result = await this.pendingUserModel.deleteOne({ _id: userId }).exec();
        if (result.deletedCount === 0) {
            throw new NotFoundException('Pending user not found');
        }
    }
    async createPendingUser(
        username: string,
        password: string,
        email: string,
        role: string,
    ): Promise<PendingUserDocument> {
        const newPendingUser = new this.pendingUserModel({
            username,
            password,
            email,
            role,
            isEmailVerified: false,
        });
        return newPendingUser.save();
    }

    async findPendingUserById(id: string): Promise<PendingUserDocument | null> {
        const userId = new Types.ObjectId(id);
        return this.pendingUserModel.findById(userId).exec();
    }
}