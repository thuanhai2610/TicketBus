import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';

// DTO cho tin nhắn đến
export class MessageDto {
  sessionId: string;
  message: string;
}

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('message')
  async getMessage(@Body() messageDto: MessageDto) {
    try {
      // Kiểm tra dữ liệu đầu vào
      if (!messageDto.message || !messageDto.sessionId) {
        throw new HttpException(
          'Thiếu thông tin tin nhắn hoặc sessionId',
          HttpStatus.BAD_REQUEST
        );
      }

      // Xử lý tin nhắn qua service
      const response: string = await this.chatbotService.getResponse(
        messageDto.sessionId,
        messageDto.message,
      );

      // Trả về phản hồi
      return {
        success: true,
        response,
        sessionId: messageDto.sessionId
      };
    } catch (error) {
      // Xử lý lỗi
      console.error('Lỗi xử lý tin nhắn:', error);
      
      // Trả về thông báo lỗi thân thiện cho người dùng
      throw new HttpException(
        {
          success: false,
          response: 'Xin lỗi, hệ thống đang gặp sự cố. Vui lòng thử lại sau.',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}