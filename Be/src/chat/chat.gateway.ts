import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
  } from '@nestjs/websockets';
  import { Socket } from 'socket.io';
  import { ChatService } from './chat.service';
  
  @WebSocketGateway({ cors: { origin: ['http://localhost:3000'], methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,} })
  export class ChatGateway {
    constructor(private readonly chatService: ChatService) {}
  
    @SubscribeMessage('join')
    async handleJoin(
      @MessageBody() userId: string,
      @ConnectedSocket() client: Socket,
    ) {
      client.join(userId); // Tham gia phòng với userId
    }
  
    @SubscribeMessage('sendMessage')
    async handleMessage(
      @MessageBody() data: { senderId: string; content: string },
      @ConnectedSocket() client: Socket,
    ) {
      const admin = await this.chatService.findAdmin();
      if (!admin) {
        client.emit('error', 'Không tìm thấy admin');
        return;
      }
  
      const message = await this.chatService.saveMessage(
        data.senderId,
        admin._id.toString(),
        data.content,
      );
  
      // Gửi tin nhắn đến người nhận (admin) và người gửi
      client.to(admin._id.toString()).emit('receiveMessage', message);
      client.emit('receiveMessage', message);
    }
  
    @SubscribeMessage('getMessages')
    async handleGetMessages(
      @MessageBody() data: { senderId: string },
      @ConnectedSocket() client: Socket,
    ) {
      const admin = await this.chatService.findAdmin();
      if (!admin) {
        client.emit('error', 'Không tìm thấy admin');
        return;
      }
  
      const messages = await this.chatService.getMessages(
        data.senderId,
        admin._id.toString(),
      );
      client.emit('messages', messages);
    }
  }