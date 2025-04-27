import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  },
})
export class ChatGateway {
  constructor(private readonly chatService: ChatService) {}

  @SubscribeMessage('join')
  async handleJoin(@MessageBody() userId: string, @ConnectedSocket() client: Socket) {
    client.join(userId); // User joins their own room
  }

  @SubscribeMessage('getUserList')
  async handleGetUserList(@ConnectedSocket() client: Socket) {
    const users = await this.chatService.getUserList();
    client.emit('userList', users);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: { senderId: string; receiverId: string; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    // Check if data is valid
    if (!data.senderId || !data.receiverId || !data.content?.trim()) {
      client.emit('error', 'Dữ liệu tin nhắn không hợp lệ');
      return;
    }

    try {
      // Save the message to database
      const message = await this.chatService.saveMessage(
        data.senderId, 
        data.receiverId, 
        data.content
      );
      
      // Send to the receiver
      client.to(data.receiverId).emit('receiveMessage', message);
      
      // The sender will see their message from their own UI addition, not from server echo
    } catch (error) {
      client.emit('error', 'Không thể gửi tin nhắn: ' + error.message);
    }
  }

  @SubscribeMessage('getMessages')
  async handleGetMessages(
    @MessageBody() data: { senderId: string; currentUserId?: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const admin = await this.chatService.findAdmin();
      if (!admin) {
        client.emit('error', 'Không tìm thấy admin');
        return;
      }
      
      const adminId = admin._id.toString();
      
      // If sender is admin, we need the currentUserId parameter 
      let messages;
      if (data.senderId === adminId && data.currentUserId) {
        // Admin is requesting chat with specific user
        messages = await this.chatService.getMessages(data.currentUserId, adminId);
      } else if (data.senderId !== adminId) {
        // Regular user is requesting their chat with admin
        messages = await this.chatService.getMessages(data.senderId, adminId);
      } else {
        client.emit('error', 'Thông tin người dùng không hợp lệ');
        return;
      }
      
      client.emit('messages', messages);
    } catch (error) {
      client.emit('error', 'Không thể tải tin nhắn: ' + error.message);
    }
  }
}