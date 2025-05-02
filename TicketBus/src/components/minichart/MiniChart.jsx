import { ResponsiveContainer, BarChart, Bar } from "recharts";

const MiniChart = ({ data, color = "#22c55e" }) => {
  return (
    <ResponsiveContainer width={100} height={30}>
      <BarChart data={data}>
        <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default MiniChart;