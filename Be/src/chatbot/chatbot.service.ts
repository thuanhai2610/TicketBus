import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Injectable } from '@nestjs/common';
import { Trip, TripDocument } from 'src/function/trip/schemas/trip.schema';
interface SessionState {
    step: string;
    data: Record<string, any>;
  }
@Injectable()
export class ChatbotService {
  private sessions: Record<string, SessionState> = {};

  constructor(
    @InjectModel(Trip.name) private tripModel: Model<TripDocument>,
  ) {}

  async getResponse(sessionId: string, message: string): Promise<string> {
    if (!this.sessions[sessionId]) {
      this.sessions[sessionId] = { step: 'start', data: {} };
    }

    const session = this.sessions[sessionId];
    const text = message.toLowerCase();

    switch (session.step) {
      case 'start':
        session.step = 'ask_departure';
        return 'Chào bạn! Bạn muốn đi từ đâu?';

      case 'ask_departure':
        session.data.departurePoint = text;
        session.step = 'ask_destination';
        return 'Bạn muốn đến đâu?';

      case 'ask_destination':
        session.data.destinationPoint = text;
        session.step = 'ask_date';
        return 'Bạn muốn đi vào ngày nào (dd/mm/yyyy)?';

      case 'ask_date':
        session.data.dateText = text;
        const [day, month, year] = text.split('/');
        const startDate = new Date(`${year}-${month}-${day}T00:00:00`);
        const endDate = new Date(`${year}-${month}-${day}T23:59:59`);

        const trips = await this.tripModel.find({
          departurePoint: new RegExp(session.data.departurePoint, 'i'),
          destinationPoint: new RegExp(session.data.destinationPoint, 'i'),
          departureTime: { $gte: startDate, $lte: endDate },
          status: { $in: ['PENDING', 'IN_PROGRESS'] },
        });

        if (!trips.length) {
          session.step = 'start';
          return 'Không tìm thấy chuyến nào phù hợp. Bạn có thể thử lại từ đầu.';
        }

        session.data.availableTrips = trips;
        session.step = 'confirm';

        const list = trips.map((trip, i) => {
          const time = trip.departureTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
          return `Chuyến ${i + 1}: ${trip.departurePoint} → ${trip.destinationPoint}, Giờ đi: ${time}, Giá: ${trip.price.toLocaleString()}đ`;
        }).join('\n');

        return `✅ Có các chuyến sau:\n${list}\nBạn muốn đặt chuyến nào? (ví dụ: "Chuyến 1")`;

      case 'confirm':
        const index = Number(text.match(/\d+/)?.[0]) - 1;
        const chosenTrip = session.data.availableTrips?.[index];

        if (!chosenTrip) return 'Chuyến không hợp lệ. Vui lòng chọn lại.';

        session.step = 'done';
        const chosenTime = chosenTrip.departureTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

        return `🎉 Đặt vé thành công!\nTuyến: ${chosenTrip.departurePoint} → ${chosenTrip.destinationPoint}\nGiờ đi: ${chosenTime}\nGiá: ${chosenTrip.price.toLocaleString()}đ\nCảm ơn bạn!`;

      case 'done':
        return 'Bạn đã đặt vé rồi. Gõ "đặt vé mới" để bắt đầu lại.';

      default:
        session.step = 'start';
        return 'Tôi chưa hiểu, bạn muốn đặt vé đi đâu?';
    }
    
  }

  
}
