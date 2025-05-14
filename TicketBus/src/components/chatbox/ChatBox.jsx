/* eslint-disable no-undef */
import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { FaPaperPlane, FaSmile } from "react-icons/fa";
import EmojiPicker from "emoji-picker-react";

const ADMIN_ID = import.meta.env.VITE_ADMIN_ID;

const socket = io(`${import.meta.env.VITE_API_URL}`, {
  withCredentials: true,
  autoConnect: false,
});
const getAvatarUrl = (avatar) => {
  if (!avatar) return defaultAvatar;
  return avatar.startsWith("http") ? avatar : `${import.meta.env.VITE_API_URL}${avatar}`;
};

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const chatContainerRef = useRef(null);
   let userId = null;
  const username = localStorage.getItem("username") || "Bạn";
  
  const token = localStorage.getItem("token");
if (token) {
    try {
      const decoded = jwtDecode(token);
      userId = decoded.userId; 
    } catch (error) {
      console.error("Token không hợp lệ:", error);
    }
  }

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!userId) return;

    socket.connect();
    socket.emit("join", userId);
    socket.emit("getMessages", { senderId: userId });

    socket.on("messages", (oldMsgs) => {
      setMessages(oldMsgs);
    });

    socket.on("receiveMessage", (msg) => {
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

  const sendMessage = () => {
    if (!newMessage.trim() || !userId) return;
    const payload = {
      senderId: userId,
      content: newMessage,
      receiverId: ADMIN_ID,
    };

    socket.emit("sendMessage", payload);

    const newMessageObj = {
      _id: Date.now().toString(),
      sender: { _id: userId, username, avatar: userAvatar },
      receiver: { _id: ADMIN_ID, username: "Admin" },
      content: newMessage,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessageObj]);
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
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="w-full max-w-xl bg-gray-50 rounded-xl shadow-lg">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-800">Chat với Admin</h1>
      </div>
      <div className="flex flex-col h-[400px] bg-white">
        {/* Messages */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
        >
          {messages.length === 0 && (
            <p className="text-center text-gray-500 text-sm">
              Chưa có tin nhắn nào.
            </p>
          )}
          {messages.map((m) => {
            const mine = m.sender._id === userId;
            return (
              <div
                key={m._id}
                className={`flex items-end ${mine ? "justify-end" : "justify-start"
                  } transition-opacity duration-200`}
              >
                {!mine && (
                  <img
                   src={getAvatarUrl(m.sender.avatar)}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full mr-2 object-cover"
                  />
                )}
                <div
                  className={`max-w-[70%] p-3 rounded-xl ${mine
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-800"
                    } shadow-sm`}
                >
                  <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                    {m.content}
                  </p>
                  <p className="text-xs text-right opacity-70 mt-1">
                    {formatDateTime(m.createdAt)}
                  </p>
                </div>
                {mine && (
                  <img
                   src={getAvatarUrl(userAvatar)}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full ml-2 object-cover"
                  />
                )}
              </div>
            );
          })}
        </div>


        {/* Input */}
        <div className="p-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowEmojiPicker((v) => !v)}
              className="p-1 text-gray-600 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full transition-colors"
              aria-label="Chọn emoji"
            >
              <FaSmile size={20} />
            </button>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập tin nhắn..."
              className="flex-1 p-2.5 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all"
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              aria-label="Gửi tin nhắn"
            >
              <FaPaperPlane size={18} />
            </button>
          </div>
          {showEmojiPicker && (
            <div className="absolute bottom-16 left-4 z-20">
              <EmojiPicker onEmojiClick={onEmojiClick} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatBox;