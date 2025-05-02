import { Controller, Post, Body } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { MessageDto } from './dto/message.dto';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('message')
  async getMessage(@Body() messageDto: MessageDto) {
    const response: string = await this.chatbotService.getResponse(
      messageDto.sessionId,
      messageDto.message,
    );
    return { response };
  }

}
