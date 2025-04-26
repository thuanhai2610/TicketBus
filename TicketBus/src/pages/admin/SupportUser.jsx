import React, { useEffect, useState, useRef } from "react";
import { FaPaperPlane, FaSmile } from "react-icons/fa";
import EmojiPicker from "emoji-picker-react";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_URL, {
  withCredentials: true,
});

const SupportUser = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const chatContainerRef = useRef(null);

  const userId = localStorage.getItem("userId") || "";
  const username = localStorage.getItem("username") || "Bạn";
  const userAvatar = localStorage.getItem("avatar") || "";
  const defaultAvatar = "https://i.pravatar.cc/40";

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "Invalid Date";
    return d.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    if (!userId) return;

    // Khi user vào => Join phòng userId
    socket.emit("join", userId);

    // Load lại toàn bộ tin nhắn cũ
    socket.emit("getMessages", { senderId: userId });

    socket.on("messages", (data) => {
      setMessages(data);
    });

    socket.on("receiveMessage", (message) => {
      // Thêm tin nhắn mới vào cuối
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off("messages");
      socket.off("receiveMessage");
    };
  }, [userId]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !userId) return;
    setIsSending(true);

    socket.emit("sendMessage", {
      senderId: userId,
      content: newMessage,
    });

    setNewMessage("");
    setIsSending(false);
    setShowEmojiPicker(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  const onEmojiClick = (emojiData) => {
    setNewMessage((prev) => prev + emojiData.emoji);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Hệ thống chăm sóc khách hàng</h1>
          <p>Gửi tin nhắn để chăm sóc khách hàng</p>
        </div>
      </div>

      <div className="chat-container bg-white rounded-lg shadow">
        <div ref={chatContainerRef} className="messages h-96 overflow-y-auto p-4 space-y-4">
          {messages.length ? (
            messages.map((m) => (
              <div
                key={m._id}
                className={`flex items-end ${m.sender._id === userId ? "justify-end" : "justify-start"}`}
              >
                {m.sender._id !== userId && (
                  <img
                    src={m.sender.avatar ? `${import.meta.env.VITE_API_URL}${m.sender.avatar}` : defaultAvatar}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full mr-2"
                  />
                )}
                <div
                  className={`max-w-xs p-3 rounded-lg ${
                    m.sender._id === userId ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
                  }`}
                >
                  <p>{m.content}</p>
                  <p className="text-xs text-right opacity-70">{formatDateTime(m.createdAt)}</p>
                </div>
                {m.sender._id === userId && (
                  <img
                    src={userAvatar ? `${import.meta.env.VITE_API_URL}${userAvatar}` : defaultAvatar}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full ml-2"
                  />
                )}
              </div>
            ))
          ) : (
            <div className="text-center text-gray-400 py-10">
              Chưa có tin nhắn nào.
            </div>
          )}
        </div>

        <div className="px-4 py-3 border-t relative">
          <div className="flex items-center space-x-2">
            <button onClick={() => setShowEmojiPicker((val) => !val)} className="text-2xl">
              <FaSmile />
            </button>

            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập tin nhắn..."
              className="flex-1 p-2 border rounded-full"
            />

            <button
              onClick={sendMessage}
              disabled={isSending || !newMessage.trim()}
              className="p-3 rounded-full bg-primary text-white disabled:opacity-50"
            >
              <FaPaperPlane />
            </button>
          </div>

          {showEmojiPicker && (
            <div className="absolute bottom-20 left-6 z-10">
              <EmojiPicker onEmojiClick={onEmojiClick} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportUser;
