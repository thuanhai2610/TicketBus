import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { FaPaperPlane, FaSmile } from "react-icons/fa";
import EmojiPicker from "emoji-picker-react";

const ADMIN_ID = "67ebeea63d3cc6f79e3595da";

const socket = io(`${import.meta.env.VITE_API_URL}`, {
  withCredentials: true,
  autoConnect: false, 
});

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const chatContainerRef = useRef(null);
  const userId = localStorage.getItem("userId");
  const username = localStorage.getItem("username") || "Bạn";
  const userAvatar = localStorage.getItem("avatar") || "";
  const defaultAvatar = "https://i.pravatar.cc/40";

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Thiết lập socket chỉ 1 lần khi component mount
  useEffect(() => {
    if (!userId) return;

    socket.connect();              // Kết nối socket
    socket.emit("join", userId);   // Tham gia room userId

    // Yêu cầu load tin nhắn cũ
    socket.emit("getMessages", { senderId: userId });

    // Lắng nghe tin nhắn cũ
    socket.on("messages", (oldMsgs) => {
      setMessages(oldMsgs);
    });

    // Lắng nghe tin nhắn mới từ admin (chỉ khi tin nhắn thực sự từ admin)
    socket.on("receiveMessage", (msg) => {
      // Chỉ hiển thị tin nhắn đến nếu không phải là tin nhắn từ chính user
      if (msg.sender._id !== userId) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socket.off("messages");
      socket.off("receiveMessage");
      socket.disconnect();
    };
  }, [userId]);

  // Gửi tin nhắn qua WebSocket
  const sendMessage = () => {
    if (!newMessage.trim() || !userId) return;
    const payload = {
      senderId: userId,
      content: newMessage,
      receiverId: ADMIN_ID,  // Đảm bảo rằng người nhận là Admin
    };
    
    // Gửi tin nhắn lên server
    socket.emit("sendMessage", payload);

    // Thêm tin nhắn của người dùng vào UI ngay lập tức (không đợi server echo)
    const newMessageObj = {
      _id: Date.now().toString(),
      sender: { _id: userId, username, avatar: userAvatar },
      receiver: { _id: ADMIN_ID, username: "Admin" },
      content: newMessage,
      createdAt: new Date().toISOString(),
    };
    
    setMessages((prev) => [...prev, newMessageObj]);

    // Làm sạch input và ẩn emoji picker
    setNewMessage("");
    setShowEmojiPicker(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  const onEmojiClick = ({ emoji }) => {
    setNewMessage((prev) => prev + emoji);
  };

  const formatDateTime = (iso) =>
    new Date(iso).toLocaleString("vi-VN", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Chat với Admin</h1>
      <div className="chat-container bg-white rounded-lg shadow flex flex-col h-[500px]">
        {/* Messages */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          {messages.length === 0 && (
            <p className="text-center text-gray-400">Chưa có tin nhắn nào.</p>
          )}
          {messages.map((m) => {
            const mine = m.sender._id === userId;
            return (
              <div
                key={m._id}
                className={`flex items-end ${mine ? "justify-end" : "justify-start"}`}
              >
                {!mine && (
                  <img
                    src={m.sender.avatar ? `${import.meta.env.VITE_API_URL}${m.sender.avatar}` : defaultAvatar}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full mr-2"
                  />
                )}
                <div
                  className={`max-w-xs p-3 rounded-lg ${mine ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`}
                >
                  <p>{m.content}</p>
                  <p className="text-xs text-right opacity-70">
                    {formatDateTime(m.createdAt)}
                  </p>
                </div>
                {mine && (
                  <img
                    src={userAvatar ? `${import.meta.env.VITE_API_URL}${userAvatar}` : defaultAvatar}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full ml-2"
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t relative">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowEmojiPicker((v) => !v)}
              className="text-2xl"
            >
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
              disabled={!newMessage.trim()}
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

export default ChatBox;