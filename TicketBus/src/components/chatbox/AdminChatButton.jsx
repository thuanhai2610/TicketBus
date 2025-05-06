import React, { useState } from "react";
import { FaComments } from "react-icons/fa";
import ChatBox from "./ChatBox";
import { MdOutlineSupportAgent } from "react-icons/md";
import logoChatBox from "../../assets/logoChatBox.png"

const AdminChatButton = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => {
    setIsChatOpen((prev) => !prev);
  };

  return (
    <div>
      {/* Support Logo Button */}
      <img
        src={logoChatBox} // Replace with the correct image path
        alt="Support Agent"
        className={`fixed bottom-6 right-6 z-50 w-24 h-24 cursor-pointer transition-transform duration-200 ${isChatOpen ? "scale-0" : "scale-100 animate-subtleBounce"
          }`} // Transition and animation for the image
        onClick={toggleChat} // Add click functionality to toggle chat
        aria-label="Mở hỗ trợ trò chuyện"
        title="Hỗ trợ trò chuyện"
      />



      {/* ChatBox */}
      <div
        className={`fixed bottom-6 right-6 w-80 max-w-[90%] z-50 transition-all duration-300 ease-in-out ${isChatOpen
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-10 pointer-events-none"
          }`}
      >
        <div className="relative bg-white rounded-lg shadow-2xl border border-gray-100">
          <button
            onClick={toggleChat}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1 transition-colors"
            aria-label="Đóng trò chuyện"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          {localStorage.getItem("token") && <ChatBox />}

        </div>
      </div>
    </div>
  );
};

export default AdminChatButton;
