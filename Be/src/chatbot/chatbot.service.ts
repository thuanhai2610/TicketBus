import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { Trip, TripDocument } from 'src/function/trip/schemas/trip.schema';
import { GeminiService } from './gemini.service';

interface SessionState {
  step: string;
  data: Record<string, any>;
}

@Injectable()
export class ChatbotService {
  private sessions: Record<string, SessionState> = {};
  private bookingKeywords = [
    'đặt vé', 'mua vé', 'book', 'đặt chỗ', 'vé xe', 'lịch trình'
  ];
  
  // Từ khóa liên quan đến hành trình
  private routeKeywords = [
    'đi từ', 'muốn đi', 'chuyến xe', 'đi lại', 'về quê', 'đi đâu', 
    'đến đâu', 'chuyến đi'
  ];

  constructor(
    @InjectModel(Trip.name) private tripModel: Model<TripDocument>,
    private readonly geminiService: GeminiService,
  ) {}

  async getResponse(sessionId: string, message: string): Promise<string> {
    if (!this.sessions[sessionId]) {
      this.sessions[sessionId] = { step: 'start', data: {} };
    }

    const session = this.sessions[sessionId];
    const text = message.toLowerCase();

    // Kiểm tra nếu người dùng đang trong luồng đặt vé
if (session.step !== 'start' && session.step !== 'done') {
  // Nếu người dùng muốn hủy hoặc bắt đầu lại
  if (text.includes('hủy') || text.includes('bỏ') || text.includes('thoát') || text.includes('bắt đầu lại')) {
    session.step = 'start';
    return 'Đã hủy quá trình đặt vé. Bạn cần giúp gì không?';
  }

  // ✅ Nếu là câu hỏi về hành trình, nhưng không phải đặt vé, chuyển sang Gemini
  if (this.isRouteQuestion(text) && !this.isDirectBookingRequest(text)) {
    try {
      return await this.geminiService.askGemini(message);
    } catch (error) {
      console.error('Gemini API Error for route question:', error);
      return this.getRouteQuestionFallback(text);
    }
  }

  // Nếu không phải câu hỏi ngoài luồng, tiếp tục quy trình đặt vé
  return this.handleBookingFlow(sessionId, message);
}

    
    // Kiểm tra nếu đây là câu hỏi về hành trình hoặc khoảng cách mà không phải yêu cầu đặt vé
    if (this.isRouteQuestion(text) && !this.isDirectBookingRequest(text)) {
      try {
        return await this.geminiService.askGemini(message);
      } catch (error) {
        console.error('Gemini API Error for route question:', error);
        return this.getRouteQuestionFallback(text);
      }
    }
    
    // Check if the user wants to start booking a ticket
    const isBookingRequest = this.isDirectBookingRequest(text);
    
    if (isBookingRequest) {
      // Start the booking flow
      session.step = 'ask_departure';
      return 'Chào bạn! Bạn muốn đi từ đâu?';
    } else {
      // If not a booking request, try to send to Gemini with fallback responses
      try {
        const aiResponse = await this.geminiService.askGemini(message);
        return aiResponse;
      } catch (error) {
        console.error('Gemini API Error:', error);
        
        // Provide fallback responses based on common questions
        return this.getFallbackResponse(text);
      }
    }
  }

  // Kiểm tra nếu đây là câu hỏi về tuyến đường/khoảng cách
  private isRouteQuestion(text: string): boolean {
    const routePatterns = [
      /từ (.+?) đến (.+?) có xa không/i,
      /từ (.+?) tới (.+?) mất bao lâu/i,
      /đi từ (.+?) đến (.+?) mất bao (lâu|nhiêu)/i,
      /khoảng cách (.+?) (đến|tới) (.+?)/i,
      /(.+?) cách (.+?) bao xa/i,
      /có xe từ (.+?) (đi|đến) (.+?) không/i
    ];
  
    return routePatterns.some(pattern => pattern.test(text));
  }
  

