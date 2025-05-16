import React, { useState, useEffect } from "react";
import PromotionCard from "./PromotionCard";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const Offer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notificationModal, setNotificationModal] = useState({
    show: false,
    message: "",
    type: "error",
  });
  const [page, setPage] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const limit = 6;

  // Handle resize for mobile/desktop toggle
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Lấy page từ URL ?page=...
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setPage(parseInt(params.get("page") || "1", 10));
  }, [location.search]);

  // Fetch coupons từ backend
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/coupons`);
        setPromotions(res.data);
      } catch (err) {
        console.error(err);
        setNotificationModal({
          show: true,
          message: "Không lấy được danh sách khuyến mãi.",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchCoupons();
  }, []);

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
        <h3 className="text-lg font-semibold mb-4 text-red-500 dark:text-red-400">
          Lỗi
        </h3>
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

  if (loading) {
    return (
      <div className="text-center py-20 text-primary dark:text-neutral-50 text-lg">
        Đang tải ưu đãi...
      </div>
    );
  }

  // Tính phân trang
  const start = (page - 1) * limit;
  const pageItems = Array.isArray(promotions) ? promotions.slice(start, start + limit) : [];

  const totalPages = Math.ceil(promotions.length / limit);

  const goToPage = (p) => {
    navigate(`?page=${p}`);
  };

  // Desktop layout
  const DesktopOffer = (
    <div className="pt-40 pb-12 px-4 md:px-10  min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-primary dark:text-neutral-50 mb-4">
            🎉 Ưu Đãi Đặc Biệt 🎉
          </h1>
          <p className="text-lg text-gray-600 dark:text-neutral-200">
            Nhanh tay đặt vé để nhận những khuyến mãi cực hấp dẫn!
          </p>
        </div>
        <div className=" p-6">
          {pageItems.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-neutral-400 py-10">
              Không có khuyến mãi nào hiện tại.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pageItems.map((promo) => (
                <PromotionCard key={promo._id} promo={promo} />
              ))}
            </div>
          )}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8 flex-wrap">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    p === page
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-primary dark:bg-gray-700 dark:text-neutral-50 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {notificationModal.show && <NotificationModal />}
    </div>
  );

  // Mobile layout
  const MobileOffer = (
    <div className="sm:hidden pt-24 pb-8 px-4 min-h-screen">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-neutral-50 mb-3">
          🎉 Ưu Đãi Đặc Biệt 🎉
        </h1>
        <p className="text-sm text-gray-600 dark:text-neutral-200">
          Nhanh tay đặt vé để nhận khuyến mãi!
        </p>
      </div>
      {pageItems.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-neutral-400 py-8 text-sm">
          Không có khuyến mãi nào hiện tại.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {pageItems.map((promo) => (
            <PromotionCard key={promo._id} promo={promo} />
          ))}
        </div>
      )}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6 flex-wrap">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => goToPage(p)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                p === page
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-primary dark:bg-gray-700 dark:text-neutral-50 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
      {notificationModal.show && <NotificationModal />}
    </div>
  );

  return isMobile ? MobileOffer : DesktopOffer;
};

export default Offer;