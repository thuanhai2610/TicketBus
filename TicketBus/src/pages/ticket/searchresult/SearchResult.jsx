/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import TicketCard from "../../../components/ticket/TicketCard";
import { FaBus } from "react-icons/fa";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const SearchResult = ({ trips }) => {
  const navigate = useNavigate();
  const tripListRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const [vehicles, setVehicles] = useState({});
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [notificationModal, setNotificationModal] = useState({
    show: false,
    message: "",
    type: "error",
  });
  const [page, setPage] = useState(1);
  const limit = 6;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const fetchVehicles = async (vehicleIds) => {
    setVehiclesLoading(true);
    try {
      const uniqueVehicleIds = [...new Set(vehicleIds)];
      const vehicleData = {};
      for (const vehicleId of uniqueVehicleIds) {
        try {
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/vehicle/${vehicleId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          if (response.data) vehicleData[vehicleId] = response.data;
        } catch (err) {
          console.error(`Error fetching vehicle ${vehicleId}:`, err);
        }
      }
      setVehicles((prev) => ({ ...prev, ...vehicleData }));
    } catch (error) {
      setNotificationModal({
        show: true,
        message: "Không tải được thông tin xe! Vui lòng thử lại.",
        type: "error",
      });
    } finally {
      setVehiclesLoading(false);
    }
  };

  useEffect(() => {
    if (trips.length > 0) {
      const vehicleIds = trips.map((trip) => trip.vehicleId).filter(Boolean);
      if (vehicleIds.length > 0) fetchVehicles(vehicleIds);
    }
  }, [trips]);

  const getAvailableSeats = (trip) => {
    const vehicle = vehicles[trip.vehicleId];
    return vehicle?.availableSeats ?? "N/A";
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return "Liên hệ";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

  const handleBusClick = (vehicleId) => {
    if (vehicleId?.trim()) navigate(`/bus-tickets/detail/${vehicleId}`);
  };

  const start = (page - 1) * limit;
  const currentTrips = trips.slice(start, start + limit);
  const totalPages = Math.ceil(trips.length / limit);

  const handlePageChange = (pageNum) => {
    setPage(pageNum);
    window.scrollTo({ top: isMobile ? 150 : 300, behavior: "smooth" });
  };

  const NotificationModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-primary rounded-lg shadow-xl p-4 w-11/12 max-w-sm mx-4">
        <h3 className="text-base font-semibold mb-3 text-red-500 dark:text-red-400">Lỗi</h3>
        <p className="text-xs text-gray-600 dark:text-neutral-300 mb-4">{notificationModal.message}</p>
        <div className="flex justify-end">
          <button
            onClick={() => setNotificationModal({ show: false, message: "", type: "error" })}
            className="px-3 py-1 bg-primary hover:bg-primaryblue text-white rounded-lg text-xs"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );

  const DesktopSearchResult = (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: -130 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="w-full space-y-6 pt-6 bg-gray-50 dark:bg-gray-900"
    >
      {vehiclesLoading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="200px"
          sx={{ color: "var(--primary)" }}
        >
          <CircularProgress color="inherit" />
          <Typography variant="body1" ml={2} color="var(--primary)">
            Đang tải thông tin xe...
          </Typography>
        </Box>
      ) : currentTrips.length > 0 ? (
        <div ref={tripListRef} className="space-y-4">
          {currentTrips.map((trip, index) => (
            <TicketCard
              key={trip._id || index}
              icon={FaBus}
              busName={`Xe ${trip.vehicleId || "N/A"}`}
              routeFrom={trip.departurePoint || "N/A"}
              routeTo={trip.destinationPoint || "N/A"}
              departureTime={formatTime(trip.departureTime)}
              arrivalTime={formatTime(trip.arrivalTime)}
              price={formatPrice(trip.price)}
              departureLatitude={trip.departureLatitude}
              departureLongtitude={trip.departureLongtitude}
              destinationLatitude={trip.destinationLatitude}
              destinationLongtitude={trip.destinationLongtitude}
              availableSeats={getAvailableSeats(trip)}
              onBusClick={() => handleBusClick(trip.vehicleId)}
              tripData={trip}
              vehicleId={trip.vehicleId}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-md hover:shadow-lg transition"
            />
          ))}
        </div>
      ) : (
        <Typography variant="body1" color="textSecondary" className="text-center text-gray-600 dark:text-neutral-400">
          Không tìm thấy chuyến xe phù hợp
        </Typography>
      )}
      {totalPages > 1 && (
        <div className="w-full flex items-center justify-center gap-3 mt-6 flex-wrap">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => handlePageChange(pageNum)}
              className={`px-4 py-2 rounded-lg border text-sm font-semibold ${
                page === pageNum
                  ? "bg-primary text-white border-primary"
                  : "bg-white dark:bg-gray-900 text-primary dark:text-neutral-50 border-gray-300 dark:border-gray-700"
              } hover:bg-primary hover:text-white dark:hover:bg-primaryblue dark:hover:text-white transition duration-200`}
            >
              {pageNum}
            </button>
          ))}
        </div>
      )}
      {notificationModal.show && <NotificationModal />}
    </motion.div>
  );

  const MobileSearchResult = (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: -150 }}
      exit={{ opacity: 0, y: 30 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="w-full space-y-2 pt-2 bg-white dark:bg-primary px-2"
    >
      {vehiclesLoading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="80px"
          sx={{ color: "var(--primary)" }}
        >
          <CircularProgress color="inherit" size={16} />
          <Typography variant="caption" ml={1} color="var(--primary)">
            Đang tải...
          </Typography>
        </Box>
      ) : currentTrips.length > 0 ? (
        <div ref={tripListRef} className="space-y-2">
          {currentTrips.map((trip, index) => (
            <div
              key={trip._id || index}
              className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-2 flex justify-between items-center cursor-pointer"
              onClick={() => handleBusClick(trip.vehicleId)}
            >
              <div className="text-xs">
                <p className="font-semibold">{`${trip.departurePoint || "N/A"} → ${trip.destinationPoint || "N/A"}`}</p>
                <p>{formatTime(trip.departureTime)}</p>
              </div>
              <div className="text-xs flex flex-col items-end">
                <p className="font-bold">{formatPrice(trip.price)}</p>
                <button className="mt-1 px-2 py-1 bg-primary text-white text-xs rounded hover:bg-green-600">
                  Đặt vé Ngay
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Typography variant="caption" color="textSecondary" className="text-center text-gray-600 dark:text-neutral-400">
          Không tìm thấy chuyến xe
        </Typography>
      )}
      {totalPages > 1 && (
        <div className="w-full flex items-center justify-center gap-1 mt-2 flex-wrap">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => handlePageChange(pageNum)}
              className={`px-2 py-0.5 rounded-md border text-xs font-medium ${
                page === pageNum
                  ? "bg-primary text-white border-primary"
                  : "bg-white dark:bg-gray-900 text-primary dark:text-neutral-50 border-gray-300 dark:border-gray-700"
              } hover:bg-primary hover:text-white dark:hover:bg-primaryblue dark:hover:text-white transition duration-150`}
            >
              {pageNum}
            </button>
          ))}
        </div>
      )}
      {notificationModal.show && <NotificationModal />}
    </motion.div>
  );

  return isMobile ? MobileSearchResult : DesktopSearchResult;
};

export default SearchResult;