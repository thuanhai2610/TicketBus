/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TbArrowsExchange } from "react-icons/tb";
import { FaBus, FaMapMarkerAlt, FaSearch, FaTicketAlt, FaWallet } from "react-icons/fa";
import { BsCalendar2Date } from "react-icons/bs";
import { FaMapMarkedAlt } from "react-icons/fa";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

const fetchProvinces = async () => {
    try {
        const response = await fetch("https://provinces.open-api.vn/api/?depth=1");
        const data = await response.json();
        return data.map((province) => province.name);
    } catch (error) {
        console.error("Error fetching provinces:", error);
        return [];
    }
};

const Search = () => {
    const [provinces, setProvinces] = useState([]);
    const [date, setDate] = useState(new Date());
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [showFromSuggestions, setShowFromSuggestions] = useState(false);
    const [showToSuggestions, setShowToSuggestions] = useState(false);

    useEffect(() => {
        fetchProvinces().then(setProvinces);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 800 }}
            animate={{ opacity: 1, y: -200 }}
            exit={{ opacity: 0, y: 800 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="w-[65%] bg-white shadow-md rounded-lg p-5 flex flex-col items-center justify-center h-80 mx-auto"
        >
            <div className="flex items-center gap-8 justify-between relative">
                <div className="flex flex-1 gap-4 relative">
                    <div className="flex-1 border border-gray-300 bg-white text-gray-700 px-4 py-3 rounded-lg flex items-center relative">
                        <FaMapMarkerAlt className="text-gray-400 mr-2" />
                        <input
                            type="text"
                            placeholder="Điểm đi"
                            className="flex-1 bg-transparent focus:outline-none"
                            value={from}
                            onChange={(e) => {
                                setFrom(e.target.value);
                                setShowFromSuggestions(e.target.value.length > 0);
                            }}
                            onFocus={() => setShowFromSuggestions(from.length > 0)}
                            onBlur={() => setTimeout(() => setShowFromSuggestions(false), 200)}
                        />
                    </div>

                    <div className="flex-1 border border-gray-300 bg-white text-gray-700 px-4 py-3 rounded-lg flex items-center relative">
                        <FaMapMarkerAlt className="text-gray-400 mr-2" />
                        <input
                            type="text"
                            placeholder="Điểm đến"
                            className="flex-1 bg-transparent focus:outline-none"
                            value={to}
                            onChange={(e) => {
                                setTo(e.target.value);
                                setShowToSuggestions(e.target.value.length > 0);
                            }}
                            onFocus={() => setShowToSuggestions(to.length > 0)}
                            onBlur={() => setTimeout(() => setShowToSuggestions(false), 200)}
                        />
                    </div>

                    <button className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary p-2 rounded-full shadow-md z-10">
                        <TbArrowsExchange className="text-white w-5 h-5" />
                    </button>
                </div>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="flex h-12 w-56 items-center border border-gray-300 bg-white text-gray-700 px-4 py-3 rounded-lg relative">
                            <BsCalendar2Date className="text-gray-400 mr-2" />
                            {date ? format(date, "PPP") : "Chọn ngày"}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        align="start"
                        side="top"
                        className="absolute z-50 w-auto left-0 top-12 bg-white shadow-md rounded-lg p-2 min-h-[300px] h-auto"
                    >
                        <Calendar mode="single" selected={date} onSelect={setDate} />
                    </PopoverContent>



                </Popover>

                <button className="bg-primary hover:bg-primary text-white px-6 py-3 rounded-lg flex items-center gap-2 font-semibold shadow-md">
                    <FaSearch /> Tìm chuyến
                </button>
            </div>

            {/* Hướng dẫn đặt xe */}
            <div className='mt-6 text-center'>
                <h2 className='text-lg font-semibold text-gray-800'>DỄ DÀNG ĐẶT XE TRÊN WEBSITE</h2>
                <div className='flex justify-center items-center gap-6 mt-4'>
                    {[FaMapMarkedAlt, FaBus, FaTicketAlt, FaWallet].map((Icon, index) => (
                        <div key={index} className='flex flex-col items-center text-center'>
                            <div className='w-14 h-14 border-2 border-dashed border-primary rounded-full flex items-center justify-center'>
                                <Icon className='text-primary text-3xl' />
                            </div>
                            <p className='mt-2 text-2xl text-gray-600 w-54'>
                                {["Chọn thông tin hành trình và ấn Tìm chuyến", "Chọn chuyến, chỗ ngồi phù hợp và điền thông tin", "Giữ chỗ và nhận mã", "Thanh toán và lên xe"][index]}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default Search;