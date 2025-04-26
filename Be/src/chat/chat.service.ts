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
  ): Promise<Message> {
    const message = new this.messageModel({
      sender: senderId,
      receiver: receiverId,
      content,
    });
    return message.save();
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
      .exec();
  }

  async findAdmin(): Promise<User | null> {
    return this.userModel.findOne({ role: 'admin' }).exec();
  }

}