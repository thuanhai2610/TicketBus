/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import TopLayout from '../../layout/toppage/TopLayout';
import RootLayout from '../../layout/RootLayout';
import Search from '../home/hero/search/Search';
import { motion } from 'framer-motion';
import SearchResult from './searchresult/SearchResult';
import bgImage from '../../assets/bgimg.png';
import { data, useLocation } from 'react-router-dom';
import L from 'leaflet';
import { useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';

const Ticket = () => {
  const [trips, setTrips] = useState([]);
  const [showMap, setShowMap] = useState(false); // State to control map visibility
  const location = useLocation(); // Hook để đọc query parameters
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);

  const fetchTrips = async (from, to, date) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/trip/search?departurePoint=${encodeURIComponent(from)}&destinationPoint=${encodeURIComponent(to)}&date=${date}`
      );
      if (!response.ok) throw new Error("Không thể tìm kiếm chuyến xe, vui lòng thử lại");
      const data = await response.json();
      setTrips(data);
      setShowMap(data && data.length > 0);
      if (data && data.length > 0) {
        setTimeout(() => updateMap(data), 100);
      }
    } catch (error) {
      console.error("Error fetching trips:", error);
      setTrips([]);
      setShowMap(false);
    }
  };

  const updateMap = (tripData) => {
    if (!mapRef.current) return;

    // Khởi tạo bản đồ nếu chưa có
    if (!leafletMapRef.current) {
      leafletMapRef.current = L.map(mapRef.current, {
        doubleClickZoom: false,  
        boxZoom: false,        
        keyboard: false,        
        tap: false              
      }).setView([16.0544, 108.2022], 4);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(leafletMapRef.current);
    } else {
      leafletMapRef.current.invalidateSize();
    }

    // Xóa routing cũ nếu có
    if (leafletMapRef.current._routing) {
      leafletMapRef.current.removeControl(leafletMapRef.current._routing);
    }

    if (tripData && tripData.length > 0) {
      const trip = tripData[0]; // Lấy chuyến đầu tiên
      if (trip && trip.departureLatitude && trip.departureLongtitude &&
        trip.destinationLatitude && trip.destinationLongtitude) {

        const routingControl = L.Routing.control({
          waypoints: [
            L.latLng(trip.departureLatitude, trip.departureLongtitude),
            L.latLng(trip.destinationLatitude, trip.destinationLongtitude),
          ],
          lineOptions: {
            styles: [{ color: 'blue', weight: 3 }],
          },
          routeWhileDragging: false,
          show: false,
          addWaypoints: false,
        }).addTo(leafletMapRef.current);

        // Lưu lại để có thể xóa sau này
        leafletMapRef.current._routing = routingControl;
      } else {
        console.warn("Trip data missing required coordinate information:", trip);
      }
    }
  };

  // Đọc query parameters và gọi API khi trang được tải
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const departurePoint = searchParams.get('departurePoint');
    const destinationPoint = searchParams.get('destinationPoint');
    const date = searchParams.get('date');

    if (departurePoint && destinationPoint && date) {
      fetchTrips(departurePoint, destinationPoint, date);
    } else {
      setShowMap(false);
    }
  }, [location.search]); 


  useEffect(() => {
    return () => {
      if (leafletMapRef.current) {
        if (leafletMapRef.current._routing) {
          leafletMapRef.current.removeControl(leafletMapRef.current._routing);
          leafletMapRef.current._routing = null;
        }
  
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);
  

  // Handle custom search from Search component
  const handleSearch = (results) => {
    setTrips(results);
    setShowMap(results && results.length > 0);

    if (results && results.length > 0) {
      // Small delay to ensure the map container is visible
      setTimeout(() => updateMap(results), 100);
    }
  };

  return (
    <div className='w-full space-y-12 pb-16'>
      {/* Top Layout */}
      <TopLayout
        bgImg={bgImage}
        title={'Reserve your ticket'}
      />

      <RootLayout className="space-y-8 relative z-0">
        {/* Search section */}
        <Search onSearchResults={handleSearch} />

        {/* Searched bus tickets */}
        <div className="w-full flex flex-row gap-4 px-4">
          {/* Map section */}
          {trips.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: -150 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ duration: 1, ease: 'easeInOut' }}
              className="w-1/3"
            >
              <h3 className="text-xl font-semibold mb-3 text-center">Bản Đồ Tuyến Đường</h3>
              <div
                ref={mapRef}
                className="w-full rounded-lg shadow-md"
                style={{ height: '750px' }}
              />
            </motion.div>
          )}

          {/* Ticket section */}
          <div className={`transition-all duration-500 ${trips.length > 0 ? 'w-2/3' : 'w-full'}`}>
            <SearchResult trips={trips} />
          </div>
        </div>


      </RootLayout>
    </div>
  );
};

export default Ticket;