  // Kiểm tra nếu đây là yêu cầu đặt vé trực tiếp
  private isDirectBookingRequest(text: string): boolean {
    return this.bookingKeywords.some(keyword => text.includes(keyword));
  }

  // Phản hồi dự phòng cho câu hỏi về tuyến đường khi Gemini gặp lỗi
  private getRouteQuestionFallback(text: string): string {
    let locations: string[] = [];
  
    // Regex nhận diện địa điểm trong câu hỏi
    const locationPatterns = [
      /từ (.+?) đến (.+?)(?: |$)/i,
      /từ (.+?) tới (.+?)(?: |$)/i,
      /đi từ (.+?) đến (.+?)(?: |$)/i,
      /(.+?) cách (.+?)(?: |$)/i
    ];
  
    for (const pattern of locationPatterns) {
      const match = text.match(pattern);
      if (match && match[1] && match[2]) {
        locations = [match[1], match[2]];
        break;
      }
    }
  
    if (locations.length === 2) {
      return `Tuyến đường từ **${locations[0]}** đến **${locations[1]}** có thể mất một khoảng thời gian khác nhau tùy vào phương tiện di chuyển. 
  Bạn có muốn xem các chuyến xe khách cho tuyến này không? Hãy nói "Đặt vé từ ${locations[0]} đến ${locations[1]}" để bắt đầu.`;
    }
  
    return 'Tôi hiểu bạn đang hỏi về một hành trình, nhưng tôi không có thông tin chi tiết. Bạn có muốn đặt vé cho hành trình này không?';
  }
  
  private getFallbackResponse(text: string): string {
    // Common patterns and responses for when OpenAI is unavailable
    if (text.includes('tôi là ai') || text.includes('bạn biết tôi là ai') || text.includes('tên tôi là gì')) {
      return 'Xin chào! Tôi là trợ lý ảo của dịch vụ đặt vé xe khách. Tôi không biết thông tin cá nhân của bạn trừ khi bạn đã cung cấp trong cuộc trò chuyện này. Bạn có muốn đặt vé xe không?';
    }
    
    if (text.includes('bạn là ai') || text.includes('bạn tên gì') || text.includes('tên bạn là gì')) {
      return 'Tôi là trợ lý ảo của dịch vụ đặt vé xe khách, được tạo ra để giúp bạn đặt vé và trả lời các câu hỏi về dịch vụ. Bạn cần giúp đỡ gì không?';
    }
    
    if (text.includes('thời tiết') || text.includes('mưa') || text.includes('nắng')) {
      return 'Tôi là trợ lý đặt vé xe và không có thông tin về thời tiết. Tuy nhiên, bạn có thể kiểm tra dự báo thời tiết trên các ứng dụng thời tiết hoặc trang web thời tiết để lên kế hoạch cho chuyến đi của mình.';
    }
    
    if (text.includes('giá vé') || text.includes('bao nhiêu tiền') || text.includes('phí')) {
      return 'Giá vé phụ thuộc vào tuyến đường và thời điểm bạn muốn đi. Để biết giá vé chính xác, bạn có thể bắt đầu quy trình đặt vé bằng cách nói "Tôi muốn đặt vé" hoặc "Tôi muốn đi từ [địa điểm]".';
    }

    if (text.includes('chào') || text.includes('hello') || text.includes('hi')) {
      return 'Xin chào! Tôi là trợ lý đặt vé xe khách. Bạn cần tôi giúp gì không? Bạn có thể hỏi về dịch vụ đặt vé hoặc bắt đầu đặt vé ngay bằng cách nói "Tôi muốn đặt vé đi [địa điểm]".';
    }
    
    if (text.includes('cảm ơn') || text.includes('thank')) {
      return 'Không có gì! Rất vui được giúp đỡ bạn. Nếu bạn cần đặt vé hoặc có thắc mắc khác, hãy cho tôi biết nhé.';
    }
    
    // Default response for unmatched queries
    return 'Xin lỗi, hiện tại tôi chỉ có thể trả lời các câu hỏi cơ bản. Tôi có thể giúp bạn đặt vé xe khách không? Hãy nói "Tôi muốn đặt vé" để bắt đầu.';
  }

