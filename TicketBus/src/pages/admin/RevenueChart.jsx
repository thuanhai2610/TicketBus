import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

const API_URL = "http://localhost:5000/revenue"; // API giả lập

export default function RevenueChart() {
  const [data, setData] = useState([]); // Dữ liệu doanh thu tháng
  const [dailyData, setDailyData] = useState([]); // Dữ liệu doanh thu ngày
  const [selectedMonth, setSelectedMonth] = useState(null); // Lưu tháng đang chọn
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, []);

  // Hàm xử lý khi bấm vào cột doanh thu tháng
  const handleBarClick = (data) => {
    setSelectedMonth(data.month);
    setDailyData(data.dailyRevenue || []); // Hiển thị doanh thu theo ngày
  };

  if (loading) return <p>Đang tải dữ liệu...</p>;
  if (error) return <p>Lỗi: {error.message}</p>;

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-bold mb-2">Doanh thu theo tháng</h2>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar
              dataKey="revenue"
              fill="#4F46E5"
              radius={[5, 5, 0, 0]}
              onClick={(e) => handleBarClick(e)}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>

      {selectedMonth && (
        <CardContent>
          <h2 className="text-xl font-bold mb-2">Doanh thu tháng {selectedMonth}</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyData}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#E53E3E" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      )}
    </Card>
  );
}
