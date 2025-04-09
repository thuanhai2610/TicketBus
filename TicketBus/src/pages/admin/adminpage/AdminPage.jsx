import React, { useState, useEffect } from "react";
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
import axios from "axios";
import RevenueChart from "../RevenueChart"; 

const AdminPage = () => {

  const [trips, setTrips] = useState([]);
  const [revenue, setRevenue] = useState({ total: 0, totalTickets: 0 });
  const [totalTrips, setTotalTrips] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const token = localStorage.getItem("token");

        const tripRes = await axios.get("http://localhost:3001/trip/all", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        const enrichedTrips = await Promise.all(
          tripRes.data.map(async (trip) => {
            try {
              const vehicleRes = await axios.get(
                `http://localhost:3001/vehicle/${trip.vehicleId}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );

              return {
                ...trip,
                seatCount: vehicleRes.data.seatCount,
                availableSeats: vehicleRes.data.availableSeats,
              };
            } catch (vehicleErr) {
              console.warn(
                `Không thể lấy thông tin vehicle cho trip ${trip.tripId}`,
                vehicleErr
              );
              return {
                ...trip,
                seatCount: "/",
                availableSeats: "/",
              };
            }
          })
        );
        const totalTripRes = await axios.get("http://localhost:3001/trip/total", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        // Set totalTrips từ API
        setTotalTrips(totalTripRes.data.totalTrips);
        setTrips(enrichedTrips);
      } catch (err) {
        console.error("Lỗi fetch trip hoặc vehicle:", err);
      }
    };
   
    fetchTrips();
  }, []);
  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:3001/payments/revenues/total", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setRevenue({
          total: res.data.total,
          totalTickets: res.data.totalTickets
        });
   
      } catch (error) {
        console.error("Lỗi khi lấy doanh thu:", error);
      }
    };
   
    fetchRevenue();
  }, []);
  useEffect(() => {
    const fetchTotalUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:3001/user/total", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        setTotalUsers(res.data.totalUsers);
      } catch (error) {
        console.error("Lỗi khi lấy tổng số người dùng:", error);
      }
    };
  
    fetchTotalUsers();
  }, []);
  return (
    <div className="p-6 bg-gray-900 text-white max-h-screen overflow-y-auto">
      <h2 className="text-2xl font-semibold mb-6">Bảng điều khiển</h2>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Link to="/admin/manage-tickets">
          <Card className="bg-gray-800 border-gray-700 hover:bg-gray-700 transition">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <FaTicketAlt className="text-red-500 text-2xl mr-3" />
              <CardTitle className="text-sm font-medium text-gray-400">
                Vé đã bán
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{revenue.totalTickets}</div>
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
              <div className="text-2xl font-bold">{revenue.total.toLocaleString("vi-VN")}đ</div>
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
              <div className="text-2xl font-bold">{totalTrips}</div>
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
              <div className="text-2xl font-bold">{totalUsers}</div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Revenue Chart Section (using RevenueChart component) */}
      <Card className="bg-gray-800 border-gray-700 mb-6">
        <RevenueChart chartHeight={200} /> {/* Smaller height */}
      </Card>

      {/* Tabs for Past Performance */}
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
                  {trips.map((trip) => (
                    <TableRow key={trip.tripId} className="border-gray-700">
                      <TableCell>
                        <Link
                          to={`/admin/trip/${trip.tripId}`}
                          className="text-blue-500 underline"
                        >
                          {`${trip.tripId}`}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {trip.departurePoint} - {trip.destinationPoint}
                      </TableCell>
                      <TableCell>
                        {trip.availableSeats}/{trip.seatCount}
                      </TableCell>
                      <TableCell>
                        {trip.price?.toLocaleString("vi-VN")}đ
                      </TableCell>
                      <TableCell
                        className={
                          trip.status === "Đang chạy"
                            ? "text-red-500"
                            : "text-green-500"
                        }
                      >
                        {trip.status}
                      </TableCell>
                    </TableRow>
                  ))}
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