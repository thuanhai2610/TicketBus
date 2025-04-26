import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Message, MessageSchema } from './message.schema';
import { UsersModule } from 'src/users/users.module';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    UsersModule,
  ],
  providers: [ChatGateway, ChatService],
  exports: [ChatGateway, ChatService],
  controllers: [ChatController]
})
export class ChatModule {}