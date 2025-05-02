import React, { useState } from "react";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
} from "recharts";

const PieChartRecharts = ({ tickets }) => {
    const completed = tickets.completed.length;
    const pending = tickets.pending.length;
    const failed = tickets.failed.length;
    const total = completed + pending + failed;

    const getPercentage = (count) =>
        total > 0 ? ((count / total) * 100).toFixed(0) : 0;

    const data = [
        {
            name: `Đã Thanh Toán ${getPercentage(completed)}%`,
            value: completed,
            color: "#22C55E", // Vibrant Green
        },
        {
            name: `Đang Thanh Toán ${getPercentage(pending)}%`,
            value: pending,
            color: "#FACC15", // Bright Yellow
        },
        {
            name: `Thất Bại ${getPercentage(failed)}%`,
            value: failed,
            color: "#EF4444", // Vivid Red
        },
    ];

    const [activeIndex, setActiveIndex] = useState(null);

    const onPieEnter = (_, index) => {
        setActiveIndex(index);
    };

    const onPieLeave = () => {
        setActiveIndex(null);
    };

    return (
        <div className="w-full ">
            <h2 className="text-xl font-bold text-center text-gray-800 uppercase mb-4">
                Tỷ Lệ Thanh Toán
            </h2>
            <div className="flex flex-col items-center">
                <div className="relative w-full h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={100}
                                label={({ percent }) =>
                                    percent > 0 ? `${(percent * 100).toFixed(0)}%` : ""
                                }
                                onMouseEnter={onPieEnter}
                                onMouseLeave={onPieLeave}
                            >
                                {data.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={
                                            activeIndex === index
                                                ? entry.color
                                                : `${entry.color}B3` // Slightly transparent when not active
                                        }
                                        style={{
                                            transition: "all 0.3s ease",
                                            transform: activeIndex === index ? "scale(1.05)" : "scale(1)",
                                            transformOrigin: "center",
                                        }}
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value) => `${value} vé`}
                                contentStyle={{
                                    backgroundColor: "#fff",
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "8px",
                                    padding: "8px 12px",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                    color: "#1f2937",
                                    fontSize: "14px",
                                }}
                                wrapperStyle={{
                                    pointerEvents: "none",
                                    zIndex: 10,
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                        <div className="text-3xl font-bold text-gray-800">{total.toLocaleString()}</div>
                        <div className="text-sm text-gray-500 mt-1">Tổng Đơn Hàng</div>
                    </div>
                </div>
                <div className="flex flex-row justify-center space-x-4 flex-wrap text-gray-800 mt-4">
                    {data.map((item, index) => (
                        <div key={index} className="flex items-center">
                            <div
                                className="w-4 h-4 mr-2 rounded-full"
                                style={{ backgroundColor: item.color }}
                            ></div>
                            <span className="text-sm font-medium">{item.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PieChartRecharts;
