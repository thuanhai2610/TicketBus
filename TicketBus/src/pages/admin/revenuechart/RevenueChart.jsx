/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import Charts from "./Charts";

export default function RevenueChart({ chartHeight = 300 }) {
  const [chartData, setChartData] = useState([]);
  const [breakdownData, setBreakdownData] = useState({});
  const [view, setView] = useState("daily");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({ totalRevenue: 0, totalTickets: 0, avgRevenue: 0 });
  const [completedPayments, setCompletedPayments] = useState([]); // New state to store completed payments

  useEffect(() => {
    fetchRevenue();
  }, [view]);

  const fetchRevenue = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/payments/revenues`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch revenue data");
      const rawData = await response.json();

      if (!Array.isArray(rawData)) throw new Error("Expected rawData to be an array");
      const completedPaymentsData = rawData.filter((payment) => payment?.paymentStatus === "completed");
      setCompletedPayments(completedPaymentsData); // Store completed payments

      // Calculate summary data
      const totalRevenue = completedPaymentsData.reduce((sum, payment) => sum + Number(payment.amount) || 0, 0);
      const totalTickets = completedPaymentsData.length;
      const avgRevenue = totalTickets > 0 ? totalRevenue / totalTickets : 0;
      setSummary({ totalRevenue, totalTickets, avgRevenue });

      // Process data for charts
      const dailyMap = {};
      const monthlyMap = {};
      const yearlyMap = {};

      completedPaymentsData.forEach((payment) => {
        const date = new Date(payment.createdAt);
        const dayKey = `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}`;
        const monthKey = `${date.getMonth() + 1}/${date.getFullYear()}`;
        const yearKey = `${date.getFullYear()}`;

        if (!dailyMap[dayKey]) dailyMap[dayKey] = { date: dayKey, revenue: 0, tickets: [] };
        dailyMap[dayKey].revenue += Number(payment.amount) || 0;
        dailyMap[dayKey].tickets.push(payment);

        if (!monthlyMap[monthKey]) monthlyMap[monthKey] = { date: monthKey, revenue: 0, tickets: [] };
        monthlyMap[monthKey].revenue += Number(payment.amount) || 0;
        monthlyMap[monthKey].tickets.push(payment);

        if (!yearlyMap[yearKey]) yearlyMap[yearKey] = { date: yearKey, revenue: 0 };
        yearlyMap[yearKey].revenue += Number(payment.amount) || 0;
      });

      const dailyData = Object.values(dailyMap).sort((a, b) => {
        const [dayA, monthA] = a.date.split("/").map(Number);
        const [dayB, monthB] = b.date.split("/").map(Number);
        return new Date(2025, monthA - 1, dayA) - new Date(2025, monthB - 1, dayB);
      });

      const monthlyData = Object.values(monthlyMap).sort((a, b) => {
        const [monthA, yearA] = a.date.split("/").map(Number);
        const [monthB, yearB] = b.date.split("/").map(Number);
        return new Date(yearA, monthA - 1) - new Date(yearB, monthB - 1);
      });

      const yearlyData = Object.values(yearlyMap).sort((a, b) => Number(a.date) - Number(b.date));

      if (view === "daily") {
        setChartData(dailyData);
        setBreakdownData(dailyMap);
      } else if (view === "monthly") {
        setChartData(monthlyData);
        setBreakdownData(monthlyMap);
      } else {
        setChartData(yearlyData);
        setBreakdownData({});
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching revenue:", err);
      setError(err);
      setLoading(false);
    }
  };

  const handleViewChange = (newView) => {
    setView(newView);
  };

  const formatVND = (value) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
  };

  if (loading) return <p className="text-gray-400">Đang tải dữ liệu...</p>;
  if (error) return <p className="text-red-500">Lỗi: {error.message}</p>;

  return (
    <div className="min-h-screen px-4">
      <h2 className="font-bold uppercase text-3xl mb-6">Quản lý Doanh Thu</h2>

      {/* Summary Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800 text-white shadow-md rounded-lg p-4">
          <p className="text-sm">Tổng Doanh Thu</p>
          <p className="text-2xl font-bold mt-2">{formatVND(summary.totalRevenue)}</p>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div className="bg-white h-2 rounded-full" style={{ width: "60%" }}></div>
          </div>
        </div>
        <div className="bg-slate-800 text-white shadow-md rounded-lg p-4">
          <p className="text-sm">Số Giao Dịch</p>
          <p className="text-2xl font-bold mt-2">{summary.totalTickets}</p>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div className="bg-white h-2 rounded-full" style={{ width: "30%" }}></div>
          </div>
        </div>
        <div className="bg-slate-800 text-white shadow-md rounded-lg p-4">
          <p className="text-sm">Doanh Thu Trung Bình</p>
          <p className="text-2xl font-bold mt-2">{formatVND(summary.avgRevenue)}</p>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div className="bg-white h-2 rounded-full" style={{ width: "70%" }}></div>
          </div>
        </div>
        <div className="bg-slate-800 text-white shadow-md rounded-lg p-4">
          <p className="text-sm">Doanh Thu</p>
          <p className="text-2xl font-bold mt-2">{formatVND(summary.totalRevenue)}</p>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div className="bg-white h-2 rounded-full" style={{ width: "50%" }}></div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="mb-6 shadow-md rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Doanh thu gần đây</h3>
          <div className="flex space-x-2">
            <button
              className={`px-3 py-1 rounded text-sm ${view === "daily" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}
              onClick={() => handleViewChange("daily")}
            >
              Doanh thu ngày
            </button>
            <button
              className={`px-3 py-1 rounded text-sm ${view === "monthly" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}
              onClick={() => handleViewChange("monthly")}
            >
              Doanh thu tháng
            </button>
          </div>
        </div>
        <Charts
          chartData={chartData}
          completedPayments={completedPayments}
          chartHeight={chartHeight}
          formatVND={formatVND}
        />
      </div>
    </div>
  );
}
