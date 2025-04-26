import React, { useEffect, useState, useRef } from "react";
import { FaPaperPlane, FaSmile } from "react-icons/fa"; // icon gửi & mặt cười
import EmojiPicker from "emoji-picker-react"; // thư viện emoji
import axios from "axios";

const Chatbox = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const chatContainerRef = useRef(null);
  const userId = localStorage.getItem("userId") || "";

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
    const fetchMessages = async () => {
      if (!userId) return;
      try {
        const response = await axios.get(`http://localhost:3001/messages?senderId=${userId}&receiverId=67ebeea63d3cc6f79e3595da`);
        setMessages(response.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [userId]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !userId) return;
    setIsSending(true);

    const newMessageData = {
      senderId: userId,
      receiverId: "67ebeea63d3cc6f79e3595da",
      content: newMessage,
    };

    try {
      const response = await fetch("http://localhost:3001/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMessageData),
      });

      const responseData = await response.json();

      if (response.ok) {
        const formattedMessage = {
          _id: responseData._id,
          sender: {
            _id: responseData.sender._id || responseData.sender,
            username: responseData.sender.username || (responseData.sender === userId ? localStorage.getItem("username") || "Bạn" : "Admin"),
          },
          receiver: {
            _id: responseData.receiver._id || responseData.receiver,
            username: responseData.receiver.username || "Admin",
          },
          content: responseData.content,
          createdAt: responseData.createdAt,
        };
        setMessages((prev) => [...prev, formattedMessage]);
      } else {
        alert(`Gửi tin nhắn thất bại: ${responseData.message || "Lỗi không xác định"}`);
      }
    } finally {
      setIsSending(false);
      setNewMessage("");
      setShowEmojiPicker(false); // ẩn emoji khi gửi
    }
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
          <h1 className="text-2xl font-bold">Chat với Admin</h1>
          <p>Gửi tin nhắn để được hỗ trợ từ quản trị viên</p>
        </div>
      </div>

      <div className="chat-container bg-white rounded-lg shadow">
        <div
          ref={chatContainerRef}
          className="messages h-96 overflow-y-auto p-4 space-y-4"
        >
          {messages.length ? (
            messages.map((m) => (
              <div
                key={m._id}
                className={`flex ${m.sender._id === userId ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-xs p-3 rounded-lg ${m.sender._id === userId ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`}>
                  <p className="text-sm font-semibold">{m.sender.username}</p>
                  <p>{m.content}</p>
                  <p className="text-xs text-right opacity-70">{formatDateTime(m.createdAt)}</p>
                </div>
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
            <button
              onClick={() => setShowEmojiPicker((val) => !val)}
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

export default Chatbox;
