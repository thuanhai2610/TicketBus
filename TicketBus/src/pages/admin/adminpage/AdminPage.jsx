/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaTicketAlt, FaBus, FaUsers, FaChartLine } from "react-icons/fa";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import MiniChart from "../../../components/minichart/MiniChart";
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
import RevenueAreaOnly from "../revenuechart/RevenueAreaOnly";
import { jwtDecode } from "jwt-decode";

const AdminPage = () => {
  const [trips, setTrips] = useState([]);
  const [revenue, setRevenue] = useState({
    total: 0,
    totalTickets: 0,
    percentageChange: 0,
    salesProgress: 0,
  });
  const [totalTrips, setTotalTrips] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [tripStats, setTripStats] = useState({
    percentageChange: 0,
    progress: 0,
  });
  const [userStats, setUserStats] = useState({
    percentageChange: 0,
    progress: 0,
  });

  const fetchTrips = async () => {
    try {
      const token = localStorage.getItem("token");
      const getUserIdFromToken = () => {
        const token = localStorage.getItem("token");
        if (token) {
          const decoded = jwtDecode(token);
          return decoded.sub;
        }
        return null;
      };
      const userId = getUserIdFromToken();
      console.log(userId);

      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

      // Fetch all trips
      const tripRes = await axios.get(`${import.meta.env.VITE_API_URL}/trip/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const enrichedTrips = await Promise.all(
        tripRes.data.map(async (trip) => {
          try {
            const vehicleRes = await axios.get(
              `${import.meta.env.VITE_API_URL}/vehicle/${trip.vehicleId}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            return {
              ...trip,
              seatCount: vehicleRes.data.seatCount,
              availableSeats: vehicleRes.data.availableSeats,
            };
          } catch {
            return {
              ...trip,
              seatCount: "/",
              availableSeats: "/",
            };
          }
        })
      );

      // Filter trips by period
      const currentWeekTrips = enrichedTrips.filter(
        (trip) => new Date(trip.createdAt) >= oneWeekAgo
      );
      const previousWeekTrips = enrichedTrips.filter(
        (trip) =>
          new Date(trip.createdAt) >= twoWeeksAgo &&
          new Date(trip.createdAt) < oneWeekAgo
      );

      // Calculate percentage change and progress
      const currentTripCount = currentWeekTrips.length;
      const previousTripCount = previousWeekTrips.length;
      const calculatePercentageChange = (current, previous) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
      };
      const tripTarget = 100; // Quarterly target: 100 trips
      const calculateSalesProgress = (current, target) => {
        return Math.min((current / target) * 100, 100);
      };

      setTotalTrips(currentTripCount);
      setTripStats({
        percentageChange: calculatePercentageChange(
          currentTripCount,
          previousTripCount
        ).toFixed(1),
        progress: calculateSalesProgress(currentTripCount, tripTarget).toFixed(1),
      });
      setTrips(enrichedTrips);
    } catch (err) {
      console.error("Lỗi fetch trip hoặc vehicle:", err);
    }
  };

  const STATUS_LABELS = {
    PENDING: "Đang chờ...",
    IN_PROGRESS: "Đang chạy",
    COMPLETED: "Hoàn thành",
    CANCELLED: "Đã hủy",
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const token = localStorage.getItem("token");
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

        // Fetch payment data
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/payments/all`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Filter payments by period
        const currentWeekPayments = res.data.filter(
          (payment) => new Date(payment.createdAt) >= oneWeekAgo
        );
        const previousWeekPayments = res.data.filter(
          (payment) =>
            new Date(payment.createdAt) >= twoWeeksAgo &&
            new Date(payment.createdAt) < oneWeekAgo
        );

        // Calculate metrics for current and previous periods
        const currentTotalTickets = currentWeekPayments.filter(
          (payment) => payment.paymentStatus === "completed"
        ).length;
        const currentTotalRevenue = currentWeekPayments
          .filter((payment) => payment.paymentStatus === "completed")
          .reduce((sum, payment) => sum + payment.amount, 0);

        const previousTotalTickets = previousWeekPayments.filter(
          (payment) => payment.paymentStatus === "completed"
        ).length;
        const previousTotalRevenue = previousWeekPayments
          .filter((payment) => payment.paymentStatus === "completed")
          .reduce((sum, payment) => sum + payment.amount, 0);

        const calculatePercentageChange = (current, previous) => {
          if (previous === 0) return current > 0 ? 100 : 0;
          return ((current - previous) / previous) * 100;
        };
        const ticketTarget = 1000; // Monthly target: 1000 tickets
        const revenueTarget = 10000000; // Monthly target: 10M VND
        const calculateSalesProgress = (current, target) => {
          return Math.min((current / target) * 100, 100);
        };

        setRevenue({
          total: currentTotalRevenue,
          totalTickets: currentTotalTickets,
          percentageChange: calculatePercentageChange(
            currentTotalTickets,
            previousTotalTickets
          ).toFixed(1),
          salesProgress: calculateSalesProgress(
            currentTotalTickets,
            ticketTarget
          ).toFixed(1),
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
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/user/total`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Assume an endpoint or local storage for previous period user count
        const previousUsers = localStorage.getItem("previousTotalUsers")
          ? parseInt(localStorage.getItem("previousTotalUsers"))
          : res.data.totalUsers * 0.9; // Fallback: assume 90% of current

        const currentTotalUsers = res.data.totalUsers;
        const calculatePercentageChange = (current, previous) => {
          if (previous === 0) return current > 0 ? 100 : 0;
          return ((current - previous) / previous) * 100;
        };
        const userTarget = 500; // Annual target: 500 users
        const calculateSalesProgress = (current, target) => {
          return Math.min((current / target) * 100, 100);
        };

        setTotalUsers(currentTotalUsers);
        setUserStats({
          percentageChange: calculatePercentageChange(
            currentTotalUsers,
            previousUsers
          ).toFixed(1),
          progress: calculateSalesProgress(currentTotalUsers, userTarget).toFixed(1),
        });

        // Store current user count for next period
        localStorage.setItem("previousTotalUsers", currentTotalUsers);
      } catch (error) {
        console.error("Lỗi khi lấy tổng số người dùng:", error);
      }
    };

    fetchTotalUsers();
  }, []);

  const updateTripStatus = async (tripId, newStatus) => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/trip/${tripId}`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert(`Cập nhật trạng thái thành công: ${newStatus}`);
      await fetchTrips();
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái:", err);
      alert("Cập nhật thất bại. Vui lòng thử lại.");
    }
  };

  // Chart data using real data
  const ticketChartData = [
    { value: revenue.totalTickets * 0.5 },
    { value: revenue.totalTickets * 0.75 },
    { value: revenue.totalTickets * 0.9 },
    { value: revenue.totalTickets },
  ];
  const revenueChartData = [
    { value: revenue.total * 0.5 },
    { value: revenue.total * 0.75 },
    { value: revenue.total * 0.9 },
    { value: revenue.total },
  ];
  const tripChartData = [
    { value: totalTrips * 0.5 },
    { value: totalTrips * 0.75 },
    { value: totalTrips * 0.9 },
    { value: totalTrips },
  ];
  const userChartData = [
    { value: totalUsers * 0.5 },
    { value: totalUsers * 0.75 },
    { value: totalUsers * 0.9 },
    { value: totalUsers },
  ];

  return (
    <div className="bg-gray-50 text-neutral-950 max-h-screen overflow-y-auto">
      <h2 className="text-3xl font-bold mb-6 uppercase text-neutral-950">
        Bảng điều khiển
      </h2>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {/* Vé đã bán */}
        <Link to="/admin/manage-tickets">
          <Card className="bg-transparent shadow-md shadow-emerald-600 border-y-emerald-600 hover:bg-teal-600 hover:text-neutral-50 transition">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <FaTicketAlt className="text-red-500 text-2xl mr-3" />
              <CardTitle className="text-base font-bold text-gray-800">
                Vé đã bán
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="text-2xl font-bold">{revenue.totalTickets}</div>
                <div className="text-xs text-gray-600 mt-1">
                  <span
                    className={
                      revenue.percentageChange >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }
                  >
                    {revenue.percentageChange >= 0 ? "+" : ""}
                    {revenue.percentageChange}%
                  </span>{" "}
                  so với tuần trước
                </div>
                <div className="mt-2">
                  <Progress
                    value={revenue.salesProgress}
                    className="h-1 bg-gray-800 w-full"
                    indicatorClassName="bg-emerald-500"
                  />
                  <div className="text-xs text-gray-600 mt-1">
                    <span className="text-sky-500">
                      {revenue.salesProgress}%
                    </span>{" "}
                    mục tiêu tháng
                  </div>
                </div>
              </div>
              <div className="w-20 h-16 mt-1">
                <MiniChart data={ticketChartData} color="#22c55e" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Doanh thu */}
        <Link to="/admin/revenue">
          <Card className="bg-transparent shadow-md shadow-emerald-600 border-y-emerald-600 hover:bg-teal-600 hover:text-neutral-50 transition">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <FaChartLine className="text-green-500 text-2xl mr-3" />
              <CardTitle className="text-base font-bold text-gray-800">
                Doanh thu
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="text-2xl font-bold">
                  {revenue.total.toLocaleString("vi-VN")} VNĐ
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  <span
                    className={
                      revenue.percentageChange >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }
                  >
                    {revenue.percentageChange >= 0 ? "+" : ""}
                    {revenue.percentageChange}%
                  </span>{" "}
                  so với tuần trước
                </div>
                <div className="mt-2">
                  <Progress
                    value={revenue.salesProgress}
                    className="h-1 bg-gray-800"
                    indicatorClassName="bg-green-500"
                  />
                  <div className="text-xs text-gray-600 mt-1">
                    <span className="text-sky-500">
                      {revenue.salesProgress}%
                    </span>{" "}
                    mục tiêu tháng
                  </div>
                </div>
              </div>
              <div className="w-20 h-16 mt-1">
                <MiniChart data={revenueChartData} color="#22c55e" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Chuyến xe */}
        <Link to="/admin/manage-trips">
          <Card className="bg-transparent shadow-md shadow-emerald-600 border-y-emerald-600 hover:bg-teal-600 hover:text-neutral-50 transition">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <FaBus className="text-blue-500 text-2xl mr-3" />
              <CardTitle className="text-base font-bold text-gray-800">
                Chuyến xe
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="text-2xl font-bold">{totalTrips}</div>
                <div className="text-xs text-gray-500 mt-1">
                  <span
                    className={
                      tripStats.percentageChange >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }
                  >
                    {tripStats.percentageChange >= 0 ? "+" : ""}
                    {tripStats.percentageChange}%
                  </span>{" "}
                  so với tuần trước
                </div>
                <div className="mt-2">
                  <Progress
                    value={tripStats.progress}
                    className="h-1 bg-gray-800"
                    indicatorClassName="bg-blue-500"
                  />
                  <div className="text-xs text-gray-400 mt-1">
                    <span className="text-sky-500">{tripStats.progress}%</span>{" "}
                    kế hoạch quý
                  </div>
                </div>
              </div>
              <div className="w-20 h-16 mt-1">
                <MiniChart data={tripChartData} color="#22c55e" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Khách hàng */}
        <Link to="/admin/manage-customers">
          <Card className="bg-transparent shadow-md shadow-emerald-600 border-y-emerald-600 hover:bg-teal-600 hover:text-neutral-50 transition">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <FaUsers className="text-purple-500 text-2xl mr-3" />
              <CardTitle className="text-base font-bold text-gray-800">
                Khách hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="text-2xl font-bold">{totalUsers}</div>
                <div className="text-xs text-gray-500 mt-1">
                  <span
                    className={
                      userStats.percentageChange >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }
                  >
                    {userStats.percentageChange >= 0 ? "+" : ""}
                    {userStats.percentageChange}%
                  </span>{" "}
                  so với tháng trước
                </div>
                <div className="mt-2">
                  <Progress
                    value={userStats.progress}
                    className="h-1 bg-gray-800"
                    indicatorClassName="bg-purple-500"
                  />
                  <div className="text-xs text-gray-400 mt-1">
                    <span className="text-sky-500">{userStats.progress}%</span>{" "}
                    mục tiêu năm
                  </div>
                </div>
              </div>
              <div className="w-20 h-16 mt-1">
                <MiniChart data={userChartData} color="#22c55e" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card className="shadow-md shadow-emerald-500 mb-6">
        <RevenueAreaOnly chartHeight={200} />
      </Card>

      {/* Tabs for Past Performance */}
      <Tabs defaultValue="past-performance" className="mb-6">
        <TabsList className="bg-transparent">
          <h2 className="text-2xl font-bold uppercase text-neutral-950">
            Tuyến đi
          </h2>
        </TabsList>
        <TabsContent value="past-performance" className="overflow-y-auto max-h-96">
          <Card className="bg-transparent shadow-md shadow-emerald-500">
            <CardHeader>
              <CardTitle className="text-lg">Chuyến xe gần đây</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-800 uppercase font-semibold">
                      Mã Chuyến
                    </TableHead>
                    <TableHead className="text-gray-800 uppercase font-semibold">
                      Tuyến
                    </TableHead>
                    <TableHead className="text-gray-800 uppercase font-semibold">
                      Số ghế
                    </TableHead>
                    <TableHead className="text-gray-800 uppercase font-semibold">
                      Giá vé
                    </TableHead>
                    <TableHead className="text-gray-800 uppercase font-semibold">
                      Trạng thái
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trips.map((trip) => (
                    <TableRow key={trip.tripId} className="border-gray-300">
                      <TableCell>
                        <Link
                          to={`/admin/trip/${trip.tripId}`}
                          className="text-blue-500 underline font-bold uppercase text-base"
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
                        {trip.price?.toLocaleString("vi-VN")} VNĐ
                      </TableCell>
                      <TableCell className="flex items-center space-x-2">
                        <span
                          className={
                            trip.status === "CANCELLED"
                              ? "text-red-500 font-semibold"
                              : trip.status === "IN_PROGRESS"
                              ? "text-blue-500 font-semibold"
                              : trip.status === "PENDING"
                              ? "text-yellow-500 font-semibold"
                              : "text-green-500"
                          }
                        >
                          {STATUS_LABELS[trip.status] || trip.status}
                        </span>

                        {trip.status === "PENDING" && (
                          <Button
                            className="text-xs bg-sky-400 hover:bg-blue-500"
                            onClick={() =>
                              updateTripStatus(trip.tripId, "IN_PROGRESS")
                            }
                          >
                            Bắt đầu
                          </Button>
                        )}

                        {trip.status === "IN_PROGRESS" && (
                          <>
                            <Button
                              className="text-xs text-white bg-green-500 hover:bg-green-600"
                              onClick={() =>
                                updateTripStatus(trip.tripId, "COMPLETED")
                              }
                            >
                              Hoàn thành
                            </Button>
                            <Button
                              className="text-xs text-white bg-red-500 hover:bg-red-600"
                              onClick={() =>
                                updateTripStatus(trip.tripId, "CANCELLED")
                              }
                            >
                              Hủy
                            </Button>
                          </>
                        )}
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