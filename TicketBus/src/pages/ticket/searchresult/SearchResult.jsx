/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import TicketCard from '../../../components/ticket/TicketCard';
import { FaBus } from 'react-icons/fa';
import { GrRefresh } from 'react-icons/gr';
import { Box, CircularProgress, Typography } from '@mui/material';
import axios from 'axios';

const SearchResult = () => {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState({});
  const [tripsLoading, setTripsLoading] = useState(false);
  const [tripsError, setTripsError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10; // Number of trips per page

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const fetchVehicles = async (vehicleIds) => {
    try {
      // Remove duplicates from vehicleIds
      const uniqueVehicleIds = [...new Set(vehicleIds)];
      
      // Fetch all vehicles in a single request if possible, or individually if needed
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
      
      setVehicles(prevVehicles => ({...prevVehicles, ...vehicleData}));
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    }
  };

  const fetchTrips = async (pageNum) => {
    setTripsLoading(true);
    try {
      const response = await axios.get('http://localhost:3001/trip/all', {
        params: { page: pageNum, limit },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      // Handle the case where response.data is an array directly
      const newTrips = Array.isArray(response.data) ? response.data : response.data?.trips || [];
      
      setTrips((prevTrips) => (pageNum === 1 ? newTrips : [...prevTrips, ...newTrips]));
      setHasMore(newTrips.length === limit); // If we get fewer trips than the limit, there are no more to load
      
      // Extract vehicleIds to fetch vehicle data
      const vehicleIds = newTrips.map(trip => trip.vehicleId).filter(Boolean);
      if (vehicleIds.length > 0) {
        fetchVehicles(vehicleIds);
      }
    } catch (error) {
      console.error("Error fetching trips:", error);
      setTripsError(error.response?.data?.message || 'Failed to fetch trips');
      setTrips([]); // Reset trips to empty array on error
    } finally {
      setTripsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips(1); // Fetch the first page on mount
  }, []); // Empty dependency array means this runs once on mount

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchTrips(nextPage);
  };

  const getAvailableSeats = (trip) => {
    if (!trip || !trip.vehicleId) return 'N/A';
    
    const vehicle = vehicles[trip.vehicleId];
    if (vehicle && vehicle.availableSeats !== undefined) {
      return vehicle.availableSeats;
    }
    
    return `N/A (Vehicle ID: ${trip.vehicleId || 'Unknown'})`;
  };

  // Format price with currency
  const formatPrice = (price) => {
    if (!price && price !== 0) return "Contact for price";
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: -200 }}
      exit={{ opacity: 0, y: 100 }}
      transition={{ duration: 1, ease: 'easeInOut' }}
      className="w-full col-span-3 space-y-8 pt-6"
    >
      {tripsLoading && page === 1 ? ( 
        <Box display="flex" justifyContent="center" my={2}>
          <CircularProgress />
        </Box>
      ) : tripsError ? (
        <Typography color="error" variant="body1">
          {tripsError}
        </Typography>
      ) : trips && trips.length > 0 ? ( 
        <div className="space-y-4">
          {trips.map((trip, index) => (
            <TicketCard
              key={trip._id || trip.tripId || index} 
              icon={FaBus}
              busName={`Bus ${trip.vehicleId || 'Unknown'}`}
              routeFrom={trip.departurePoint || 'Unknown'}
              routeTo={trip.destinationPoint || 'Unknown'}
              departureTime={trip.departureTime ? formatTime(trip.departureTime) : 'TBD'}
              arrivalTime={trip.arrivalTime ? formatTime(trip.arrivalTime) : 'TBD'}
              price={formatPrice(trip.price)}
              availableSeats={getAvailableSeats(trip)}
              tripData={trip}
            />
          ))}
        </div>
      ) : (
        <Typography variant="body1">No trips available</Typography>
      )}

      {trips && trips.length > 0 && hasMore && (
        <div className="w-full flex items-center justify-center">
          <button
            onClick={handleLoadMore}
            disabled={tripsLoading}
            className="w-fit px-5 py-1.5 bg-primary hover:bg-transparent border-2 border-primary hover:border-primary rounded-xl text-base font-normal text-neutral-50 flex items-center justify-center gap-x-2 hover:text-primary ease-in-out duration-300"
          >
            {tripsLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <>
                <GrRefresh />
                Load More
              </>
            )}
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default SearchResult;