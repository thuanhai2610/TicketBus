import React, { useState, useEffect } from 'react';
import TopLayout from '../../layout/toppage/TopLayout';
import RootLayout from '../../layout/RootLayout';
import Search from '../home/hero/search/Search';
import Filter from './filter/Filter';
import SearchResult from './searchresult/SearchResult';
import bgImage from '../../assets/bgimg.png';
import { useLocation } from 'react-router-dom'; // Import useLocation
import { format } from 'date-fns';

const Ticket = () => {
  const [trips, setTrips] = useState([]);
  const location = useLocation(); // Hook để đọc query parameters

  // Hàm gọi API để tìm kiếm chuyến xe
  const fetchTrips = async (from, to, date) => {
    try {
      const response = await fetch(
        `http://localhost:3001/trip/search?departurePoint=${encodeURIComponent(from)}&destinationPoint=${encodeURIComponent(to)}&date=${date}`
      );
      if (!response.ok) throw new Error("Không thể tìm kiếm chuyến xe, vui lòng thử lại");
      const data = await response.json();
      setTrips(data);
    } catch (error) {
      console.error("Error fetching trips:", error);
      setTrips([]);
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
    }
  }, [location.search]); // Gọi lại khi query parameters thay đổi

  return (
    <div className='w-full space-y-12 pb-16'>
      {/* Top Layout */}
      <TopLayout 
        bgImg={bgImage}
        title={'Reserve your ticket'}   
      />
      
      <RootLayout className="space-y-8 relative z-0">
        {/* Search section */}
        <Search onSearchResults={setTrips} />

        {/* Searched bus tickets */}
        <div className="w-full h-auto grid grid-cols-4 gap-12 relative">
          {/* Filter Section */}
          <div className="col-span-1">
            <Filter />
          </div>
          
          {/* Search Tickets */}
          <div className="col-span-3">
            <SearchResult trips={trips} />
          </div>
        </div>
      </RootLayout>
    </div>
  );
};

export default Ticket;