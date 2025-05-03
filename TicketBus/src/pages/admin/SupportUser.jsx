/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef } from "react";
import { FaPaperPlane, FaSmile } from "react-icons/fa";
import EmojiPicker from "emoji-picker-react";
import { io } from "socket.io-client";
import CSKH from "../../assets/CSKH.png";

const socket = io(import.meta.env.VITE_API_URL, {
  withCredentials: true,
  autoConnect: false,
});

const ADMIN_ID = import.meta.env.VITE_ADMIN_ID; // id admin cố định

const defaultAvatar = "https://i.pravatar.cc/40";

const getAvatarUrl = (avatar) => {
  if (!avatar) return defaultAvatar;
  return avatar.startsWith("https://res.cloudinary.com")
    ? avatar
    : `${import.meta.env.VITE_API_URL}${avatar}`;
};

const SupportUser = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");
  const [users, setUsers] = useState([]);
  const chatContainerRef = useRef(null);
  const adminAvatar = localStorage.getItem("avatarAdmin");

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
    socket.connect();
    socket.emit("join", ADMIN_ID);
    fetchUserList();
    const intervalId = setInterval(fetchUserList, 30000);

    socket.on("receiveMessage", (message) => {
      if (
        currentUserId &&
        (message.sender._id === currentUserId ||
          message.receiver._id === currentUserId)
      ) {
        setMessages((prev) => [...prev, message]);
        if (
          message.sender._id !== ADMIN_ID &&
          message.sender._id !== currentUserId
        ) {
          fetchUserList();
        }
      } else {
        fetchUserList();
      }
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error);
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

  const fetchUserList = () => {
    socket.emit("getUserList");
    socket.once("userList", (userList) => {
      setUsers(userList);
    });
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

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
      sender: {
        _id: ADMIN_ID,
        username: "Admin",
        avatar: adminAvatar || null,
      },
      receiver: { _id: currentUserId },
      content: newMessage,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMessage]);

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
    <div className="mt-12 flex items-center justify-center ">
      <div className="flex w-full max-w-6xl h-[80vh] rounded-2xl shadow-lg shadow-teal-800 overflow-hidden">
        {/* Sidebar danh sách users */}
        <div className="w-1/4 bg-teal-800 text-white p-4 flex flex-col border-b border-gray-300">
          <div className="border-b border-gray-300 flex items-center">
            <h2 className="text-lg font-semibold mb-4 mt-3 uppercase tracking-wide">
              Tin Nhắn
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto mt-2">
            {users.length ? (
              users.map((user) => (
                <div
                  key={user._id}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-teal-700 transition-colors ${
                    currentUserId === user._id
                      ? "bg-teal-600"
                      : "text-neutral-50"
                  }`}
                  onClick={() => loadMessages(user._id)}
                >
                  <img
                    src={getAvatarUrl(user.avatar)}
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover border border-neutral-300"
                  />
                  <div>
                    <span className="text-white font-medium">
                      {user.username || "Khách hàng"}
                    </span>
                    <p className="text-xs text-gray-500">
                      {user.lastMessage || ""}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center">Chưa có khách hàng</p>
            )}
          </div>
        </div>

        {/* Chat container */}
        <div className="flex-1 bg-white border-teal-800 border flex flex-col">
          {/* Chat header */}
          {currentUserId ? (
            <div className="p-4 border-b border-[#2A3435] flex items-center gap-3">
              <img
                src={getAvatarUrl(
                  users.find((u) => u._id === currentUserId)?.avatar
                )}
                alt="User"
                className="w-10 h-10 rounded-full"
              />
              <span className="text-neutral-950 font-medium">
                {users.find((u) => u._id === currentUserId)?.username ||
                  "Khách hàng"}
              </span>
            </div>
          ) : null}

          {/* Chat messages */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-6 space-y-6 mt-2"
          >
            {currentUserId ? (
              messages.length ? (
                messages.map((m, index) => {
                  const mine = m.sender?._id === ADMIN_ID;
                  const showDate =
                    index === 0 ||
                    new Date(messages[index - 1].createdAt).toDateString() !==
                      new Date(m.createdAt).toDateString();

                  return (
                    <div key={m._id}>
                      {showDate && (
                        <div className="text-center text-gray-600 text-sm my-4">
                          {new Date(m.createdAt).toLocaleDateString("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </div>
                      )}
                      <div
                        className={`flex items-end ${
                          mine ? "justify-end" : "justify-start"
                        }`}
                      >
                        {!mine && (
                          <img
                            src={getAvatarUrl(m.sender?.avatar)}
                            alt="Avatar"
                            className="w-8 h-8 rounded-full mr-2 object-cover"
                          />
                        )}
                        <div
                          className={`max-w-lg p-3 rounded-2xl ${
                            mine
                              ? "bg-teal-700 text-neutral-50"
                              : "bg-neutral-200 text-neutral-950 shadow-sm"
                          }`}
                        >
                          <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                            {m.content}
                          </p>
                          <p
                            className={`text-xs opacity-70 mt-1 ${
                              mine ? "text-right" : "text-left"
                            }`}
                          >
                            {new Date(m.createdAt).toLocaleTimeString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        {mine && (
                          <img
                            src={getAvatarUrl(m.sender?.avatar)}
                            alt="Admin"
                            className="w-8 h-8 rounded-full ml-2 object-cover"
                          />
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-gray-400 mt-20">
                  Chưa có tin nhắn với khách hàng này
                </p>
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <img
                  src={CSKH}
                  alt="Chọn khách hàng"
                  className="w-96 h-80 mb-6 opacity-80"
                />
                <p className="text-center text-gray-700 text-xl">
                  Chọn khách hàng để xem tin nhắn
                </p>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-teal-800 relative">
            {currentUserId ? (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowEmojiPicker((v) => !v)}
                  className="text-xl text-teal-800 hover:text-teal-950 transition-colors"
                >
                  <FaSmile />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Aa"
                  className="flex-1 p-3 bg-neutral-200 text-neutral-950 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                />
                <button
                  onClick={sendMessage}
                  disabled={isSending || !newMessage.trim()}
                  className="p-3 rounded-full bg-teal-800 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
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
