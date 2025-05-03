/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import Charts from "./Charts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FaMoneyBillWave, FaReceipt, FaCalculator, FaChartLine } from "react-icons/fa";
import MiniChart from "../../../components/minichart/MiniChart";

export default function RevenueChart({ chartHeight = 300 }) {
  const [chartData, setChartData] = useState([]);
  const [breakdownData, setBreakdownData] = useState({});
  const [view, setView] = useState("daily");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({ totalRevenue: 0, totalTickets: 0, avgRevenue: 0 });
  const [completedPayments, setCompletedPayments] = useState([]);
  const [stats, setStats] = useState({
    revenue: { percentageChange: 0, progress: 0 },
    tickets: { percentageChange: 0, progress: 0 },
    avgRevenue: { percentageChange: 0, progress: 0 },
    projectedRevenue: { percentageChange: 0, progress: 0 },
  });

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
      setCompletedPayments(completedPaymentsData);

      // Calculate summary data
      const totalRevenue = completedPaymentsData.reduce((sum, payment) => sum + Number(payment.amount) || 0, 0);
      const totalTickets = completedPaymentsData.length;
      const avgRevenue = totalTickets > 0 ? totalRevenue / totalTickets : 0;
      setSummary({ totalRevenue, totalTickets, avgRevenue });

      // Calculate percentage change and progress
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      const currentPeriodPayments = completedPaymentsData.filter(
        (payment) => new Date(payment.createdAt) >= (view === "daily" ? oneWeekAgo : oneMonthAgo)
      );
      const previousPeriodPayments = completedPaymentsData.filter(
        (payment) =>
          new Date(payment.createdAt) >= (view === "daily" ? twoWeeksAgo : twoMonthsAgo) &&
          new Date(payment.createdAt) < (view === "daily" ? oneWeekAgo : oneMonthAgo)
      );

      const currentTotalRevenue = currentPeriodPayments.reduce((sum, payment) => sum + Number(payment.amount) || 0, 0);
      const currentTotalTickets = currentPeriodPayments.length;
      const currentAvgRevenue = currentTotalTickets > 0 ? currentTotalRevenue / currentTotalTickets : 0;

      const previousTotalRevenue = previousPeriodPayments.reduce((sum, payment) => sum + Number(payment.amount) || 0, 0);
      const previousTotalTickets = previousPeriodPayments.length;
      const previousAvgRevenue = previousTotalTickets > 0 ? previousTotalRevenue / previousTotalTickets : 0;

      const calculatePercentageChange = (current, previous) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
      };

      const revenueTarget = 10000000; // Monthly target: 10M VND
      const ticketTarget = 1000; // Monthly target: 1000 tickets
      const avgRevenueTarget = 10000; // Target: 10K VND per ticket
      const calculateProgress = (current, target) => {
        return Math.min((current / target) * 100, 100);
      };

      setStats({
        revenue: {
          percentageChange: calculatePercentageChange(currentTotalRevenue, previousTotalRevenue).toFixed(1),
          progress: calculateProgress(currentTotalRevenue, revenueTarget).toFixed(1),
        },
        tickets: {
          percentageChange: calculatePercentageChange(currentTotalTickets, previousTotalTickets).toFixed(1),
          progress: calculateProgress(currentTotalTickets, ticketTarget).toFixed(1),
        },
        avgRevenue: {
          percentageChange: calculatePercentageChange(currentAvgRevenue, previousAvgRevenue).toFixed(1),
          progress: calculateProgress(currentAvgRevenue, avgRevenueTarget).toFixed(1),
        },
        projectedRevenue: {
          percentageChange: calculatePercentageChange(currentTotalRevenue, previousTotalRevenue).toFixed(1),
          progress: calculateProgress(currentTotalRevenue, revenueTarget).toFixed(1),
        },
      });

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

  // Chart data for MiniChart
  const revenueChartData = [
    { value: summary.totalRevenue * 0.5 },
    { value: summary.totalRevenue * 0.75 },
    { value: summary.totalRevenue * 0.9 },
    { value: summary.totalRevenue },
  ];
  const ticketChartData = [
    { value: summary.totalTickets * 0.5 },
    { value: summary.totalTickets * 0.75 },
    { value: summary.totalTickets * 0.9 },
    { value: summary.totalTickets },
  ];
  const avgRevenueChartData = [
    { value: summary.avgRevenue * 0.5 },
    { value: summary.avgRevenue * 0.75 },
    { value: summary.avgRevenue * 0.9 },
    { value: summary.avgRevenue },
  ];
  const projectedRevenueChartData = [
    { value: summary.totalRevenue * 0.5 },
    { value: summary.totalRevenue * 0.75 },
    { value: summary.totalRevenue * 0.9 },
    { value: summary.totalRevenue },
  ];

  if (loading) return <p className="text-gray-400">Đang tải dữ liệu...</p>;
  if (error) return <p className="text-red-500">Lỗi: {error.message}</p>;

  return (
    <div className="min-h-screen px-4 text-neutral-950">
      <h2 className="font-bold uppercase text-3xl mb-6">Quản lý Doanh Thu</h2>

      {/* Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {/* Tổng Doanh Thu */}
        <Card className="bg-transparent shadow-md shadow-emerald-600 border-y-emerald-600 hover:bg-teal-600 hover:text-neutral-50 transition">
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <FaMoneyBillWave className="text-green-500 text-2xl mr-3" />
            <CardTitle className="text-base font-bold text-gray-800">
              Tổng Doanh Thu
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <div className="text-2xl font-bold">{formatVND(summary.totalRevenue)}</div>
              <div className="text-xs text-gray-500 mt-1">
                <span
                  className={
                    stats.revenue.percentageChange >= 0
                      ? "text-green-500"
                      : "text-red-500"
                  }
                >
                  {stats.revenue.percentageChange >= 0 ? "+" : ""}
                  {stats.revenue.percentageChange}%
                </span>{" "}
                so với {view === "daily" ? "tuần trước" : "tháng trước"}
              </div>
              <div className="mt-2">
                <Progress
                  value={stats.revenue.progress}
                  className="h-1 bg-gray-800"
                  indicatorClassName="bg-green-500"
                />
                <div className="text-xs text-gray-400 mt-1">
                  <span className="text-sky-500">{stats.revenue.progress}%</span>{" "}
                  mục tiêu tháng
                </div>
              </div>
            </div>
            <div className="w-20 h-16 mt-1">
              <MiniChart data={revenueChartData} color="#22c55e" />
            </div>
          </CardContent>
        </Card>

        {/* Số Giao Dịch */}
        <Card className="bg-transparent shadow-md shadow-emerald-600 border-y-emerald-600 hover:bg-teal-600 hover:text-neutral-50 transition">
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <FaReceipt className="text-blue-500 text-2xl mr-3" />
            <CardTitle className="text-base font-bold text-gray-800">
              Số Giao Dịch
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <div className="text-2xl font-bold">{summary.totalTickets}</div>
              <div className="text-xs text-gray-500 mt-1">
                <span
                  className={
                    stats.tickets.percentageChange >= 0
                      ? "text-green-500"
                      : "text-red-500"
                  }
                >
                  {stats.tickets.percentageChange >= 0 ? "+" : ""}
                  {stats.tickets.percentageChange}%
                </span>{" "}
                so với {view === "daily" ? "tuần trước" : "tháng trước"}
              </div>
              <div className="mt-2">
                <Progress
                  value={stats.tickets.progress}
                  className="h-1 bg-gray-800"
                  indicatorClassName="bg-blue-500"
                />
                <div className="text-xs text-gray-400 mt-1">
                  <span className="text-sky-500">{stats.tickets.progress}%</span>{" "}
                  mục tiêu tháng
                </div>
              </div>
            </div>
            <div className="w-20 h-16 mt-1">
              <MiniChart data={ticketChartData} color="#22c55e" />
            </div>
          </CardContent>
        </Card>

        {/* Doanh Thu Trung Bình */}
        <Card className="bg-transparent shadow-md shadow-emerald-600 border-y-emerald-600 hover:bg-teal-600 hover:text-neutral-50 transition">
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <FaCalculator className="text-yellow-500 text-2xl mr-3" />
            <CardTitle className="text-base font-bold text-gray-800">
              Doanh Thu Trung Bình
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <div className="text-2xl font-bold">{formatVND(summary.avgRevenue)}</div>
              <div className="text-xs text-gray-500 mt-1">
                <span
                  className={
                    stats.avgRevenue.percentageChange >= 0
                      ? "text-green-500"
                      : "text-red-500"
                  }
                >
                  {stats.avgRevenue.percentageChange >= 0 ? "+" : ""}
                  {stats.avgRevenue.percentageChange}%
                </span>{" "}
                so với {view === "daily" ? "tuần trước" : "tháng trước"}
              </div>
              <div className="mt-2">
                <Progress
                  value={stats.avgRevenue.progress}
                  className="h-1 bg-gray-800"
                  indicatorClassName="bg-yellow-500"
                />
                <div className="text-xs text-gray-400 mt-1">
                  <span className="text-sky-500">{stats.avgRevenue.progress}%</span>{" "}
                  mục tiêu tháng
                </div>
              </div>
            </div>
            <div className="w-20 h-16 mt-1">
              <MiniChart data={avgRevenueChartData} color="#22c55e" />
            </div>
          </CardContent>
        </Card>

        {/* Doanh Thu Dự Kiến */}
        <Card className="bg-transparent shadow-md shadow-emerald-600 border-y-emerald-600 hover:bg-teal-600 hover:text-neutral-50 transition">
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <FaChartLine className="text-purple-500 text-2xl mr-3" />
            <CardTitle className="text-base font-bold text-gray-800">
              Doanh Thu Dự Kiến
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <div className="text-2xl font-bold">{formatVND(summary.totalRevenue)}</div>
              <div className="text-xs text-gray-500 mt-1">
                <span
                  className={
                    stats.projectedRevenue.percentageChange >= 0
                      ? "text-green-500"
                      : "text-red-500"
                  }
                >
                  {stats.projectedRevenue.percentageChange >= 0 ? "+" : ""}
                  {stats.projectedRevenue.percentageChange}%
                </span>{" "}
                so với {view === "daily" ? "tuần trước" : "tháng trước"}
              </div>
              <div className="mt-2">
                <Progress
                  value={stats.projectedRevenue.progress}
                  className="h-1 bg-gray-800"
                  indicatorClassName="bg-purple-500"
                />
                <div className="text-xs text-gray-400 mt-1">
                  <span className="text-sky-500">{stats.projectedRevenue.progress}%</span>{" "}
                  mục tiêu tháng
                </div>
              </div>
            </div>
            <div className="w-20 h-16 mt-1">
              <MiniChart data={projectedRevenueChartData} color="#22c55e" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Section */}
      <div className="mb-6  p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Doanh thu gần đây</h3>
          <div className="flex space-x-2">
            <button
              className={`px-3 py-1 rounded text-sm ${view === "daily" ? "bg-emerald-700 text-neutral-50" : "bg-emerald-500 text-black hover:bg-emerald-400"}`}
              onClick={() => handleViewChange("daily")}
            >
              Doanh thu ngày
            </button>
            <button
              className={`px-3 py-1 rounded text-sm ${view === "monthly" ? "bg-emerald-700 text-neutral-50" : "bg-emerald-500 text-black hover:bg-emerald-400"}`}
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