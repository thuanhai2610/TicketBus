import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const sessionId = uuidv4();

const ChatBot = () => {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Chào bạn! Bạn muốn đặt vé xe không?' },
  ]);
  const [input, setInput] = useState('');
  const chatContainerRef = useRef(null);

  // Tự động cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/chatbot/message`, {
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
    <div className="mt-36 w-full max-w-md mx-auto my-12 flex flex-col h-[600px] bg-gray-50 rounded-xl shadow-lg">
      {/* Tiêu đề */}
      <div className="p-4 bg-primary text-white text-lg font-medium rounded-t-xl">
        🎫 Chatbot Hướng dẫn Đặt Vé Xe
      </div>

      {/* Phần tin nhắn với thanh cuộn */}
      <div
        ref={chatContainerRef}
        className="flex-1 p-4 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 bg-white"
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`px-4 py-2 rounded-xl max-w-[80%] whitespace-pre-wrap shadow-sm
                ${msg.sender === 'user'
                  ? 'bg-primary text-white rounded-br-none'
                  : 'bg-gray-200 text-gray-800 rounded-bl-none'
                }`}
            >
              <span className="font-semibold">
                {msg.sender === 'user' ? 'Bạn: ' : 'Bot: '}
              </span>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Thanh nhập liệu */}
      <div className="p-3 bg-gray-50 border-t border-gray-200 rounded-b-xl">
        <div className="flex items-center">
          <input
            type="text"
            className="flex-1 p-2.5 text-sm border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
            placeholder="Nhập tin nhắn..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="p-2.5 bg-primary text-white rounded-r-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;