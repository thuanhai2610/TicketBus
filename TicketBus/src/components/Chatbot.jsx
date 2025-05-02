// src/components/ChatBot.jsx
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const sessionId = uuidv4();

const ChatBot = () => {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Chào bạn! Bạn muốn đặt vé xe không?' },
  ]);
  const [input, setInput] = useState('');
  const endRef = useRef(null);

  // Tự scroll xuống cuối khi có tin nhắn mới
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    try {
      const res = await axios.post('http://localhost:3001/chatbot/message', {
        sessionId,
        message: input,
      });
      let botText = res.data.response;
      if (typeof botText === 'object') {
        botText = JSON.stringify(botText, null, 2);
      }
      const botMsg = { sender: 'bot', text: botText };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 flex flex-col h-[600px] border rounded-lg shadow-lg overflow-hidden">
      <div className="bg-blue-600 text-white text-lg font-medium p-4">
        🎫 Chatbot Hướng dẫn Đặt Vé Xe
      </div>

      <div className="flex-1 bg-gray-50 p-4 overflow-y-auto space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`px-4 py-2 rounded-2xl max-w-[80%] whitespace-pre-wrap
                ${msg.sender === 'user'
                  ? 'bg-blue-500 text-white rounded-br-none'
                  : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}
            >
              <span className="font-semibold">
                {msg.sender === 'user' ? 'Bạn: ' : 'Bot: '}
              </span>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="flex p-3 border-t bg-white">
        <input
          type="text"
          className="flex-1 border rounded-l-lg px-4 py-2 focus:outline-none"
          placeholder="Nhập tin nhắn..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-5 py-2 rounded-r-lg hover:bg-blue-700 transition"
        >
          Gửi
        </button>
      </div>
    </div>
  );
};

export default ChatBot;
