// src/chatbot/chatbot.module.ts
import { Module } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { ChatbotController } from './chatbot.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Trip, TripSchema } from 'src/function/trip/schemas/trip.schema';
import { GeminiModule } from './gemini.module';




@Module({
  imports: [
    MongooseModule.forFeature([{ name: Trip.name, schema: TripSchema }]),
    GeminiModule, // <-- Thêm dòng này
  ],
  controllers: [ChatbotController],
  providers: [ChatbotService],
})
export class ChatbotModule {}
