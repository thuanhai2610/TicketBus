/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { motion } from "framer-motion";
import { TbArrowsExchange } from "react-icons/tb";
import { FaBus, FaMapMarkerAlt, FaSearch, FaTicketAlt, FaWallet } from "react-icons/fa";
import { BsCalendar2Date } from "react-icons/bs";
import { FaMapMarkedAlt } from "react-icons/fa";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const Search = () => {
  const [date, setDate] = useState(new Date());
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Hook để chuyển hướng

  const handleSearch = () => {
    // Kiểm tra nếu không nhập điểm đi hoặc điểm đến
    if (!from || !to) {
      setError("Vui lòng nhập điểm đi và điểm đến");
      return;
    }

    // Chuyển hướng sang /bus-tickets với query parameters
    navigate(
      `/bus-tickets?departurePoint=${encodeURIComponent(from)}&destinationPoint=${encodeURIComponent(to)}&date=${format(date, "yyyy-MM-dd")}`
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 800 }}
      animate={{ opacity: 1, y: -200 }}
      exit={{ opacity: 0, y: 800 }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
      className="w-full max-w-6xl mx-auto bg-white shadow-md rounded-lg p-5 flex flex-col items-center justify-center space-y-6"
    >
      <div className="flex flex-col lg:flex-row items-stretch gap-4 w-full">
        <div className="flex flex-col sm:flex-row flex-1 gap-4 relative">
          <div className="flex-1 border border-gray-300 bg-white text-gray-700 px-4 py-3 rounded-lg flex items-center">
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

          <div className="flex-1 border border-gray-300 bg-white text-gray-700 px-4 py-3 rounded-lg flex items-center">
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

          <button
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary p-2 rounded-full shadow-md z-10"
            onClick={() => {
              const temp = from;
              setFrom(to);
              setTo(temp);
            }}
          >
            <TbArrowsExchange className="text-white w-5 h-5" />
          </button>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="h-12 w-full sm:w-56 border border-gray-300 bg-white text-gray-700 px-4 py-3 rounded-lg flex items-center"
            >
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

        <button
          className="bg-primary hover:bg-primary text-white px-6 py-3 rounded-lg flex items-center gap-2 font-semibold shadow-md whitespace-nowrap"
          onClick={handleSearch}
        >
          <FaSearch /> Tìm chuyến
        </button>
      </div>

      {error && (
        <div className="text-red-500 mt-2">
          {error}
        </div>
      )}

      <div className="mt-6 text-center w-full">
        <h2 className="text-lg font-semibold text-gray-800">DỄ DÀNG ĐẶT XE TRÊN WEBSITE</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-4">
          {[FaMapMarkedAlt, FaBus, FaTicketAlt, FaWallet].map((Icon, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="w-14 h-14 border-2 border-dashed border-primary rounded-full flex items-center justify-center">
                <Icon className="text-primary text-3xl" />
              </div>
              <p className="mt-2 text-base text-gray-600">
                {[
                  "Chọn thông tin hành trình và ấn Tìm chuyến",
                  "Chọn chuyến, chỗ ngồi phù hợp và điền thông tin",
                  "Giữ chỗ và nhận mã",
                  "Thanh toán và lên xe",
                ][index]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Search;