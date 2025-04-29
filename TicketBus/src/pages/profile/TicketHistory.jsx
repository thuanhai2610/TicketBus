/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const TicketHistory = () => {
    const [tickets, setTickets] = useState([]);
    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid Date';
        
        return date.toLocaleString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      };
      const formatVND = (value) => {
        return new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(value);
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
    const cancelTicket = async () => {
        const ticketId = prompt("Nhập mã vé bạn muốn hủy:");
        if (!ticketId) return;
    
        // tìm vé trong danh sách tickets đã fetch
        const ticket = tickets.find(t => t._doc.ticketId === ticketId);
    
        if (!ticket) {
            alert("Không tìm thấy vé với mã đã nhập.");
            return;
        }
        switch (ticket.status) {
            case "PENDING":
                try {
                    await axios.put(`${import.meta.env.VITE_API_URL}/tickets/${ticketId}`, {
                        status: "Cancelled"
                    });
                    alert("Hủy vé thành công!");
                    fetchTickets();
                } catch (error) {
                    console.error("Lỗi khi hủy vé:", error);
                    alert("Hủy vé thất bại. Vui lòng thử lại.");
                }
                break;
            case "IN_PROGRESS":
                alert("Xe đang tiến hành. Bạn không thể hủy vé.");
                break;
            case "COMPLETED":
                alert("Tuyến xe đã đến nơi. Bạn không thể hủy vé.");
                break;
            case "CANCELLED":
                alert("Vé này đã bị hủy từ trước.");
                break;
            default:
                alert("Trạng thái không xác định.");
        }
    };
    
    const renderStatusBadge = (status) => {
        const baseClasses = "px-3 py-1 rounded-full text-xs font-semibold";
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
      
    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-neutral-50">Lịch sử mua vé</h1>
                    <p className="text-gray-500 dark:text-neutral-300">Theo dõi và quản lý quá trình lịch sử mua vé của bạn</p>
                </div>
                <div className="space-x-4">
                <Link
                    to="/bus-tickets"
                    className="bg-primary hover:bg-primaryblue dark:hover:text-neutral-800 hover:text-neutral-950 text-white px-6 py-2 rounded-full shadow transition"
                >
                    Đặt vé
                </Link>
                <button 
                onClick={cancelTicket}
                    className="bg-red-600  hover:bg-primaryblue dark:hover:text-neutral-800 hover:text-neutral-950 text-white px-6 py-2 rounded-full shadow transition"
                    >
                  Hủy vé
                </button>
                </div>
            </div>

         

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border dark:bg-transparent">
                    <thead>
                        <tr className="bg-gray-100 text-center text-sm font-semibold text-gray-700 dark:bg-transparent dark:text-neutral-50">
                            <th className="p-3 border">Mã vé</th>
                            <th className="p-3 border">Tuyến đường</th>
                            <th className="p-3 border">Ngày đi</th>
                            <th className="p-3 border">Số tiền</th>
                            <th className="p-3 border">Trạng thái</th>
                            <th className="p-3 border">Trạng thái chuyến đi</th>

                        </tr>
                    </thead>
                    <tbody>
                        {tickets.length > 0 ? (
                            tickets.map((ticket, idx) => (
                                <tr key={idx} className="text-sm text-center border-t hover:bg-gray-50 dark:text-neutral-50">
                                    <td className="p-3 border">{ticket._doc.ticketId}</td>
                                    <td className="p-3 border">{ticket.departurePoint} → {ticket.destinationPoint}</td>
                                    <td className="p-3 border text-center">{formatDateTime(ticket.departureTime)}</td>
                                    <td className="p-3 border" >{formatVND(ticket._doc.ticketPrice)}</td>
                                    <td className="p-3 border text-center">{ticket._doc.status}</td>
                                    <td className="p-2 w-32">{renderStatusBadge(ticket.status)}</td>


                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center py-6 text-gray-400">
                                    <div className="flex justify-center mb-2">
                                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 9.75h4.5v4.5h-4.5v-4.5z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3v18h18V3H3z" />
                                        </svg>
                                    </div>
                                    Bạn chưa đặt vé nào.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TicketHistory;