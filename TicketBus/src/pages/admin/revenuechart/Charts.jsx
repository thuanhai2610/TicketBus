import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts";



export default function Charts({ chartData, completedPayments, chartHeight, formatVND }) {
    const formatYAxis = (tick) => {
        if (tick >= 1000000) return `${(tick / 1000000).toFixed(0)} `;
        else if (tick >= 1000) return `${(tick / 1000).toFixed(0)} `;
        return `${tick} `;
    };

    // Calculate revenue for specific time periods
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    const totalRevenue = completedPayments.reduce((sum, payment) => sum + Number(payment.amount) || 0, 0);

    const revenueLast7Days = completedPayments
        .filter((payment) => new Date(payment.createdAt) >= sevenDaysAgo)
        .reduce((sum, payment) => sum + Number(payment.amount) || 0, 0);

    const revenueLast30Days = completedPayments
        .filter((payment) => new Date(payment.createdAt) >= thirtyDaysAgo)
        .reduce((sum, payment) => sum + Number(payment.amount) || 0, 0);

    const revenueLast1Year = completedPayments
        .filter((payment) => new Date(payment.createdAt) >= oneYearAgo)
        .reduce((sum, payment) => sum + Number(payment.amount) || 0, 0);

    // Circular data for 7 days, 30 days, 1 year
    const circularData = [
        {
            name: "7 ngày",
            value: revenueLast7Days,
            percentage: totalRevenue > 0 ? ((revenueLast7Days / totalRevenue) * 100).toFixed(0) : 0,
            color: "#00FF99",
        },
        {
            name: "30 ngày",
            value: revenueLast30Days,
            percentage: totalRevenue > 0 ? ((revenueLast30Days / totalRevenue) * 100).toFixed(0) : 0,
            color: "#00CDCD",
        },
        {
            name: "1 năm",
            value: revenueLast1Year,
            percentage: totalRevenue > 0 ? ((revenueLast1Year / totalRevenue) * 100).toFixed(0) : 0,
            color: "#CD5555",
        },
    ];

    return (
        <div className="flex gap-8">
            {/* Left Section: Area Chart and Bar Chart */}
            <div className="w-3/4">
                {/* Area Chart */}
                <div className="mb-6">
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
                                stroke="#0066FF"
                                fill="#0099FF"
                                fillOpacity={0.2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Bar Chart */}
                <div className="grid grid-cols-2 gap-6">
                    {/* Bar Chart Vertical (cột dọc như cũ) */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Phân bổ doanh thu (Cột dọc)</h3>
                        <ResponsiveContainer width="100%" height={chartHeight}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="transparent" />
                                <XAxis dataKey="date" stroke="#9ca3af" />
                                <YAxis tickFormatter={formatYAxis} domain={[0, "auto"]} stroke="#9ca3af" />
                                <Tooltip
                                    formatter={formatVND}
                                    contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", color: "#000" }}
                                />
                                <Bar dataKey="revenue" fill="#00B2BF" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Bar Chart Horizontal (cột ngang mới thêm) */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Phân bổ doanh thu (Cột ngang)</h3>
                        <ResponsiveContainer width="100%" height={chartHeight}>
                            <BarChart data={chartData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="transparent" />
                                <XAxis type="number" tickFormatter={formatYAxis} domain={[0, "auto"]} stroke="#9ca3af" />
                                <YAxis type="category" dataKey="date" stroke="#9ca3af" />
                                <Tooltip
                                    formatter={formatVND}
                                    contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", color: "#000" }}
                                />
                                <Bar dataKey="revenue" fill="#00A06B" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>

            {/* Right Section: Circular Progress Indicators */}
            <div className="w-1/3">
                <h3 className="text-lg font-semibold mb-4">Tỷ lệ doanh thu</h3>
                <div className="space-y-6">
                    {circularData.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                            <div className="relative w-24 h-24">
                                <svg className="w-full h-full" viewBox="0 0 36 36">
                                    <circle
                                        cx="18"
                                        cy="18"
                                        r="16"
                                        fill="none"
                                        stroke="#e5e7eb"
                                        strokeWidth="4"
                                    />
                                    <circle
                                        cx="18"
                                        cy="18"
                                        r="16"
                                        fill="none"
                                        stroke={item.color}
                                        strokeWidth="4"
                                        strokeDasharray={`${item.percentage}, 100`}
                                        strokeLinecap="round"
                                        transform="rotate(-90 18 18)"
                                    />
                                    <text
                                        x="19"
                                        y="21"
                                        textAnchor="middle"
                                        fill={item.color}
                                        fontSize="8"
                                        fontWeight="bold"
                                    >
                                        {item.percentage}%
                                    </text>
                                </svg>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-600">{item.name}</p>
                                <p className="text-lg font-semibold">{formatVND(item.value)}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-10">
                    <h4 className="text-md font-semibold mb-4">Biểu đồ tròn doanh thu</h4>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={circularData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                innerRadius={40}
                                fill="#8884d8"
                                label
                            >
                                {circularData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

            </div>
        </div>

    );
}