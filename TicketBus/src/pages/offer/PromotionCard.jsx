import React, { useState, useEffect } from "react";
import { Copy } from "lucide-react";
import logoUrl from "../../assets/logo.png"

const PromotionCard = ({ promo }) => {
  const [notificationModal, setNotificationModal] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(promo.code);
      setNotificationModal({
        show: true,
        message: "Đã sao chép mã khuyến mãi!",
        type: "success",
      });
      setTimeout(() => {
        setNotificationModal({ show: false, message: "", type: "success" });
      }, 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      setNotificationModal({
        show: true,
        message: "Không thể sao chép mã!",
        type: "error",
      });
    }
  };

  const title =
    promo.discountType === "percentage"
      ? `Giảm ${promo.discountValue}%`
      : `Giảm ${promo.discountValue.toLocaleString()} VNĐ`;


  const expiresText = promo.expiresAt
    ? new Date(promo.expiresAt).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    : "Không giới hạn";

  const NotificationToast = () => (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 shadow-md px-4 py-2 rounded-full z-50 flex items-center space-x-2 border border-gray-200 dark:border-gray-600">
      <span
        className={`text-sm font-medium ${notificationModal.type === "success"
            ? "text-green-600 dark:text-green-400"
            : "text-red-500 dark:text-red-400"
          }`}
      >
        {notificationModal.message}
      </span>
    </div>
  );

  // 👉 Mobile layout
  const MobileCard = (
    <div className="flex items-start gap-3 bg-white dark:bg-neutral-800 px-4 py-3 rounded-xl shadow-sm mb-3">
      {/* Logo */}
      <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center mt-6">
        <img
          src={logoUrl}
          alt={promo.brand}
          className="w-10 h-10 object-contain justify-center "
        />
      </div>

      {/* Nội dung */}
      <div className="flex-1 text-sm">
        <div className="text-gray-900 dark:text-white font-medium">
          {promo.brand}
        </div>
        <div className="text-[15px] font-semibold text-primary dark:text-blue-400">
          {title}
        </div>
        <div className="text-gray-600 dark:text-gray-300">{promo.description}</div>
        <div className="text-xs text-gray-400 mt-1">HSD: {expiresText}</div>
        <div className="mt-2 flex items-center justify-between bg-gray-100 dark:bg-gray-700 rounded-md px-3 py-2">
        <span className="font-bold text-primary dark:text-white uppercase text-sm">
          Mã: {promo.code}
        </span>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCopy}
            className="text-primary dark:text-white hover:text-primaryblue transition"
            title="Sao chép mã"
          >
            <Copy size={18} />
          </button>
          <button
            onClick={() => {
            }}
            className="text-sm text-primary font-medium hover:underline whitespace-nowrap"
          >
          
          </button>
        </div>
      </div>
      </div>

      {/* Nút hành động */}
   
      { notificationModal.show && <NotificationToast /> }
    </div >
  );

// 🖥 Desktop layout
const DesktopCard = (
  <div className="flex flex-col justify-between h-[240px] bg-white dark:bg-gray-900 rounded-xl shadow-md hover:shadow-lg transition p-6">
    <div>
      <h2 className="text-2xl font-semibold text-primary dark:text-neutral-50 mb-2">
        {title}
      </h2>
      <p className="text-gray-700 dark:text-neutral-300 mb-2 text-base">
        {promo.description}
      </p>
      <p className="text-sm text-gray-500 dark:text-neutral-400">
        Hết hạn: {expiresText}
      </p>
    </div>
    <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2 mt-4">
      <span className="font-bold text-primary dark:text-neutral-50 uppercase">
        Mã: {promo.code}
      </span>
      <button
        onClick={handleCopy}
        className="text-primary dark:text-neutral-50 hover:text-primaryblue dark:hover:text-primaryblue transition"
        title="Sao chép mã"
      >
        <Copy size={18} />
      </button>
    </div>
    {notificationModal.show && <NotificationToast />}
  </div>
);

return isMobile ? MobileCard : DesktopCard;
};

export default PromotionCard;
