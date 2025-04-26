/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function AreaChartOnly({ chartHeight = 300 }) {
  const [chartData, setChartData] = useState([]);
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/payments/revenues`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch revenue data");
      const rawData = await response.json();

      if (!Array.isArray(rawData)) throw new Error("Expected rawData to be an array");
      const completedPaymentsData = rawData.filter((payment) => payment?.paymentStatus === "completed");

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
      } else if (view === "monthly") {
        setChartData(monthlyData);
      } else {
        setChartData(yearlyData);
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

  const formatYAxis = (tick) => {
    if (tick >= 1000000) return `${(tick / 1000000).toFixed(0)}M`;
    else if (tick >= 1000) return `${(tick / 1000).toFixed(0)}K`;
    return `${tick}`;
  };

  if (loading) return <p className="text-gray-400">Đang tải dữ liệu...</p>;
  if (error) return <p className="text-red-500">Lỗi: {error.message}</p>;

  return (
    <div className="p-6">
      <h2 className="font-bold uppercase text-3xl mb-6">Doanh Thu</h2>
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <button
              className={`px-4 py-2 text-sm rounded-lg ${view === "daily" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
              onClick={() => handleViewChange("daily")}
            >
              Doanh thu ngày
            </button>
            <button
              className={`px-4 py-2 text-sm rounded-lg ${view === "monthly" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
              onClick={() => handleViewChange("monthly")}
            >
              Doanh thu tháng
            </button>
          </div>
        </div>
        <div className="mt-4">
          <ResponsiveContainer width="100%" height={chartHeight}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="transparent" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis tickFormatter={formatYAxis} domain={[0, "auto"]} stroke="#9ca3af" />
              <Tooltip
                formatter={formatVND}
                contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", color: "#000" }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#ff6f61"
                fill="#ff6f61"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}