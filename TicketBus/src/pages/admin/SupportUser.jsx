/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef } from "react";
import { FaPaperPlane, FaSmile } from "react-icons/fa";
import EmojiPicker from "emoji-picker-react";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_URL, {
  withCredentials: true,
  autoConnect: false,
});

const ADMIN_ID = "67ebeea63d3cc6f79e3595da"; // id admin cố định

const SupportUser = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");
  const [users, setUsers] = useState([]);
  const chatContainerRef = useRef(null);
  const adminAvatar = localStorage.getItem("avatarAdmin");
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

  // Connect socket and set up listeners when component mounts
  useEffect(() => {
    socket.connect();
    socket.emit("join", ADMIN_ID); // Admin joins their room

    // Fetch user list initially and set up interval to refresh
    fetchUserList();
    const intervalId = setInterval(fetchUserList, 30000); // Refresh every 30 seconds

    // Listen for new messages
    socket.on("receiveMessage", (message) => {
      // Check if message is part of current conversation
      if (
        currentUserId &&
        (message.sender._id === currentUserId ||
          message.receiver._id === currentUserId)
      ) {
        setMessages((prev) => [...prev, message]);

        // Update users list if there's a new message from someone not in current view
        if (
          message.sender._id !== ADMIN_ID &&
          message.sender._id !== currentUserId
        ) {
          fetchUserList();
        }
      } else {
        // If not viewing the sender's conversation, refresh user list
        fetchUserList();
      }
    });

    // Listen for errors
    socket.on("error", (error) => {
      console.error("Socket error:", error);
      // You could add toast notification here
    });

    return () => {
      clearInterval(intervalId);
      socket.off("userList");
      socket.off("messages");
      socket.off("receiveMessage");
      socket.off("error");
      socket.disconnect();
    };
  }, [currentUserId]);

  // Fetch user list function
  const fetchUserList = () => {
    socket.emit("getUserList");
    socket.once("userList", (userList) => {
      setUsers(userList);
    });
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Select a user and load their messages
  const loadMessages = (userId) => {
    setCurrentUserId(userId);
    socket.emit("getMessages", { senderId: userId });

    socket.once("messages", (data) => {
      setMessages(data);
    });
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !currentUserId) return;
    setIsSending(true);

    const messageData = {
      senderId: ADMIN_ID,
      receiverId: currentUserId,
      content: newMessage,
    };
    const tempMessage = {
      _id: Date.now().toString(),
      sender: { _id: ADMIN_ID, username: "Admin" },
      receiver: { _id: currentUserId },
      content: newMessage,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMessage]);

    // Send to server
    socket.emit("sendMessage", messageData);

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
    <div className="min-h-screen px-4">
      <h2 className="font-bold text-3xl mb-6 text-center uppercase">Chăm sóc khách hàng</h2>
    <div className="flex p-6 h-[80vh] gap-4">
      {/* Sidebar danh sách users */}
      <div className="w-1/4 bg-slate-700 rounded-lg shadow p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Tin Nhắn</h2>
        {users.length ? (
          users.map((user) => (
            <div
              key={user._id}
              className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-slate-600 ${
                currentUserId === user._id ? "bg-slate-500" : ""
              }`}
              onClick={() => loadMessages(user._id)}
            >
              <img
                src={
                  user.avatar
                    ? `${import.meta.env.VITE_API_URL}${user.avatar}`
                    : defaultAvatar
                }
                alt="avatar"
                className="w-8 h-8 rounded-full"
              />
              <span>{user.username || "Khách hàng"}</span>
            </div>
          ))
        ) : (
          <p className="text-gray-400">Chưa có khách hàng</p>
        )}
      </div>

      {/* Chat container */}
      <div className="flex-1 bg-slate-700 rounded-lg shadow flex flex-col">
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 mt-4"
        >
          {currentUserId ? (
            messages.length ? (
              messages.map((m) => {
                const mine = m.sender?._id === ADMIN_ID;
                return (
                  <div
                    key={m._id}
                    className={`flex items-end ${
                      mine ? "justify-end" : "justify-start"
                    }`}
                  >
                    {!mine && (
                      <img
                        src={
                          m.sender?.avatar
                            ? `${import.meta.env.VITE_API_URL}${
                                m.sender.avatar
                              }`
                            : defaultAvatar
                        }
                        alt="Avatar"
                        className="w-8 h-8 rounded-full mr-2"
                      />
                    )}
                    <div
                      className={`max-w-xs p-3 rounded-lg ${
                        mine
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-black"
                      }`}
                    >
                      <p>{m.content}</p>
                      <p className="text-xs text-right opacity-70">
                        {formatDateTime(m.createdAt)}
                      </p>
                    </div>
                    {mine && (
                      <img
                        src={
                          m.sender?.avatar
                            ? `${import.meta.env.VITE_API_URL}${
                                m.sender.avatar
                              }`
                            : defaultAvatar
                        }
                        alt="Admin"
                        className="w-8 h-8 rounded-full ml-2"
                      />
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-center text-gray-400">
                Chưa có tin nhắn với khách hàng này
              </p>
            )
          ) : (
            <p className="text-center text-gray-400">
              Chọn khách hàng để xem tin nhắn
            </p>
          )}
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t relative">
          {currentUserId ? (
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
                className="flex-1 p-2 border rounded-full text-neutral-950"
              />
              <button
                onClick={sendMessage}
                disabled={isSending || !newMessage.trim()}
                className="p-3 rounded-full bg-primary text-white disabled:opacity-50"
              >
                <FaPaperPlane />
              </button>
            </div>
          ) : (
            <p className="text-center text-gray-400">
              Chọn khách hàng để bắt đầu trò chuyện
            </p>
          )}
          {showEmojiPicker && (
            <div className="absolute bottom-20 left-6 z-10">
              <EmojiPicker onEmojiClick={onEmojiClick} />
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
};

export default SupportUser;
