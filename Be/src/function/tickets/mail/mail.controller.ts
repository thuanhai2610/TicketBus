import { Controller, Post, Body, Get } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('send-ticket')
  async sendTicketEmail(@Body() body: { to: string; ticketInfo: any }) {
    await this.mailService.sendTicketEmail(body.to, body.ticketInfo);
    return { message: 'Email vé đã được gửi thành công' };
  }

}