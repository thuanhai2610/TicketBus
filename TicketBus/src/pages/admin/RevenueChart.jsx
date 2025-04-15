/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

const API_URL = "http://localhost:3001/payments/revenues";

export default function RevenueChart({ chartHeight = 400 }) {
  const [chartData, setChartData] = useState([]);
  const [breakdownData, setBreakdownData] = useState({});
  const [view, setView] = useState("daily");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRevenue();
  }, [view]);

  const fetchRevenue = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const rawData = await response.json();
      const completedPayments = rawData.filter(
        (payment) => payment.paymentStatus === "completed"
      );
      const dailyMap = {};
      const monthlyMap = {};
      const yearlyMap = {};

      completedPayments.forEach((payment) => {
        const date = new Date(payment.createdAt);
        const dayKey = `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}`; // e.g., "08/04"
        const monthKey = `${date.getMonth() + 1}/${date.getFullYear()}`; // e.g., "4/2025"
        const yearKey = `${date.getFullYear()}`; // e.g., "2025"

        if (!dailyMap[dayKey]) {
          dailyMap[dayKey] = { date: dayKey, revenue: 0, tickets: [] };
        }
        dailyMap[dayKey].revenue += Number(payment.amount) || 0;
        dailyMap[dayKey].tickets.push(payment);

        if (!monthlyMap[monthKey]) {
          monthlyMap[monthKey] = { date: monthKey, revenue: 0, tickets: [] };
        }
        monthlyMap[monthKey].revenue += Number(payment.amount) || 0;
        monthlyMap[monthKey].tickets.push(payment);

        if (!yearlyMap[yearKey]) {
          yearlyMap[yearKey] = { date: yearKey, revenue: 0 };
        }
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

  const formatYAxis = (tick) => {
    if (tick >= 1000000) {
      return `${(tick / 1000000).toFixed(0)}M ₫`;
    } else if (tick >= 1000) {
      return `${(tick / 1000).toFixed(0)}K ₫`;
    }
    return `${tick} ₫`;
  };

  const formatVND = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  if (loading) return <p className="text-gray-400">Đang tải dữ liệu...</p>;
  if (error) return <p className="text-red-500">Lỗi: {error.message}</p>;

  return (
    <>
      <CardHeader>
        <CardTitle>Doanh thu theo thời gian</CardTitle>
        <div className="flex space-x-2 mt-2">
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
      </CardHeader>
      <CardContent>
        {/* Area Chart */}
        <ResponsiveContainer width="100%" height={chartHeight}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="date" stroke="#9CA3AF" />
            <YAxis tickFormatter={formatYAxis} domain={[0, "auto"]} stroke="#9CA3AF" />
            <Tooltip formatter={formatVND} contentStyle={{ backgroundColor: "#1F2937", border: "none", color: "#fff" }} />
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8c52ff" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#00bf63" stopOpacity={0.6} />
              </linearGradient>
            </defs>

            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#8c52ff"
              fill="url(#colorRevenue)"
              fillOpacity={1}
            />

          </AreaChart>
        </ResponsiveContainer>

        {/* Breakdown (only for daily and monthly views) */}
        {/* {(view === "daily" || view === "monthly") && Object.keys(breakdownData).length > 0 && (
          <div className="mt-4">
            <h3 className="text-md font-semibold mb-2">
              {view === "daily" ? "Chi tiết doanh thu theo ngày" : "Chi tiết doanh thu theo tháng"}
            </h3>
            <div className="grid gap-2">
              {Object.entries(breakdownData)
                .sort((a, b) => {
                  const [aKey, bKey] = [a[0], b[0]];
                  if (view === "daily") {
                    const [dayA, monthA] = aKey.split("/").map(Number);
                    const [dayB, monthB] = bKey.split("/").map(Number);
                    return new Date(2025, monthA - 1, dayA) - new Date(2025, monthB - 1, dayB);
                  } else {
                    const [monthA, yearA] = aKey.split("/").map(Number);
                    const [monthB, yearB] = bKey.split("/").map(Number);
                    return new Date(yearA, monthA - 1) - new Date(yearB, monthB - 1);
                  }
                })
                .map(([period, data]) => (
                  <div key={period} className="border p-2 rounded shadow text-sm">
                    <h4 className="font-semibold">
                      {view === "daily" ? `Ngày: ${period}` : `Tháng: ${period}`}
                    </h4>
                    <p>
                      <strong>Tổng doanh thu:</strong> {formatVND(data.revenue)}
                    </p>
                    <p>
                      <strong>Số vé bán được:</strong> {data.tickets.length}
                    </p>
                  </div>
                ))
                }
            </div>
          </div>
        )} */}
      </CardContent>
    </>
  );
}