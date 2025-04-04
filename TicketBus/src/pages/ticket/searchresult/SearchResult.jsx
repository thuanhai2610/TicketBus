/* eslint-disable no-unused-vars */
import React from 'react';
import { motion } from 'framer-motion';
import TicketCard from '../../../components/ticket/TicketCard';
import { FaBus } from 'react-icons/fa';

const SearchResult = () => {
    const tickets = [
        { busName: "NhismdKhoaHaiz", routeFrom: "Nha Trang", routeTo: "Da Nang", arrivalTime: "09:05 PM", departureTime: "04:10 AM", price: "2025", availableSeats: "10" },
        { busName: "Express Bus", routeFrom: "Ho Chi Minh", routeTo: "Hanoi", arrivalTime: "08:30 AM", departureTime: "10:45 PM", price: "1500", availableSeats: "5" },
        { busName: "Travel Pro", routeFrom: "Hue", routeTo: "Quang Ngai", arrivalTime: "06:00 PM", departureTime: "11:15 PM", price: "1200", availableSeats: "8" },
        { busName: "Night Express", routeFrom: "Da Nang", routeTo: "Ho Chi Minh", arrivalTime: "10:00 PM", departureTime: "05:30 AM", price: "1800", availableSeats: "7" },
        { busName: "FastGo", routeFrom: "Vinh", routeTo: "Hanoi", arrivalTime: "02:00 PM", departureTime: "06:45 PM", price: "900", availableSeats: "12" },
        { busName: "GreenLine", routeFrom: "Can Tho", routeTo: "Ho Chi Minh", arrivalTime: "05:30 AM", departureTime: "11:45 AM", price: "1100", availableSeats: "15" },
        { busName: "SuperBus", routeFrom: "Hanoi", routeTo: "Hai Phong", arrivalTime: "07:00 AM", departureTime: "08:45 AM", price: "700", availableSeats: "20" },
        { busName: "MegaTransport", routeFrom: "Da Lat", routeTo: "Nha Trang", arrivalTime: "09:15 AM", departureTime: "12:30 PM", price: "950", availableSeats: "18" },
        { busName: "Speedy", routeFrom: "Phan Thiet", routeTo: "Ho Chi Minh", arrivalTime: "03:30 PM", departureTime: "06:50 PM", price: "850", availableSeats: "10" },
        { busName: "Royal Coach", routeFrom: "Buon Ma Thuot", routeTo: "Nha Trang", arrivalTime: "08:45 PM", departureTime: "12:20 AM", price: "1300", availableSeats: "6" }
    ];

    return (
        <motion.div 
            initial={{ opacity: 0, y: 100 }} 
            animate={{ opacity: 1, y: -200 }} 
            exit={{ opacity: 0, y: 100 }} 
            transition={{ duration: 1, ease: "easeInOut" }}
            className='w-full col-span-3 space-y-8 pt-6'
        >
            <div className="space-y-4">
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
        </motion.div>
    );
};

export default SearchResult;