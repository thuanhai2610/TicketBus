/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

const sessionId = uuidv4();

const ChatBot = () => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Chào bạn! Bạn muốn đặt vé xe không?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [notificationModal, setNotificationModal] = useState({
    show: false,
    message: "",
    type: "error",
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const chatContainerRef = useRef(null);

  // Handle resize for mobile/desktop toggle
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/chatbot/message`, {
        sessionId,
        message: input,
      });
      let botText = res.data.response;
      if (typeof botText === "object") {
        botText = JSON.stringify(botText, null, 2);
      }
      const botMsg = { sender: "bot", text: botText };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setNotificationModal({
        show: true,
        message: "Không gửi được tin nhắn! Vui lòng thử lại.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const closeNotificationModal = () => {
    setNotificationModal({ show: false, message: "", type: "error" });
  };

  // Modal for error notifications
  const NotificationModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={`bg-white dark:bg-primary rounded-lg shadow-xl p-4 sm:p-6 w-11/12 max-w-sm ${
          isMobile ? "mx-4" : ""
        }`}
      >
        <h3 className="text-lg font-semibold mb-4 text-red-500 dark:text-red-400">Lỗi</h3>
        <p className="text-sm text-gray-600 dark:text-neutral-300 mb-6">
          {notificationModal.message}
        </p>
        <div className="flex justify-end">
          <button
            onClick={closeNotificationModal}
            className="px-4 py-1.5 bg-primary hover:bg-primaryblue text-white rounded-lg text-sm"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );

  // Desktop layout
  const DesktopChatBot = (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-24 px-4">
      <div className="max-w-md mx-auto my-12 flex flex-col h-[600px] bg-white dark:bg-gray-900 rounded-xl shadow-md">
        {/* Header */}
        <div className="p-4 bg-primary text-neutral-50 text-lg font-semibold rounded-t-xl">
          🎫 Chatbot Hướng dẫn Đặt Vé Xe
        </div>

        {/* Messages */}
        <div
          ref={chatContainerRef}
          className="flex-1 p-5 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 bg-white dark:bg-gray-900"
        >
          {loading && (
            <div className="text-center text-primary dark:text-neutral-50 text-sm">
              Đang xử lý...
            </div>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-4 py-2 rounded-lg max-w-[80%] whitespace-pre-wrap shadow-sm
                  ${msg.sender === "user"
                    ? "bg-primary text-white rounded-br-none"
                    : "bg-gray-100 dark:bg-gray-700 text-neutral-900 dark:text-neutral-50 rounded-bl-none"
                  }`}
              >
                <span className="font-semibold">
                  {msg.sender === "user" ? "Bạn: " : "Bot: "}
                </span>
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 rounded-b-xl">
          <div className="flex items-center">
            <input
              type="text"
              className="flex-1 p-2 text-sm border border-gray-300 dark:border-gray-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800 text-neutral-900 dark:text-neutral-50"
              placeholder="Nhập tin nhắn..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="p-2 bg-primary text-white rounded-r-lg hover:bg-primaryblue disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary transition"
            >
              Gửi
            </button>
          </div>
        </div>
      </div>
      {notificationModal.show && <NotificationModal />}
    </div>
  );

  // Mobile layout
  const MobileChatBot = (
    <div className="sm:hidden min-h-screen bg-white dark:bg-primary py-16 px-4">
      <div className="max-w-md mx-auto my-8 flex flex-col h-[500px] bg-white dark:bg-gray-900 rounded-lg shadow-sm">
        {/* Header */}
        <div className="p-3 bg-primary text-neutral-50 text-base font-semibold rounded-t-lg">
          🎫 Chatbot Hướng dẫn Đặt Vé
        </div>

        {/* Messages */}
        <div
          ref={chatContainerRef}
          className="flex-1 p-4 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 bg-white dark:bg-gray-900"
        >
          {loading && (
            <div className="text-center text-primary dark:text-neutral-50 text-xs">
              Đang xử lý...
            </div>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-3 py-1.5 rounded-lg max-w-[80%] whitespace-pre-wrap shadow-sm
                  ${msg.sender === "user"
                    ? "bg-primary text-white rounded-br-none"
                    : "bg-gray-100 dark:bg-gray-700 text-neutral-900 dark:text-neutral-50 rounded-bl-none"
                  }`}
              >
                <span className="font-semibold text-sm">
                  {msg.sender === "user" ? "Bạn: " : "Bot: "}
                </span>
                <span className="text-sm">{msg.text}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 rounded-b-xl">
          <div className="flex items-center">
            <input
              type="text"
              className="flex-1 p-2 text-xs border border-gray-300 dark:border-gray-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800 text-neutral-900 dark:text-neutral-50"
              placeholder="Nhập tin nhắn..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="p-2 bg-primary text-white rounded-r-lg hover:bg-primaryblue disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary transition"
            >
              Gửi
            </button>
          </div>
        </div>
      </div>
      {notificationModal.show && <NotificationModal />}
    </div>
  );

  return isMobile ? MobileChatBot : DesktopChatBot;
};

export default ChatBot;