import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { FaPaperPlane, FaSmile } from "react-icons/fa";
import EmojiPicker from "emoji-picker-react";

const ADMIN_ID = import.meta.env.VITE_ADMIN_ID;

const socket = io(`${import.meta.env.VITE_API_URL}`, {
  withCredentials: true,
  autoConnect: false,
});

const Support = () => {
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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4 ">
      <div className="w-full shadow-gray-500 max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex flex-col h-[80vh] md:h-[600px]">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 ">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white text-center">
            Chat với Admin
          </h1>
        </div>

        {/* Messages */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900"
        >
          {messages.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 mt-10">
              Chưa có tin nhắn nào.
            </p>
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
                    src={
                      m.sender.avatar
                        ? `${import.meta.env.VITE_API_URL}${m.sender.avatar}`
                        : defaultAvatar
                    }
                    alt="Avatar"
                    className="w-8 h-8 rounded-full mr-2"
                  />
                )}
                <div
                  className={`max-w-xs p-3 rounded-2xl ${
                    mine
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white"
                  }`}
                >
                  <p>{m.content}</p>
                  <p className="text-xs opacity-70 text-right mt-1">
                    {formatDateTime(m.createdAt)}
                  </p>
                </div>
                {mine && (
                  <img
                    src={
                      userAvatar
                        ? `${import.meta.env.VITE_API_URL}${userAvatar}`
                        : defaultAvatar
                    }
                    alt="Avatar"
                    className="w-8 h-8 rounded-full ml-2"
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 relative">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowEmojiPicker((v) => !v)}
              className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
            >
              <FaSmile size={24} />
            </button>

            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập tin nhắn..."
              className="flex-1 p-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-full outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FaPaperPlane size={20} />
            </button>
          </div>

          {showEmojiPicker && (
            <div className="absolute bottom-16 left-4 z-10">
              <EmojiPicker onEmojiClick={onEmojiClick} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Support;