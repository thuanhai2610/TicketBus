/* eslint-disable no-unused-vars */
import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(ArcElement, Tooltip, ChartDataLabels);

const PieChart = ({ tickets }) => {
    const completed = tickets.completed.length;
    const pending = tickets.pending.length;
    const failed = tickets.failed.length;
    const total = completed + pending + failed;

    const getPercentage = (count) =>
        total > 0 ? ((count / total) * 100).toFixed(0) : 0;

    const pieData = {
        labels: ["Đã Thanh Toán", "Đang Thanh Toán", "Thất Bại"],
        datasets: [
            {
                data: [completed, pending, failed],
                backgroundColor: [
                    "rgba(75, 192, 192, 0.8)",
                    "rgba(255, 206, 86, 0.8)",
                    "rgba(255, 99, 132, 0.8)",
                ],
                borderWidth: 0,
            },
        ],
    };

    const pieOptions = {
        responsive: true,
        cutout: "70%",
        plugins: {
            legend: { display: false },
            tooltip: { enabled: false },
            datalabels: {
                color: "#fff",
                font: { weight: "bold", size: 14 },
                formatter: (value, context) => {
                    const percentage = getPercentage(value);
                    return percentage > 0 ? `${percentage}%` : null;
                },
            },

            centerText: {
                beforeDraw(chart) {
                    const { ctx, width, height } = chart;
                    ctx.save();
                    ctx.font = "bold 30px Arial";
                    ctx.fillStyle = "#fff";
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.fillText("100%", width / 2, height / 2);
                    ctx.restore();
                },
            }

        },
    };

    const legendItems = [
        {
            label: `Đã Thanh Toán - ${getPercentage(completed)}%`,
            color: "rgba(75, 192, 192, 0.8)",
        },
        {
            label: `Đang Thanh Toán - ${getPercentage(pending)}%`,
            color: "rgba(255, 206, 86, 0.8)",
        },
        {
            label: `Thất Bại - ${getPercentage(failed)}%`,
            color: "rgba(255, 99, 132, 0.8)",
        },
    ];

    return (
        <div className="w-full p-4 bg-gray-900 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-center text-white">
                Tỷ lệ thanh toán
            </h2>
            <div className="flex flex-col items-center">
                <div className="w-64 h-64">
                    <Doughnut
                        data={pieData}
                        options={pieOptions}
                        plugins={[ChartDataLabels, {
                            id: "centerText",
                            beforeDraw: pieOptions.plugins.centerText.beforeDraw
                        }]}

                    />
                </div>
                {/* Legend ngang */}
                <div className="mt-4 flex flex-row justify-center space-x-4 flex-wrap">
                    {legendItems.map((item, index) => (
                        <div key={index} className="flex items-center mb-2">
                            <div
                                className="w-4 h-4 mr-2 rounded-full"
                                style={{ backgroundColor: item.color }}
                            ></div>
                            <span className="text-sm text-white">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PieChart;
