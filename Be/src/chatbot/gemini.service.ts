import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model;

  constructor() {
    // Khởi tạo Google Generative AI với API key từ biến môi trường
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY không được cấu hình trong môi trường');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey || '');
    // Sử dụng gemini-1.5-pro (model mới nhất) thay vì gemini-pro
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }

  async askGemini(prompt: string): Promise<string> {
    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY không được cấu hình');
      }
  
      const systemPrompt = `Bạn là trợ lý ảo của dịch vụ đặt vé xe khách. 
      Hãy trả lời các câu hỏi về dịch vụ đặt vé, thông tin chung, và các câu hỏi thông thường khác. 

      - Khi trả lời về khoảng cách giữa các địa điểm, hãy cung cấp thông tin ước tính và gợi ý về thời gian di chuyển.
      - Khi trả lời về tuyến đường, hãy mô tả ngắn gọn về lộ trình điển hình và phương tiện di chuyển.
      - Với câu hỏi về thời gian di chuyển, hãy đưa ra ước tính hợp lý dựa trên khoảng cách.
      
      Trả lời ngắn gọn, thân thiện và bằng tiếng Việt.`;
  
      const generationConfig = {
        temperature: 0.7,
        maxOutputTokens: 200, // Tăng token để có câu trả lời chi tiết hơn
        topK: 40,
        topP: 0.95,
      };
  
      const chatSession = this.model.startChat({
        history: [
          {
            role: 'user',
            parts: [{ text: 'Bạn có thể giúp tôi đặt vé xe khách không?' }],
          },
          {
            role: 'model',
            parts: [{ text: 'Chào bạn! Tôi là trợ lý ảo của dịch vụ đặt vé xe khách. Tôi có thể giúp bạn đặt vé, trả lời các thắc mắc về lịch trình, giá vé, và các thông tin liên quan đến dịch vụ xe khách. Bạn cần giúp đỡ cụ thể như thế nào?' }],
          },
        ],
        generationConfig,
      });

      // Thêm system prompt như một tin nhắn riêng
      await chatSession.sendMessage(systemPrompt);
  
      // Thiết lập timeout 10 giây
      const result = await Promise.race([
        chatSession.sendMessage(prompt),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Gemini API timeout')), 10000)
        ),
      ]);
  
      const text = result?.response?.text();
      return text || 'Xin lỗi, tôi không hiểu câu hỏi của bạn.';
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw error;
    }
  }
}