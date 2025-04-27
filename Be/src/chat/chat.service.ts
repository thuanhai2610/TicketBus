import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from './message.schema';
import { User, UserDocument } from 'src/users/user.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async saveMessage(
    senderId: string,
    receiverId: string,
    content: string,
  ): Promise<Message | null> {
    const message = new this.messageModel({
      sender: senderId,
      receiver: receiverId,
      content,
    });
    
    // Populate sender and receiver before returning
    const savedMessage = await message.save();
    return this.messageModel
      .findById(savedMessage._id)
      .populate('sender receiver')
      .exec();
  }

  async getMessages(senderId: string, receiverId: string): Promise<Message[]> {
    return this.messageModel
      .find({
        $or: [
          { sender: senderId, receiver: receiverId },
          { sender: receiverId, receiver: senderId },
        ],
      })
      .populate('sender receiver')
      .sort({ createdAt: 1 }) // Sort by time ascending
      .exec();
  }

  async findAdmin(): Promise<User | null> {
    return this.userModel.findOne({ role: 'admin' }).exec();
  }
  
  async getUserList(): Promise<User[]> {
    // Find all unique users who have sent or received messages, excluding the admin
    const adminId = (await this.findAdmin())?._id.toString();
    
    // Get distinct users from messages
    const messageUsers = await this.messageModel.aggregate([
      {
        $match: {
          $or: [
            { sender: { $ne: adminId } },
            { receiver: { $ne: adminId } }
          ]
        }
      },
      {
        $project: {
          userId: {
            $cond: [
              { $eq: ["$sender", adminId] },
              "$receiver",
              "$sender"
            ]
          }
        }
      },
      { $group: { _id: "$userId" } }
    ]);
    
    // Get user information for these users
    const userIds = messageUsers.map(item => item._id);
    return this.userModel
      .find({ _id: { $in: userIds } })
      .select('_id username avatar')
      .exec();
  }
}