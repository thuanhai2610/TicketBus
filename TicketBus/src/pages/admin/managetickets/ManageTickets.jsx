import React, { useState, useEffect } from "react";
import axios from "axios";

const ManageTickets = () => {
  const [tickets, setTickets] = useState({
    completed: [],
    failed: [],
    pending: [],
  }); 
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(null); 

  useEffect(() => {
    fetchTickets();
  }, []);
  const formatVND = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };
  const fetchTickets = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get("http://localhost:3001/payments/all", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Adjust token source as needed
        },
      });

      // Categorize tickets by paymentStatus
      const categorizedTickets = {
        completed: response.data.filter((ticket) => ticket.paymentStatus === "completed"),
        failed: response.data.filter((ticket) => ticket.paymentStatus === "failed"),
        pending: response.data.filter((ticket) => ticket.paymentStatus === "pending"),
      };
      setTickets(categorizedTickets);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách vé:", err);
      setError(err.response?.data?.message || "Đã xảy ra lỗi khi lấy dữ liệu vé.");
    } finally {
      setLoading(false);
    }
  };

  
  const renderTickets = (ticketList, title) => (
    <div className="mb-8">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      {ticketList.length > 0 ? (
        <div className="grid gap-4">
          {ticketList.map((ticket) => (
            <div key={ticket._id} className="border p-4 rounded shadow">
              <p>
                <strong>Ticket ID:</strong> {ticket.ticketId}
              </p>
              <p>
                <strong>Số tiền:</strong> {ticket.amount ? formatVND(ticket.amount) : "N/A"} 
              </p>
              <p>
                <strong>Ngày giao dịch:</strong>{" "}
                {new Date(ticket.createdAt).toLocaleDateString("vi-VN")}
              </p>
              <p>
                <strong>Trạng thái:</strong> {ticket.paymentStatus}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">Không có vé nào trong danh mục này.</p>
      )}
    </div>
  );

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Quản lý đặt vé</h2>

      {/* Loading state */}
      {loading && <p className="text-blue-500">Đang tải dữ liệu...</p>}

      {/* Error state */}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Display tickets in three sections */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            {renderTickets(tickets.completed, "Đã thanh toán")}
          </div>
          <div>
            {renderTickets(tickets.failed, "Thanh toán thất bại")}
          </div>
          <div>
            {renderTickets(tickets.pending, "Đang thanh toán")}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTickets;