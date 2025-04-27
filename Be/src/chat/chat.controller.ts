// src/chat/chat.controller.ts
import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Message } from './message.schema';

class CreateMessageDto {
  senderId: string;
  receiverId: string;
  content: string;
}

@Controller('messages')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async create(@Body() dto: CreateMessageDto): Promise<Message | null> {
    return this.chatService.saveMessage(
      dto.senderId,
      dto.receiverId,
      dto.content,
    );
  }

  @Get()
  async findAll(
    @Query('senderId') senderId: string,
    @Query('receiverId') receiverId: string,
  ): Promise<Message[]> {
    return this.chatService.getMessages(senderId, receiverId);
  }
 
}
