import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaTicketAlt, FaBus, FaUsers, FaMoneyBillWave } from "react-icons/fa";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Sample data for the chart (similar to the one in the image)
const chartData = [
  { date: "Jun 1", visitors: 4000 },
  { date: "Jun 3", visitors: 3000 },
  { date: "Jun 5", visitors: 5000 },
  { date: "Jun 7", visitors: 2000 },
  { date: "Jun 9", visitors: 6000 },
  { date: "Jun 11", visitors: 4000 },
  { date: "Jun 13", visitors: 7000 },
  { date: "Jun 15", visitors: 3000 },
  { date: "Jun 17", visitors: 8000 },
  { date: "Jun 19", visitors: 5000 },
  { date: "Jun 21", visitors: 6000 },
  { date: "Jun 23", visitors: 4000 },
  { date: "Jun 25", visitors: 7000 },
  { date: "Jun 27", visitors: 5000 },
  { date: "Jun 30", visitors: 6000 },
];

const AdminPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("day");

  // Simulate the revenue data based on the selected period
  const getRevenueData = () => {
    switch (selectedPeriod) {
      case "day":
        return "$1,200";
      case "month":
        return "$23,450";
      case "year":
        return "$280,500";
      default:
        return "$0";
    }
  };

  return (
    <div className="p-6 bg-gray-900 text-white max-h-screen overflow-y-auto">
      <h2 className="text-2xl font-semibold mb-6">Bảng điều khiển</h2>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6 max-h-screen overflow-y-auto">
        <Link to="/admin/manage-tickets">
          <Card className="bg-gray-800 border-gray-700 hover:bg-gray-700 transition">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <FaTicketAlt className="text-red-500 text-2xl mr-3" />
              <CardTitle className="text-sm font-medium text-gray-400">
                Vé đã bán
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,230</div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/admin/revenue">
          <Card className="bg-gray-800 border-gray-700 hover:bg-gray-700 transition">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <FaMoneyBillWave className="text-green-500 text-2xl mr-3" />
              <CardTitle className="text-sm font-medium text-gray-400">
                Doanh thu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getRevenueData()}</div>
      
            </CardContent>
          </Card>
        </Link>
        <Link to="/admin/manage-trips">
          <Card className="bg-gray-800 border-gray-700 hover:bg-gray-700 transition">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <FaBus className="text-blue-500 text-2xl mr-3" />
              <CardTitle className="text-sm font-medium text-gray-400">
                Chuyến xe
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">320</div>
 
            </CardContent>
          </Card>
        </Link>
        <Link to="/admin/manage-customers">
          <Card className="bg-gray-800 border-gray-700 hover:bg-gray-700 transition">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <FaUsers className="text-purple-500 text-2xl mr-3" />
              <CardTitle className="text-sm font-medium text-gray-400">
                Khách hàng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">890</div>
    
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Revenue Button Controls */}
      <Card className="bg-gray-800 border-gray-700 mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Doanh thu theo thời gian</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2 mb-4 overflow-x-auto text-primary">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedPeriod("day")}
            >
              Doanh thu ngày
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedPeriod("month")}
            >
              Doanh thu tháng
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedPeriod("year")}
            >
              Doanh thu năm
            </Button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip contentStyle={{ backgroundColor: "#1F2937", border: "none", color: "#fff" }} />
              <Area type="monotone" dataKey="visitors" stackId="1" stroke="#3B82F6" fill="#1E40AF" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabs for Past Performance, Key Personnel, Focus Documents */}
      <Tabs defaultValue="past-performance" className="mb-6">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="past-performance">Tuyến đi</TabsTrigger>
        </TabsList>
        <TabsContent value="past-performance" className="overflow-y-auto max-h-96">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg">Chuyến xe gần đây</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-400">Mã Chuyến</TableHead>
                    <TableHead className="text-gray-400">Tuyến</TableHead>
                    <TableHead className="text-gray-400">Số ghế</TableHead>
                    <TableHead className="text-gray-400">Giá vé</TableHead>
                    <TableHead className="text-gray-400">Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="border-gray-700">
                    <TableCell>
                      <Link to="/admin/trip/*" className="text-blue-500 underline">BX1234</Link>
                    </TableCell>
                    <TableCell>Hà Nội - Sài Gòn</TableCell>
                    <TableCell>45/50</TableCell>
                    <TableCell>$25</TableCell>
                    <TableCell className="text-green-500">Đang chạy</TableCell>
                  </TableRow>
                  <TableRow className="border-gray-700">
                    <TableCell>
                      <Link to="/admin/trip/*" className="text-blue-500 underline">BX5678</Link>
                    </TableCell>
                    <TableCell>Đà Nẵng - Hà Nội</TableCell>
                    <TableCell>30/40</TableCell>
                    <TableCell>$20</TableCell>
                    <TableCell className="text-red-500">Hủy chuyến</TableCell>
                  </TableRow>
                  <TableRow className="border-gray-700">
                    <TableCell>
                      <Link to="/admin/trip/*" className="text-blue-500 underline">BX91011</Link>
                    </TableCell>
                    <TableCell>Hải Phòng - Vinh</TableCell>
                    <TableCell>38/45</TableCell>
                    <TableCell>$15</TableCell>
                    <TableCell className="text-green-500">Đang chạy</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
