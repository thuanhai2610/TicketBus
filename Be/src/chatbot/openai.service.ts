import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class OpenaiService {
  private openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  async askGPT(prompt: string): Promise<string> {
    const chatCompletion = await this.openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-3.5-turbo',
    });

    return chatCompletion.choices[0]?.message?.content || 'Xin lỗi, tôi không hiểu.';
  }
}
