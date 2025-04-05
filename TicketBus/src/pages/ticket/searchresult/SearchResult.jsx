/* eslint-disable no-unused-vars */
import React from 'react';
import { motion } from 'framer-motion';
import TicketCard from '../../../components/ticket/TicketCard';
import { FaBus } from 'react-icons/fa';
import {GrRefresh} from "react-icons/gr"

const SearchResult = () => {
    const tickets = [
        { busName: "NhismdKhoaHaiz", routeFrom: "Nha Trang", routeTo: "Da Nang", arrivalTime: "09:05 PM", departureTime: "04:10 AM", price: "2025", availableSeats: "10" },
        { busName: "Express Bus", routeFrom: "Ho Chi Minh", routeTo: "Hanoi", arrivalTime: "08:30 AM", departureTime: "10:45 PM", price: "1500", availableSeats: "5" },
       
       
    ];

    return (
        <motion.div 
            initial={{ opacity: 0, y: 100 }} 
            animate={{ opacity: 1, y: -200 }} 
            exit={{ opacity: 0, y: 100 }} 
            transition={{ duration: 1, ease: "easeInOut" }}
            className='w-full col-span-3 space-y-8 pt-6'
        >
            <div className="space-y-4 ">
                {tickets.map((ticket, index) => (
                    <TicketCard 
                        key={index}
                        icon={FaBus}
                        busName={ticket.busName}
                        routeFrom={ticket.routeFrom}
                        routeTo={ticket.routeTo}
                        arrivalTime={ticket.arrivalTime}
                        departureTime={ticket.departureTime}
                        price={ticket.price}
                        availableSeats={ticket.availableSeats}
                    />
                ))}
            </div>

            <div className="w-full flex items-center justify-center">
            <button  className="w-fit px-5 py-1.5 bg-primary hover:bg-transparent border-2  border-primary hover:border-primary rounded-xl text-base font-normal text-neutral-50 flex items-center justify-center gap-x-2 hover:text-primary ease-in-out duration-300">
                   <GrRefresh />
                   Load More
                </button>
            </div>
        </motion.div>
    );
};

export default SearchResult;