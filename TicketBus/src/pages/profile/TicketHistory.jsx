import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const TicketHistory = () => {
    const [tickets, setTickets] = useState([]);
    

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const response = await axios.get("http://localhost:3001/tickets");
            setTickets(response.data);
        } catch (error) {
            console.error("Error fetching tickets:", error);
        }
    };


    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-neutral-50">Lịch sử mua vé</h1>
                    <p className="text-gray-500 dark:text-neutral-300">Theo dõi và quản lý quá trình lịch sử mua vé của bạn</p>
                </div>
                <Link
                    to="/bus-tickets"
                    className="bg-primary hover:bg-primaryblue dark:hover:text-neutral-800 hover:text-neutral-950 text-white px-6 py-2 rounded-full shadow transition"
                >
                    Đặt vé
                </Link>
            </div>

         

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border dark:bg-transparent">
                    <thead>
                        <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700 dark:bg-transparent dark:text-neutral-50">
                            <th className="p-3 border">Mã vé</th>
                            <th className="p-3 border">Tuyến đường</th>
                            <th className="p-3 border">Ngày đi</th>
                            <th className="p-3 border">Số tiền</th>
                            <th className="p-3 border">Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tickets.length > 0 ? (
                            tickets.map((ticket, idx) => (
                                <tr key={idx} className="text-sm border-t hover:bg-gray-50 dark:text-neutral-50">
                                    <td className="p-3 border">{ticket.code}</td>
                                    <td className="p-3 border">{ticket.route}</td>
                                    <td className="p-3 border">{ticket.date}</td>
                                    <td className="p-3 border">{ticket.amount} đ</td>
                                    <td className="p-3 border">{ticket.status}</td>
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
                                    No Data
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