import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const TicketAreaChart = ({ tickets }) => {
  // Hàm nhóm vé theo ngày
  const groupTicketsByDate = (tickets) => {
    const groupedData = {};

    // Hàm định dạng ngày thành chuỗi "D/M"
    const formatDate = (date) => {
      const d = new Date(date);
      const day = d.getDate(); // Lấy ngày không có số 0 ở đầu
      const month = d.getMonth() + 1; // Lấy tháng (0-11) + 1, không có số 0 ở đầu
      return `${day}/${month}`;
    };

    // Nhóm vé theo ngày và trạng thái
    tickets.completed.forEach((ticket) => {
      const date = formatDate(ticket.createdAt);
      if (!groupedData[date]) {
        groupedData[date] = { completed: 0, pending: 0, failed: 0 };
      }
      groupedData[date].completed += 1;
    });

    tickets.pending.forEach((ticket) => {
      const date = formatDate(ticket.createdAt);
      if (!groupedData[date]) {
        groupedData[date] = { completed: 0, pending: 0, failed: 0 };
      }
      groupedData[date].pending += 1;
    });

    tickets.failed.forEach((ticket) => {
      const date = formatDate(ticket.createdAt);
      if (!groupedData[date]) {
        groupedData[date] = { completed: 0, pending: 0, failed: 0 };
      }
      groupedData[date].failed += 1;
    });

    // Chuyển đổi thành mảng và sắp xếp theo ngày/tháng
    return Object.keys(groupedData)
      .map((date) => ({
        name: date,
        completed: groupedData[date].completed,
        pending: groupedData[date].pending,
        failed: groupedData[date].failed,
      }))
      .sort((a, b) => {
        const [dayA, monthA] = a.name.split("/").map(Number);
        const [dayB, monthB] = b.name.split("/").map(Number);
        // Giả định cùng năm để so sánh ngày/tháng
        return new Date(2025, monthA - 1, dayA) - new Date(2025, monthB - 1, dayB);
      });
  };

  // Dữ liệu cho biểu đồ
  const data = groupTicketsByDate(tickets);

  return (
    <div className="">
      <h3 className="text-lg font-semibold text-neutral-950 mb-4">Thống kê số lượng vé theo ngày</h3>
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid  strokeDasharray="3 3" stroke="#4b5563" horizontal={true} vertical={false} strokeOpacity={0.3} />
          <XAxis dataKey="name" stroke="#222222" label={{ value: "", position: "insideBottom", offset: -5, fill: "#222222" }} />
          <YAxis stroke="#222222" label={{ value: "Số lượng vé", angle: -90, position: "insideLeft", fill: "#222222" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1f2937",
              border: "none",
              color: "#ffffff",
            }}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="completed"
            stroke="#22c55e"
            fill="#22c55e"
            name="Đã thanh toán"
            activeDot={{ r: 8 }}
            fillOpacity={0.3}
          />
          <Area
            type="monotone"
            dataKey="pending"
            stroke="#FFCC00"
            fill="#facc15"
            name="Đang chờ xử lý"
            activeDot={{ r: 8 }}
            fillOpacity={0.3}
          />
          <Area
            type="monotone"
            dataKey="failed"
            stroke="#ef4444"
            fill="#ef4444"
            name="Thất bại"
            activeDot={{ r: 8 }}
            fillOpacity={0.3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TicketAreaChart;
