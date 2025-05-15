/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const TicketHistory = () => {
  const [tickets, setTickets] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const [showModal, setShowModal] = useState(false);
  const [ticketId, setTicketId] = useState("");
  const [modalError, setModalError] = useState("");
  const [notificationModal, setNotificationModal] = useState({
    show: false,
    message: "",
    type: "success", // "success" or "error"
  });

  // Handle resize for mobile/desktop toggle
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatVND = (value) => {
    return value.toLocaleString("vi-VN") + " VNĐ";
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const username = localStorage.getItem("username");
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/tickets/user/${username}`);
      setTickets(response.data);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  };

  const handleCancelTicket = async (e) => {
    e.preventDefault();
    if (!ticketId.trim()) {
      setModalError("Vui lòng nhập mã vé");
      return;
    }

    try {
      const { data } = await axios.put(`${import.meta.env.VITE_API_URL}/tickets/${ticketId}`, {
        status: "Cancelled",
      });
      if (data.success === false) {
        setNotificationModal({
          show: true,
          message: `Hủy vé không thành công! Lý do: ${data.message}`,
          type: "error",
        });
      } else {
        setNotificationModal({
          show: true,
          message: "Hủy vé thành công!",
          type: "success",
        });
        setShowModal(false);
        setTicketId("");
        setModalError("");
        fetchTickets();
      }
    } catch (error) {
      console.error("Lỗi khi hủy vé:", error);
      setNotificationModal({
        show: true,
        message: "Hủy vé thất bại. Vui lòng thử lại.",
        type: "error",
      });
    }
  };

  const openCancelModal = () => {
    setShowModal(true);
    setTicketId("");
    setModalError("");
  };

  const closeCancelModal = () => {
    setShowModal(false);
    setTicketId("");
    setModalError("");
  };

  const closeNotificationModal = () => {
    setNotificationModal({ show: false, message: "", type: "success" });
  };

  const renderStatusBadge = (status) => {
    const baseClasses = "px-2 sm:px-3 py-1 rounded-full text-xs font-semibold";
    switch (status) {
      case "PENDING":
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Đang chờ...</span>;
      case "IN_PROGRESS":
        return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>Xe đang đi</span>;
      case "COMPLETED":
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>Đã hoàn thành</span>;
      case "CANCELLED":
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>Đã hủy</span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{status}</span>;
    }
  };

  // Modal for entering ticket ID
  const CancelTicketModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={`bg-white dark:bg-primary rounded-lg shadow-xl p-4 sm:p-6 w-11/12 max-w-md ${
          isMobile ? "mx-4" : ""
        }`}
      >
        <h3 className="text-lg font-semibold text-gray-800 dark:text-neutral-50 mb-4">
          Hủy Vé
        </h3>
        <form onSubmit={handleCancelTicket}>
          <div className="mb-4">
            <label className="block text-sm text-gray-600 dark:text-neutral-300 mb-2">
              Nhập mã vé
            </label>
            <input
              type="text"
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-slate-300 text-sm dark:bg-gray-900 dark:text-neutral-50"
              placeholder="VD: TICKET-1746176326314-yvtsw2xeg"
            />
            {modalError && (
              <p className="text-red-500 text-xs mt-2">{modalError}</p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={closeCancelModal}
              className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-neutral-50 rounded-lg text-sm"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
            >
              Xác Nhận
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Modal for success/error notifications
  const NotificationModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={`bg-white dark:bg-primary rounded-lg shadow-xl p-4 sm:p-6 w-11/12 max-w-sm ${
          isMobile ? "mx-4" : ""
        }`}
      >
        <h3
          className={`text-lg font-semibold mb-4 ${
            notificationModal.type === "success"
              ? "text-green-600 dark:text-green-400"
              : "text-red-500 dark:text-red-400"
          }`}
        >
          {notificationModal.type === "success" ? "Thành Công" : "Lỗi"}
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

  // Desktop layout (original)
  const DesktopTicketHistory = (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-neutral-50">
            Lịch Sử Mua Vé
          </h1>
          <p className="text-gray-500 dark:text-neutral-300">
            Theo dõi và quản lý quá trình lịch sử mua vé của bạn
          </p>
        </div>
        <div className="space-x-4">
          <Link
            to="/bus-tickets"
            className="bg-primary hover:bg-primaryblue dark:hover:text-neutral-800 hover:text-neutral-950 text-white px-6 py-2 rounded-full shadow transition"
          >
            Đặt Vé
          </Link>
          <button
            onClick={openCancelModal}
            className="bg-red-600 hover:bg-primaryblue dark:hover:text-neutral-800 hover:text-neutral-950 text-white px-6 py-2 rounded-full shadow transition"
          >
            Hủy Vé
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border dark:bg-transparent">
          <thead>
            <tr className="bg-gray-100 text-center text-sm font-semibold text-gray-700 dark:bg-transparent dark:text-neutral-50">
              <th className="p-3 border">Mã Vé</th>
              <th className="p-3 border">Tuyến Đường</th>
              <th className="p-3 border">Ngày Đi</th>
              <th className="p-3 border">Số Tiền</th>
              <th className="p-3 border">Trạng Thái</th>
              <th className="p-3 border">Trạng Thái Chuyến Đi</th>
            </tr>
          </thead>
          <tbody>
            {tickets.length > 0 ? (
              tickets.map((ticket, idx) => (
                <tr
                  key={idx}
                  className="text-sm text-center border-t hover:bg-gray-50 dark:text-neutral-50"
                >
                  <td className="p-3 border">{ticket._doc.ticketId}</td>
                  <td className="p-3 border">
                    {ticket.departurePoint} → {ticket.destinationPoint}
                  </td>
                  <td className="p-3 border text-center">{formatDateTime(ticket.departureTime)}</td>
                  <td className="p-3 border">{formatVND(ticket._doc.ticketPrice)}</td>
                  <td className="p-3 border text-center">{ticket._doc.status}</td>
                  <td className="p-2 w-32">{renderStatusBadge(ticket.status)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-400">
                  <div className="flex justify-center mb-2">
                    <svg
                      className="w-10 h-10"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.75 9.75h4.5v4.5h-4.5v-4.5z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3v18h18V3H3z"
                      />
                    </svg>
                  </div>
                  Bạn chưa đặt vé nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {showModal && <CancelTicketModal />}
      {notificationModal.show && <NotificationModal />}
    </div>
  );

  // Mobile layout
  const MobileTicketHistory = (
    <div className="sm:hidden flex flex-col min-h-screen bg-white dark:bg-primary p-4">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-800 dark:text-neutral-50">
          Lịch Sử Mua Vé
        </h1>
        <p className="text-sm text-gray-500 dark:text-neutral-300">
          Theo dõi và quản lý lịch sử mua vé
        </p>
      </div>
      <div className="flex justify-between mb-4 gap-2">
        <Link
          to="/bus-tickets"
          className="flex-1 bg-primary hover:bg-primaryblue dark:hover:text-neutral-800 hover:text-neutral-950 text-white px-4 py-1.5 rounded-lg text-sm text-center transition"
        >
          Đặt Vé
        </Link>
        <button
          onClick={openCancelModal}
          className="flex-1 bg-red-600 hover:bg-primaryblue dark:hover:text-neutral-800 hover:text-neutral-950 text-white px-4 py-1.5 rounded-lg text-sm text-center transition"
        >
          Hủy Vé
        </button>
      </div>
      <div className="space-y-4">
        {tickets.length > 0 ? (
          tickets.map((ticket, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div className="text-sm font-semibold text-gray-800 dark:text-neutral-50">
                  Mã vé: {ticket._doc.ticketId}
                </div>
              </div>
              <div>{renderStatusBadge(ticket.status)}</div>
              <div className="mt-2 text-sm text-gray-600 dark:text-neutral-300">
                <p>
                  <span className="font-medium">Tuyến:</span> {ticket.departurePoint} →{" "}
                  {ticket.destinationPoint}
                </p>
                <p>
                  <span className="font-medium">Ngày Đi:</span>{" "}
                  {formatDateTime(ticket.departureTime)}
                </p>
                <p>
                  <span className="font-medium">Số Tiền:</span>{" "}
                  {formatVND(ticket._doc.ticketPrice)}
                </p>
                <p className="font-semibold text-emerald-950">
                  <span className="font-semibold">Trạng Thái:</span> {ticket._doc.status}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-gray-400 dark:text-neutral-400">
            <div className="flex justify-center mb-2">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.75 9.75h4.5v4.5h-4.5v-4.5z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3v18h18V3H3z"
                />
              </svg>
            </div>
            Bạn chưa đặt vé nào.
          </div>
        )}
      </div>
      {showModal && <CancelTicketModal />}
      {notificationModal.show && <NotificationModal />}
    </div>
  );

  return isMobile ? MobileTicketHistory : DesktopTicketHistory;
};

export default TicketHistory;