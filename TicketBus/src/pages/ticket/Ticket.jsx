import React, { useState, useEffect } from 'react';
import TopLayout from '../../layout/toppage/TopLayout';
import RootLayout from '../../layout/RootLayout';
import Search from '../home/hero/search/Search';
import Filter from './filter/Filter';
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
  
  // Hàm gọi API để tìm kiếm chuyến xe
  const fetchTrips = async (from, to, date) => {
    try {
      const response = await fetch(
        `http://localhost:3001/trip/search?departurePoint=${encodeURIComponent(from)}&destinationPoint=${encodeURIComponent(to)}&date=${date}`
      );
      if (!response.ok) throw new Error("Không thể tìm kiếm chuyến xe, vui lòng thử lại");
      const data = await response.json();
      setTrips(data);
      console.log("API response data:", data);
      
      // Show the map when we have data
      setShowMap(data && data.length > 0);
      
      // Ngay sau khi nhận được data, cập nhật bản đồ
      if (data && data.length > 0) {
        // Give a small delay to ensure the map container is visible before initializing
        setTimeout(() => updateMap(data), 100);
      }
    } catch (error) {
      console.error("Error fetching trips:", error);
      setTrips([]);
      setShowMap(false);
    }
  };

  // Hàm cập nhật bản đồ với dữ liệu mới
  const updateMap = (tripData) => {
    if (!mapRef.current) return;
    
    // Khởi tạo bản đồ nếu chưa có
    if (!leafletMapRef.current) {
      leafletMapRef.current = L.map(mapRef.current,  {
        doubleClickZoom: false,  // không cho zoom bằng double click
        boxZoom: false,          // không cho zoom bằng kéo hộp
        keyboard: false,         // không cho điều khiển bằng bàn phím
        tap: false               // không cho chạm trên mobile
      }).setView([16.0544, 108.2022], 4);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(leafletMapRef.current);
    } else {
      // If map already exists, invalidate size to handle any container resizing
      leafletMapRef.current.invalidateSize();
    }
    
    // Xóa routing cũ nếu có
    if (leafletMapRef.current._routing) {
      leafletMapRef.current.removeControl(leafletMapRef.current._routing);
    }
    
    // Chỉ thêm routing nếu có dữ liệu hợp lệ
    if (tripData && tripData.length > 0) {
      const trip = tripData[0]; // Lấy chuyến đầu tiên
      
      console.log("Setting up routing with coords:", trip);
      
      // Kiểm tra xem có đủ thông tin tọa độ không
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
      // If no search parameters, make sure map is hidden
      setShowMap(false);
    }
  }, [location.search]); // Gọi lại khi query parameters thay đổi
  
  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      if (leafletMapRef.current) {
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
        <div className="w-full h-auto grid grid-cols-4 gap-12 relative">
          {/* Filter Section */}
          <div className="col-span-1">
            
          </div>
          
          {/* Search Tickets */}
          <div className="col-span-3">
            <SearchResult trips={trips} />
          </div>
        </div>
        
        {/* Map section - only show when there are search results */}
        {showMap && (
          <div className="w-full">
            <h3 className="text-xl font-semibold mb-4">Route Map</h3>
            <div style={{ height: '750px', width: '100%' }} ref={mapRef} />
          </div>
        )}
      </RootLayout>
    </div>
  );
};

export default Ticket;