  private async handleBookingFlow(sessionId: string, message: string): Promise<string> {
    const session = this.sessions[sessionId];
    const text = message.toLowerCase();

    switch (session.step) {
      case 'ask_departure':
        session.data.departurePoint = text;
        session.step = 'ask_destination';
        return 'Bạn muốn đến đâu?';

      case 'ask_destination':
        session.data.destinationPoint = text;
        session.step = 'ask_date';
        return 'Bạn muốn đi vào ngày nào (dd/mm/yyyy)?';

      case 'ask_date':
        // Validate date format
        const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
        const match = text.match(dateRegex);
        
        if (!match) {
          return 'Ngày không đúng định dạng. Vui lòng nhập ngày theo định dạng dd/mm/yyyy (ví dụ: 15/05/2025)';
        }
        
        const [, day, month, year] = match;
        const startDate = new Date(`${year}-${month}-${day}T00:00:00`);
        
        // Check if date is valid
        if (isNaN(startDate.getTime())) {
          return 'Ngày không hợp lệ. Vui lòng nhập lại theo định dạng dd/mm/yyyy.';
        }
        
        session.data.dateText = text;
        const endDate = new Date(`${year}-${month}-${day}T23:59:59`);

        try {
          const trips = await this.tripModel.find({
            departurePoint: new RegExp(session.data.departurePoint, 'i'),
            destinationPoint: new RegExp(session.data.destinationPoint, 'i'),
            departureTime: { $gte: startDate, $lte: endDate },
            status: { $in: ['PENDING', 'IN_PROGRESS'] },
          });

          if (!trips.length) {
            session.step = 'start';
            return 'Không tìm thấy chuyến nào phù hợp. Bạn có thể thử lại từ đầu hoặc hỏi tôi về thông tin khác.';
          }

          session.data.availableTrips = trips;
          session.step = 'confirm';

          const list = trips.map((trip, i) => {
            const time = trip.departureTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
            return `Chuyến ${i + 1}: ${trip.departurePoint} → ${trip.destinationPoint}, Giờ đi: ${time}, Giá: ${trip.price.toLocaleString()}đ`;
          }).join('\n');

          return `✅ Có các chuyến sau:\n${list}\nBạn muốn đặt chuyến nào? (ví dụ: "Chuyến 1")`;
        } catch (error) {
          console.error('Database Error:', error);
          session.step = 'start';
          return 'Đã xảy ra lỗi khi tìm kiếm chuyến đi. Vui lòng thử lại sau.';
        }

      case 'confirm':
        const indexMatch = text.match(/chuyến\s+(\d+)/i);
        if (!indexMatch) {
          return 'Vui lòng chọn chuyến bằng cách nhập "Chuyến" và số thứ tự (ví dụ: "Chuyến 1").';
        }
        
        const index = Number(indexMatch[1]) - 1;
        const chosenTrip = session.data.availableTrips?.[index];
        
        if (!chosenTrip) {
          return 'Chuyến không hợp lệ. Vui lòng chọn lại.';
        }
        
        session.step = 'done';
        return `🎉 Hãy vào mục Tra cứu vé\nChọn tuyến đi là: ${chosenTrip.departurePoint} → đến là ${chosenTrip.destinationPoint}.\nChọn ngày đi bạn muốn thì sẽ ra vé xe bạn muốn đặt.\nCảm ơn bạn! Bạn cần giúp đỡ gì thêm không?`;

      default:
        session.step = 'start';
        return 'Tôi chưa hiểu, bạn muốn đặt vé đi đâu?';
    }
  }
}