import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaBus, FaTicketAlt, FaUsers, FaMoneyBillWave } from "react-icons/fa";
import { LuTicketX, LuTicketSlash } from "react-icons/lu";
import { FaArrowUpLong, FaArrowDown } from "react-icons/fa6";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import MiniChart from "../../../components/minichart/MiniChart";
import PieChart from './PieChartRecharts';
import TicketLineChart from './TicketLineChart';
import RevenueChart from "../revenuechart/RevenueChart";

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
    completedPercentageChange: 0,
    pendingPercentageChange: 0,
    failedPercentageChange: 0,
    revenuePercentageChange: 0,
    completedSalesProgress: 0,
    pendingSalesProgress: 0,
    failedSalesProgress: 0,
    revenueSalesProgress: 0,
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

      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

      // Categorize tickets by status and time period
      const currentWeek = {
        completed: response.data.filter(
          (ticket) =>
            ticket.paymentStatus === "completed" &&
            new Date(ticket.createdAt) >= oneWeekAgo
        ),
        pending: response.data.filter(
          (ticket) =>
            ticket.paymentStatus === "pending" &&
            new Date(ticket.createdAt) >= oneWeekAgo
        ),
        failed: response.data.filter(
          (ticket) =>
            ticket.paymentStatus === "failed" &&
            new Date(ticket.createdAt) >= oneWeekAgo
        ),
      };

      const previousWeek = {
        completed: response.data.filter(
          (ticket) =>
            ticket.paymentStatus === "completed" &&
            new Date(ticket.createdAt) >= twoWeeksAgo &&
            new Date(ticket.createdAt) < oneWeekAgo
        ),
        pending: response.data.filter(
          (ticket) =>
            ticket.paymentStatus === "pending" &&
            new Date(ticket.createdAt) >= twoWeeksAgo &&
            new Date(ticket.createdAt) < oneWeekAgo
        ),
        failed: response.data.filter(
          (ticket) =>
            ticket.paymentStatus === "failed" &&
            new Date(ticket.createdAt) >= twoWeeksAgo &&
            new Date(ticket.createdAt) < oneWeekAgo
        ),
      };

      // Calculate counts and revenue
      const currentCompletedCount = currentWeek.completed.length;
      const currentPendingCount = currentWeek.pending.length;
      const currentFailedCount = currentWeek.failed.length;
      const currentRevenue = currentWeek.completed.reduce(
        (sum, ticket) => sum + ticket.amount,
        0
      );

      const previousCompletedCount = previousWeek.completed.length;
      const previousPendingCount = previousWeek.pending.length;
      const previousFailedCount = previousWeek.failed.length;
      const previousRevenue = previousWeek.completed.reduce(
        (sum, ticket) => sum + ticket.amount,
        0
      );

      // Calculate percentage changes
      const calculatePercentageChange = (current, previous) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
      };

      // Monthly targets (adjustable based on business needs)
      const targets = {
        completedTickets: 1000,
        pendingTickets: 500,
        failedTickets: 200,
        revenue: 10000000, // 10 million VND
      };

      // Calculate sales progress
      const calculateSalesProgress = (current, target) => {
        return Math.min((current / target) * 100, 100);
      };

      setRevenue({
        totalTickets: response.data.length,
        completedTickets: currentCompletedCount,
        pendingTickets: currentPendingCount,
        failedTickets: currentFailedCount,
        total: currentRevenue,
        completedPercentageChange: calculatePercentageChange(
          currentCompletedCount,
          previousCompletedCount
        ).toFixed(1),
        pendingPercentageChange: calculatePercentageChange(
          currentPendingCount,
          previousPendingCount
        ).toFixed(1),
        failedPercentageChange: calculatePercentageChange(
          currentFailedCount,
          previousFailedCount
        ).toFixed(1),
        revenuePercentageChange: calculatePercentageChange(
          currentRevenue,
          previousRevenue
        ).toFixed(1),
        completedSalesProgress: calculateSalesProgress(
          currentCompletedCount,
          targets.completedTickets
        ).toFixed(1),
        pendingSalesProgress: calculateSalesProgress(
          currentPendingCount,
          targets.pendingTickets
        ).toFixed(1),
        failedSalesProgress: calculateSalesProgress(
          currentFailedCount,
          targets.failedTickets
        ).toFixed(1),
        revenueSalesProgress: calculateSalesProgress(
          currentRevenue,
          targets.revenue
        ).toFixed(1),
      });

      setTickets({
        completed: response.data.filter((ticket) => ticket.paymentStatus === "completed"),
        failed: response.data.filter((ticket) => ticket.paymentStatus === "failed"),
        pending: response.data.filter((ticket) => ticket.paymentStatus === "pending"),
      });
    } catch (err) {
      console.error("Lỗi khi lấy danh sách vé:", err);
      setError(err.response?.data?.message || "Đã xảy ra lỗi khi lấy dữ liệu vé.");
    } finally {
      setLoading(false);
    }
  };

  const [sortOrder, setSortOrder] = useState("desc"); // "desc" = mới nhất, "asc" = cũ nhất

  const renderTickets = (ticketList) => {
    const sortedTickets = [...ticketList].sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    const toggleSortOrder = () => {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    };

    return (
      <div className="overflow-x-auto">
        {ticketList.length > 0 ? (
          <div className="max-h-[400px] overflow-y-auto">
            <table className="w-full text-white">
              <thead className="sticky top-0 bg-emerald-700 z-10">
                <tr className="border-b border-gray-600">
                  <th className="py-2 px-4 text-left">TICKETID</th>
                  <th className="py-2 px-4 text-left">Giá Vé</th>
                  <th className="py-2 px-4 text-left flex items-center gap-1 cursor-pointer" onClick={toggleSortOrder}>
                    Ngày Giao Dịch
                    {sortOrder === "asc" ? (
                      <FaArrowUpLong size={16} />
                    ) : (
                      <FaArrowDown size={16} />
                    )}
                  </th>
                  <th className="py-2 px-4 text-left">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {sortedTickets.map((ticket) => (
                  <tr key={ticket._id} className="border-b border-gray-600 text-neutral-950">
                    <td className="py-2 px-4 text-blue-500 underline font-semibold">{ticket.ticketId}</td>
                    <td className="py-2 px-4">
                      {ticket.amount ? formatVND(ticket.amount) : "N/A"}
                    </td>
                    <td className="py-2 px-4">
                      {new Date(ticket.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className={`py-2 px-4 ${getStatusColor(ticket.paymentStatus)}`}>
                      {ticket.paymentStatus.toUpperCase()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">Không có vé nào trong danh mục này.</p>
        )}
      </div>
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-yellow-500 font-bold";
      case "completed":
        return "text-green-600 font-bold";
      case "failed":
        return "text-red-500 font-bold";
      default:
        return "text-gray-500 font-bold";
    }
  };

  // Chart data for MiniChart using real data
  const completedChartData = [
    { value: revenue.completedTickets * 0.5 },
    { value: revenue.completedTickets * 0.75 },
    { value: revenue.completedTickets * 0.9 },
    { value: revenue.completedTickets },
  ];
  const pendingChartData = [
    { value: revenue.pendingTickets * 0.5 },
    { value: revenue.pendingTickets * 0.75 },
    { value: revenue.pendingTickets * 0.9 },
    { value: revenue.pendingTickets },
  ];
  const failedChartData = [
    { value: revenue.failedTickets * 0.5 },
    { value: revenue.failedTickets * 0.75 },
    { value: revenue.failedTickets * 0.9 },
    { value: revenue.failedTickets },
  ];
  const revenueChartData = [
    { value: revenue.total * 0.5 },
    { value: revenue.total * 0.75 },
    { value: revenue.total * 0.9 },
    { value: revenue.total },
  ];

  return (
    <div className="max-h-screen overflow-y-auto text-neutral-950">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-neutral-950 uppercase">Quản Lý vé đã bán</h2>
      </div>

      {/* Loading state */}
      {loading && <p className="text-blue-500">Đang tải dữ liệu...</p>}

      {/* Error state */}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Link to="">
          <Card className="bg-transparent shadow-md shadow-emerald-600 border-y-emerald-600 hover:bg-teal-600 hover:text-neutral-50 transition">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <FaTicketAlt className="text-red-500 text-2xl mr-3" />
              <CardTitle className="text-base font-bold text-gray-800">Vé Đã Thanh Toán</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="text-2xl font-bold">{revenue.completedTickets}</div>
                <div className="text-xs text-gray-600 mt-1">
                  <span className={revenue.completedPercentageChange >= 0 ? "text-green-500" : "text-red-500"}>
                    {revenue.completedPercentageChange >= 0 ? "+" : ""}{revenue.completedPercentageChange}%
                  </span> so với tuần trước
                </div>
                <div className="mt-2">
                  <Progress value={revenue.completedSalesProgress} className="h-1 bg-gray-800 w-full" indicatorClassName="bg-emerald-500" />
                  <div className="text-xs text-gray-600 mt-1">
                    <span className="text-sky-500">{revenue.completedSalesProgress}%</span> mục tiêu tháng
                  </div>
                </div>
              </div>
              <div className="w-20 h-16 mt-1">
                <MiniChart data={completedChartData} color="#22c55e" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="">
          <Card className="bg-transparent shadow-md shadow-emerald-600 border-y-emerald-600 hover:bg-teal-600 hover:text-neutral-50 transition">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <LuTicketSlash className="text-blue-500 text-2xl mr-3" />
              <CardTitle className="text-base font-bold text-gray-800">Vé Đang Chờ Xử Lý</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="text-2xl font-bold">{revenue.pendingTickets}</div>
                <div className="text-xs text-gray-600 mt-1">
                  <span className={revenue.pendingPercentageChange >= 0 ? "text-green-500" : "text-red-500"}>
                    {revenue.pendingPercentageChange >= 0 ? "+" : ""}{revenue.pendingPercentageChange}%
                  </span> so với tuần trước
                </div>
                <div className="mt-2">
                  <Progress value={revenue.pendingSalesProgress} className="h-1 bg-gray-800 w-full" indicatorClassName="bg-blue-500" />
                  <div className="text-xs text-gray-600 mt-1">
                    <span className="text-sky-500">{revenue.pendingSalesProgress}%</span> mục tiêu tháng
                  </div>
                </div>
              </div>
              <div className="w-20 h-16 mt-1">
                <MiniChart data={pendingChartData} color="#22c55e" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="">
          <Card className="bg-transparent shadow-md shadow-emerald-600 border-y-emerald-600 hover:bg-teal-600 hover:text-neutral-50 transition">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <LuTicketX className="text-purple-500 text-2xl mr-3" />
              <CardTitle className="text-base font-bold text-gray-800">Vé Thanh Toán Thất Bại</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="text-2xl font-bold">{revenue.failedTickets}</div>
                <div className="text-xs text-gray-600 mt-1">
                  <span className={revenue.failedPercentageChange >= 0 ? "text-green-500" : "text-red-500"}>
                    {revenue.failedPercentageChange >= 0 ? "+" : ""}{revenue.failedPercentageChange}%
                  </span> so với tuần trước
                </div>
                <div className="mt-2">
                  <Progress value={revenue.failedSalesProgress} className="h-1 bg-gray-800 w-full" indicatorClassName="bg-purple-500" />
                  <div className="text-xs text-gray-600 mt-1">
                    <span className="text-sky-500">{revenue.failedSalesProgress}%</span> mục tiêu tháng
                  </div>
                </div>
              </div>
              <div className="w-20 h-16 mt-1">
                <MiniChart data={failedChartData} color="#22c55e" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/admin/revenue">
          <Card className="bg-transparent shadow-md shadow-emerald-600 border-y-emerald-600 hover:bg-teal-600 hover:text-neutral-50 transition">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <FaMoneyBillWave className="text-green-500 text-2xl mr-3" />
              <CardTitle className="text-base font-bold text-gray-800">Doanh Thu</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="text-2xl font-bold">{revenue.total.toLocaleString("vi-VN")}đ</div>
                <div className="text-xs text-gray-600 mt-1">
                  <span className={revenue.revenuePercentageChange >= 0 ? "text-green-500" : "text-red-500"}>
                    {revenue.revenuePercentageChange >= 0 ? "+" : ""}{revenue.revenuePercentageChange}%
                  </span> so với tuần trước
                </div>
                <div className="mt-2">
                  <Progress value={revenue.revenueSalesProgress} className="h-1 bg-gray-800 w-full" indicatorClassName="bg-green-500" />
                  <div className="text-xs text-gray-600 mt-1">
                    <span className="text-sky-500">{revenue.revenueSalesProgress}%</span> mục tiêu tháng
                  </div>
                </div>
              </div>
              <div className="w-20 h-16 mt-1">
                <MiniChart data={revenueChartData} color="#22c55e" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="col-span-2">
          <PieChart tickets={tickets} />
        </div>
        <div className="col-span-2">
          <TicketLineChart tickets={tickets} />
        </div>
      </div>

      <div className="mb-4 flex space-x-2 overflow-y-auto">
        <button
          onClick={() => setSelectedStatus("completed")}
          className={`px-4 py-2 rounded ${selectedStatus === "completed" ? "bg-emerald-800 text-neutral-50" :  "bg-emerald-500 text-white"} hover:bg-emerald-800`}
        >
          Đã thanh toán
        </button>
        <button
          onClick={() => setSelectedStatus("pending")}
          className={`px-4 py-2 rounded ${selectedStatus === "pending" ? "bg-emerald-800 text-neutral-50" : "bg-emerald-500 text-white"} hover:bg-emerald-800`}
        >
          Đang thanh toán
        </button>
        <button
          onClick={() => setSelectedStatus("failed")}
          className={`px-4 py-2 rounded ${selectedStatus === "failed" ?"bg-emerald-800 text-neutral-50" : "bg-emerald-500 text-white"} hover:bg-emerald-800`}
        >
          Thanh toán thất bại
        </button>
      </div>

      {!loading && renderTickets(tickets[selectedStatus])}
    </div>
  );
};

export default ManageTickets;