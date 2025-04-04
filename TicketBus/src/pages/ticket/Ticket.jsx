import React from 'react';
import TopLayout from '../../layout/toppage/TopLayout';
import RootLayout from '../../layout/RootLayout';
import Search from '../home/hero/search/Search';
import Filter from './filter/Filter';
import SearchResult from './searchresult/SearchResult';
import bgImage from '../../assets/bgimg.png';

const Ticket = () => {
  return (
    <div className='w-full space-y-12 pb-16'>
      {/* Top Layout */}
      <TopLayout 
        bgImg={bgImage}
        title={'Reserve your ticket'}   
      />
      
      <RootLayout className="space-y-8 relative z-0">
        {/* Search section */}
        <Search />

        {/* Searched bus tickets */}
        <div className="w-full h-auto grid grid-cols-4 gap-12 relative">
          {/* Filter Section */}
          <div className="col-span-1">
            <Filter />
          </div>
          
          {/* Search Tickets */}
          <div className="col-span-3">
            <SearchResult />
          </div>
        </div>
      </RootLayout>
    </div>
  );
};

export default Ticket;