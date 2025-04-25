import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaBus, FaTicketAlt, FaUsers, FaMoneyBillWave } from "react-icons/fa";
import PieChart from './PieChart';
import { LuTicketX, LuTicketSlash } from "react-icons/lu";


import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import RevenueChart from "../RevenueChart";

const ManageTickets = () => {
  const [tickets, setTickets] = useState({
    completed: [],
    failed: [],
    pending: [],
  });
  const [revenue, setRevenue] = useState({
    totalTickets: 0,
    completedTickets: 0,
    pendingTickets: 0,
    failedTickets: 0,
    total: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("completed");

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
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/payments/all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const categorizedTickets = {
        completed: response.data.filter((ticket) => ticket.paymentStatus === "completed"),
        failed: response.data.filter((ticket) => ticket.paymentStatus === "failed"),
        pending: response.data.filter((ticket) => ticket.paymentStatus === "pending"),
      };

      setRevenue({
        totalTickets: response.data.length,
        completedTickets: categorizedTickets.completed.length,
        pendingTickets: categorizedTickets.pending.length,
        failedTickets: categorizedTickets.failed.length,
        total: categorizedTickets.completed.reduce((sum, ticket) => sum + ticket.amount, 0),
      });


      setTickets(categorizedTickets);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách vé:", err);
      setError(err.response?.data?.message || "Đã xảy ra lỗi khi lấy dữ liệu vé.");
    } finally {
      setLoading(false);
    }
  };

  const renderTickets = (ticketList) => (
    <div className="overflow-x-auto">
      {ticketList.length > 0 ? (
        <table className="w-full text-white">
          <thead>
            <tr className="border-b border-gray-600">
              <th className="py-2 px-4 text-left">TICKETID</th>
              <th className="py-2 px-4 text-left">Giá Vé</th>
              <th className="py-2 px-4 text-left">Ngày Giao Dịch</th>
              <th className="py-2 px-4 text-left">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {[...ticketList]
              .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)) 
              .map((ticket) => (
                <tr key={ticket._id} className="border-b border-gray-600 max-h-screen overflow-y-auto">
                  <td className="py-2 px-4 text-blue-400">{ticket.ticketId}</td>
                  <td className="py-2 px-4">{ticket.amount ? formatVND(ticket.amount) : "N/A"}</td>
                  <td className="py-2 px-4">{new Date(ticket.createdAt).toLocaleDateString("vi-VN")}</td>
                  <td className={`py-2 px-4 ${getStatusColor(ticket.paymentStatus)}`}>
                    {ticket.paymentStatus.toUpperCase()}
                  </td>
                </tr>
              ))}

          </tbody>
        </table>
      ) : (
        <p className="text-gray-500">Không có vé nào trong danh mục này.</p>
      )}
    </div>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-yellow-500";
      case "completed":
        return "text-green-500";
      case "failed":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };


  return (
    <div className="p-4 bg-gray-900 max-h-screen overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-white uppercase">Quản Lý vé đã bán</h2>
      </div>

      {/* Loading state */}
      {loading && <p className="text-blue-500">Đang tải dữ liệu...</p>}

      {/* Error state */}
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Link to="">
          <Card className="bg-gray-800 border-gray-700 hover:bg-gray-700 transition">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <FaTicketAlt className="text-red-500 text-2xl mr-3" />
              <CardTitle className="text-sm font-medium text-gray-400">
                Vé Đã Thanh Toán
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{revenue.completedTickets}</div>
            </CardContent>
          </Card>
        </Link>

        <Link to="">
          <Card className="bg-gray-800 border-gray-700 hover:bg-gray-700 transition">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <LuTicketSlash className="text-blue-500 text-2xl mr-3" />
              <CardTitle className="text-sm font-medium text-gray-400">
                Vé Đang Chờ Xử Lý
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{revenue.pendingTickets}</div>
            </CardContent>
          </Card>
        </Link>
        <Link to="">
          <Card className="bg-gray-800 border-gray-700 hover:bg-gray-700 transition">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <LuTicketX className="text-purple-500 text-2xl mr-3" />
              <CardTitle className="text-sm font-medium text-gray-400">
                Vé Thanh Toán Thất Bại
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{revenue.failedTickets}</div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/admin/revenue">
          <Card className="bg-gray-800 border-gray-700 hover:bg-gray-700 transition">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <FaMoneyBillWave className="text-green-500 text-2xl mr-3" />
              <CardTitle className="text-sm font-medium text-gray-400">
                Doanh Thu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{revenue.total.toLocaleString("vi-VN")}đ</div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Pie Chart Left */}
        <div className="col-span-1">
          <PieChart tickets={tickets} />
        </div>

        {/* Line Chart Right */}
        <div className="col-span-2">
          <RevenueChart revenue={revenue} />
        </div>
        
      </div>
      {/* Buttons to switch between ticket statuses */}
      <div className="mb-4 flex space-x-2 overflow-y-auto">
        <button
          onClick={() => setSelectedStatus("completed")}
          className={`px-4 py-2 rounded ${selectedStatus === "completed" ? "bg-primaryblue text-neutral-900" : "bg-gray-700 text-white"
            } hover:bg-slate-500`}
        >
          Đã thanh toán
        </button>
        <button
          onClick={() => setSelectedStatus("pending")}
          className={`px-4 py-2 rounded ${selectedStatus === "pending" ? "bg-primaryblue text-neutral-900" : "bg-gray-700 text-white"
            } hover:bg-slate-500`}
        >
          Đang thanh toán
        </button>

        <button
          onClick={() => setSelectedStatus("failed")}
          className={`px-4 py-2 rounded ${selectedStatus === "failed" ? "bg-primaryblue text-neutral-900" : "bg-gray-700 text-white"
            } hover:bg-slate-500`}
        >
          Thanh toán thất bại
        </button>
      </div>

      {/* Display tickets based on the selected status */}
      {!loading && renderTickets(tickets[selectedStatus])}
    </div>
  );
};

export default ManageTickets;