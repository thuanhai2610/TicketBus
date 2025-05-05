/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
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

// Create a custom cache object outside the component
const dashboardCache = {
  data: null,
  timestamp: null,
  // Cache is valid for 5 minutes
  isValid: () => {
    if (!dashboardCache.timestamp) return false;
    const cacheAge = Date.now() - dashboardCache.timestamp;
    return cacheAge < 5 * 60 * 1000; // 5 minutes in milliseconds
  },
  set: (data) => {
    dashboardCache.data = data;
    dashboardCache.timestamp = Date.now();
  },
  clear: () => {
    dashboardCache.data = null;
    dashboardCache.timestamp = null;
  }
};

// Create an axios instance with common settings
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000 // 10s timeout
});

// Add request interceptor to set auth token
api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const AdminPage = () => {
  // State for dashboard data
  const [dashboardState, setDashboardState] = useState({
    trips: [],
    revenue: {
      total: 0,
      totalTickets: 0,
      percentageChange: 0,
      salesProgress: 0,
    },
    totalTrips: 0,
    totalUsers: 0,
    tripStats: {
      percentageChange: 0,
      progress: 0,
    },
    userStats: {
      percentageChange: 0,
      progress: 0,
    },
    isLoading: true,
    lastUpdated: null,
  });

  const STATUS_LABELS = {
    PENDING: "Đang chờ...",
    IN_PROGRESS: "Đang chạy",
    COMPLETED: "Hoàn thành",
    CANCELLED: "Đã hủy",
  };

  // Helper functions
  const calculatePercentageChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const calculateSalesProgress = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  // Batch vehicle data fetching to avoid resource exhaustion
  const batchFetchVehicleData = async (trips) => {
    const batchSize = 5; // Process 5 vehicles at a time
    const enrichedTrips = [...trips];
    const vehicleCache = {}; // Local vehicle cache to avoid duplicate requests
    
    // Process trips in batches
    for (let i = 0; i < trips.length; i += batchSize) {
      const batchPromises = trips.slice(i, i + batchSize).map(async (trip, idx) => {
        // Skip fetching if we already have this vehicle's data
        if (vehicleCache[trip.vehicleId]) {
          const cachedVehicle = vehicleCache[trip.vehicleId];
          enrichedTrips[i + idx] = {
            ...trip,
            seatCount: cachedVehicle.seatCount,
            availableSeats: cachedVehicle.availableSeats,
          };
          return;
        }
        
        try {
          const vehicleRes = await api.get(`/vehicle/${trip.vehicleId}`);
          // Store in local cache
          vehicleCache[trip.vehicleId] = vehicleRes.data;
          
          enrichedTrips[i + idx] = {
            ...trip,
            seatCount: vehicleRes.data.seatCount,
            availableSeats: vehicleRes.data.availableSeats,
          };
        } catch (error) {
          // Graceful error handling
          enrichedTrips[i + idx] = {
            ...trip,
            seatCount: "/",
            availableSeats: "/",
          };
        }
      });
      
      // Wait for current batch to complete before moving to next batch
      await Promise.all(batchPromises);
      
      // Small delay between batches to prevent resource exhaustion
      if (i + batchSize < trips.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return enrichedTrips;
  };

  // Main data fetching function
  const fetchDashboardData = useCallback(async (forceRefresh = false) => {
    // Check if we have valid cached data
    if (!forceRefresh && dashboardCache.isValid()) {
      setDashboardState(prevState => ({
        ...dashboardCache.data,
        isLoading: false,
        lastUpdated: dashboardCache.timestamp
      }));
      return;
    }
    
    setDashboardState(prevState => ({ ...prevState, isLoading: true }));
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setDashboardState(prevState => ({ ...prevState, isLoading: false }));
        return;
      }
      
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      
      // First, fetch core data in parallel
      const [tripResponse, paymentResponse, userResponse] = await Promise.all([
        api.get("/trip/all"),
        api.get("/payments/all"),
        api.get("/user/total")
      ]);
      
      // Process trips
      const tripData = tripResponse.data;
      // Batch process vehicle data to avoid resource exhaustion
      const enrichedTrips = await batchFetchVehicleData(tripData);
      
      // Process trip stats
      const currentWeekTrips = enrichedTrips.filter(
        trip => new Date(trip.createdAt) >= oneWeekAgo
      );
      const previousWeekTrips = enrichedTrips.filter(
        trip => new Date(trip.createdAt) >= twoWeeksAgo && new Date(trip.createdAt) < oneWeekAgo
      );
      
      const currentTripCount = currentWeekTrips.length;
      const previousTripCount = previousWeekTrips.length;
      const tripTarget = 100; // Quarterly target
      
      const tripStats = {
        percentageChange: calculatePercentageChange(currentTripCount, previousTripCount).toFixed(1),
        progress: calculateSalesProgress(currentTripCount, tripTarget).toFixed(1),
      };
      
      // Process payment data
      const paymentData = paymentResponse.data;
      
      const currentWeekPayments = paymentData.filter(
        payment => new Date(payment.createdAt) >= oneWeekAgo
      );
      const previousWeekPayments = paymentData.filter(
        payment => new Date(payment.createdAt) >= twoWeeksAgo && new Date(payment.createdAt) < oneWeekAgo
      );
      
      const currentTotalTickets = currentWeekPayments.filter(
        payment => payment.paymentStatus === "completed"
      ).length;
      const currentTotalRevenue = currentWeekPayments
        .filter(payment => payment.paymentStatus === "completed")
        .reduce((sum, payment) => sum + payment.amount, 0);
      
      const previousTotalTickets = previousWeekPayments.filter(
        payment => payment.paymentStatus === "completed"
      ).length;
      
      const ticketTarget = 1000; // Monthly target
      
      const revenue = {
        total: currentTotalRevenue,
        totalTickets: currentTotalTickets,
        percentageChange: calculatePercentageChange(currentTotalTickets, previousTotalTickets).toFixed(1),
        salesProgress: calculateSalesProgress(currentTotalTickets, ticketTarget).toFixed(1),
      };
      
      // Process user data
      const userData = userResponse.data;
      const currentTotalUsers = userData.totalUsers;
      
      const previousUsers = localStorage.getItem("previousTotalUsers")
        ? parseInt(localStorage.getItem("previousTotalUsers"))
        : currentTotalUsers * 0.9; // Fallback
      
      const userTarget = 500; // Annual target
      
      const userStats = {
        percentageChange: calculatePercentageChange(currentTotalUsers, previousUsers).toFixed(1),
        progress: calculateSalesProgress(currentTotalUsers, userTarget).toFixed(1),
      };
      
      // Store current user count for next period
      localStorage.setItem("previousTotalUsers", currentTotalUsers);
      
      // Update state with all the processed data
      const newDashboardData = {
        trips: enrichedTrips,
        revenue,
        totalTrips: currentTripCount,
        totalUsers: currentTotalUsers,
        tripStats,
        userStats,
        isLoading: false,
        lastUpdated: new Date()
      };
      
      // Update state and cache
      setDashboardState(newDashboardData);
      dashboardCache.set(newDashboardData);
      
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setDashboardState(prevState => ({ 
        ...prevState, 
        isLoading: false 
      }));
    }
  }, []);
  
  // Update trip status with optimized approach
  const updateTripStatus = async (tripId, newStatus) => {
    try {
      await api.put(`/trip/${tripId}`, { status: newStatus });
      
      // Optimistic UI update - update just the trip in our local state
      setDashboardState(prevState => {
        const updatedTrips = prevState.trips.map(trip => 
          trip.tripId === tripId ? { ...trip, status: newStatus } : trip
        );
        
        // Update cache with new trip data
        dashboardCache.set({
          ...prevState,
          trips: updatedTrips
        });
        
        return {
          ...prevState,
          trips: updatedTrips
        };
      });
      
      alert(`Cập nhật trạng thái thành công: ${STATUS_LABELS[newStatus] || newStatus}`);
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái:", err);
      alert("Cập nhật thất bại. Vui lòng thử lại.");
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
    
    // Cleanup function
    return () => {
      // No need to clear cache when component unmounts
      // We want to preserve it for returning to this page
    };
  }, [fetchDashboardData]);

  // Prepare chart data
  const { revenue, totalTrips, totalUsers, isLoading, trips } = dashboardState;
  
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold uppercase text-neutral-950">
          Bảng điều khiển
        </h2>
        <div className="flex items-center gap-3">
          {dashboardState.lastUpdated && !isLoading && (
            <span className="text-sm text-gray-500">
              Cập nhật lần cuối: {new Date(dashboardState.lastUpdated).toLocaleTimeString()}
            </span>
          )}
          {isLoading ? (
            <div className="text-blue-500">Đang tải dữ liệu...</div>
          ) : (
            <Button 
              onClick={() => fetchDashboardData(true)} 
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              Làm mới dữ liệu
            </Button>
          )}
        </div>
      </div>

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
                      dashboardState.tripStats.percentageChange >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }
                  >
                    {dashboardState.tripStats.percentageChange >= 0 ? "+" : ""}
                    {dashboardState.tripStats.percentageChange}%
                  </span>{" "}
                  so với tuần trước
                </div>
                <div className="mt-2">
                  <Progress
                    value={dashboardState.tripStats.progress}
                    className="h-1 bg-gray-800"
                    indicatorClassName="bg-blue-500"
                  />
                  <div className="text-xs text-gray-400 mt-1">
                    <span className="text-sky-500">{dashboardState.tripStats.progress}%</span>{" "}
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
                      dashboardState.userStats.percentageChange >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }
                  >
                    {dashboardState.userStats.percentageChange >= 0 ? "+" : ""}
                    {dashboardState.userStats.percentageChange}%
                  </span>{" "}
                  so với tháng trước
                </div>
                <div className="mt-2">
                  <Progress
                    value={dashboardState.userStats.progress}
                    className="h-1 bg-gray-800"
                    indicatorClassName="bg-purple-500"
                  />
                  <div className="text-xs text-gray-400 mt-1">
                    <span className="text-sky-500">{dashboardState.userStats.progress}%</span>{" "}
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
              {isLoading ? (
                <div className="text-center py-4">Đang tải dữ liệu chuyến xe...</div>
              ) : trips.length === 0 ? (
                <div className="text-center py-4">Không có chuyến xe nào</div>
              ) : (
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
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;