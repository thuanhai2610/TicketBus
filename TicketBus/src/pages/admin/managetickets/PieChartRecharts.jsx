import React from "react";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend,
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
            name: `Đã Thanh Toán - ${getPercentage(completed)}%`,
            value: completed,
            color: "rgba(0 205 102)",
        },
        {
            name: `Đang Thanh Toán - ${getPercentage(pending)}%`,
            value: pending,
            color: "rgba(238 201 0)",
        },
        {
            name: `Thất Bại - ${getPercentage(failed)}%`,
            value: failed,
            color: "rgba(255 64 64)",
        },
    ];

    return (
        <div className="w-full p-4 bg-gray-900 rounded-lg">
            <h2 className="text-xl font-semibold text-center text-white">
                Tỷ lệ thanh toán
            </h2>
            <div className="flex flex-col items-center">
                <div className="w-96 h-96"> {/* Increase width and height for larger size */}
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
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value) => `${value} vé`}
                                contentStyle={{
                                    backgroundColor: "#fff",
                                    border: "1px solid #e5e7eb",
                                    color: "#000",
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Legend below chart */}
                <div className="flex flex-row justify-center space-x-4 flex-wrap">
                    {data.map((item, index) => (
                        <div key={index} className="flex items-center mb-2">
                            <div
                                className="w-4 h-4 mr-2 rounded-full"
                                style={{ backgroundColor: item.color }}
                            ></div>
                            <span className="text-sm text-white">{item.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PieChartRecharts;
