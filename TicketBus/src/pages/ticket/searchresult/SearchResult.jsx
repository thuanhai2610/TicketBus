/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import TicketCard from '../../../components/ticket/TicketCard';
import { FaBus } from 'react-icons/fa';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SearchResult = ({ trips }) => { // Nhận prop trips từ Ticket
  const navigate = useNavigate();
  const tripListRef = useRef(null);

  const [vehicles, setVehicles] = useState({});
  const [tripsLoading, setTripsLoading] = useState(false);
  const [tripsError, setTripsError] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 4;

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const fetchVehicles = async (vehicleIds) => {
    try {
      const uniqueVehicleIds = [...new Set(vehicleIds)];
      const vehicleData = {};

      for (const vehicleId of uniqueVehicleIds) {
        try {
          const response = await axios.get(`http://localhost:3001/vehicle/${vehicleId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          if (response.data) {
            vehicleData[vehicleId] = response.data;
          }
        } catch (err) {
          console.error(`Error fetching vehicle ${vehicleId}:`, err);
        }
      }

      setVehicles(prev => ({ ...prev, ...vehicleData }));
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    }
  };

  useEffect(() => {
    if (trips.length > 0) {
      setTripsLoading(true);
      const vehicleIds = trips.map(trip => trip.vehicleId).filter(Boolean);
      if (vehicleIds.length > 0) {
        fetchVehicles(vehicleIds);
      }
      setTripsLoading(false);
    }
  }, [trips]); // Gọi fetchVehicles khi trips thay đổi

  const getAvailableSeats = (trip) => {
    const vehicle = vehicles[trip.vehicleId];
    return vehicle?.availableSeats ?? 'N/A';
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return "Contact for price";
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleBusClick = (vehicleId) => {
    if (vehicleId?.trim()) {
      navigate(`/bus-tickets/detail/${vehicleId}`);
    }
  };

  const start = (page - 1) * limit;
  const currentTrips = trips.slice(start, start + limit); // Sử dụng trips từ props
  const totalPages = Math.ceil(trips.length / limit);

  const handlePageChange = (pageNum) => {
    setPage(pageNum);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: -150 }}
      exit={{ opacity: 0, y: 100 }}
      transition={{ duration: 1, ease: 'easeInOut' }}
      className="w-full col-span-3 space-y-8 pt-6"
    >
      {tripsLoading ? (
        <Box display="flex" justifyContent="center" my={2}>
          <CircularProgress />
        </Box>
      ) : tripsError ? (
        <Typography color="error">{tripsError}</Typography>
      ) : currentTrips.length > 0 ? (
        <div ref={tripListRef} className="space-y-4">
          {currentTrips.map((trip, index) => (
            <TicketCard
              key={trip._id || index}
              icon={FaBus}
              busName={`Bus ${trip.vehicleId || 'Unknown'}`}
              routeFrom={trip.departurePoint || 'Unknown'}
              routeTo={trip.destinationPoint || 'Unknown'}
              departureTime={trip.departureTime ? formatTime(trip.departureTime) : 'TBD'}
              arrivalTime={trip.arrivalTime ? formatTime(trip.arrivalTime) : 'TBD'}
              price={formatPrice(trip.price)}
              departureLatitude={trip.departureLatitude}
              departureLongtitude={trip.departureLongtitude}
              destinationLatitude={trip.destinationLatitude}
              destinationLongtitude={trip.destinationLongtitude}
              availableSeats={getAvailableSeats(trip)}
              onBusClick={() => handleBusClick(trip.vehicleId)}
              tripData={trip}
              vehicleId={trip.vehicleId}
            />
          ))}
        </div>
      ) : (
        <Typography></Typography>
      )}

      {totalPages > 1 && (
        <div className="w-full flex items-center justify-center gap-2 mt-4 flex-wrap">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => handlePageChange(pageNum)}
              className={`px-4 py-2 rounded-lg border ${page === pageNum
                ? 'bg-primary text-white'
                : 'bg-white text-primary border-primary'
                } hover:bg-primary hover:text-white transition duration-200`}
            >
              {pageNum}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default SearchResult;