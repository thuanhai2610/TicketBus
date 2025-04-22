/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { motion } from "framer-motion";
import { TbArrowsExchange } from "react-icons/tb";
import { FaBus, FaMapMarkerAlt, FaSearch, FaTicketAlt, FaWallet, FaMapMarkedAlt } from "react-icons/fa";
import { BsCalendar2Date } from "react-icons/bs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useNavigate } from "react-router-dom";


// Select từ shadcn/ui
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Search = () => {
  const [date, setDate] = useState(new Date());
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const locations = ["Nha Trang", "Phú Yên", "Bình Định", "Quảng Ngãi", "Đà Nẵng", "Huế"];

  const handleSearch = () => {
    if (!from || !to) {
      setError("Vui lòng nhập điểm đi và điểm đến");
      return;
    }
    setError(null);
    navigate(
      `/bus-tickets?departurePoint=${encodeURIComponent(from)}&destinationPoint=${encodeURIComponent(to)}&date=${format(date, "yyyy-MM-dd")}`
    );
  };

  const handleSwap = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 800 }}
      animate={{ opacity: 1, y: -200 }}
      exit={{ opacity: 0, y: 800 }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
      className="w-full max-w-6xl mx-auto bg-white shadow-lg dark:shadow-slate-400 dark:shadow-sm rounded-lg p-5 flex flex-col items-center justify-center space-y-6 dark:bg-primary/100"
    >
      <div className="flex flex-col lg:flex-row items-stretch gap-4 w-full">
        {/* Điểm đi */}
        <div className="relative w-full">
          <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-neutral-200 z-10" />
          <Select value={from} onValueChange={setFrom}>
            <SelectTrigger className="pl-10 w-full bg-white dark:bg-transparent rounded-lg border border-gray-300 h-12 text-left text-gray-500 dark:text-gray-200">
              <SelectValue placeholder="Chọn điểm đi" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((location, index) => (
                <SelectItem key={index} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Nút đảo chiều */}
        <div className="relative flex justify-center items-center">
          <button
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary dark:bg-slate-400 p-2 rounded-full shadow-md z-10"
            onClick={handleSwap}
          >
            <TbArrowsExchange className="text-white w-5 h-5" />
          </button>
        </div>

        {/* Điểm đến */}
        <div className="relative w-full">
          <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-neutral-200 z-10" />
          <Select value={to} onValueChange={setTo}>
            <SelectTrigger className="pl-10 w-full bg-white dark:bg-transparent rounded-lg border border-gray-300 h-12 text-left text-gray-500 dark:text-gray-200">
              <SelectValue placeholder="Chọn điểm đến" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((location, index) => (
                <SelectItem key={index} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Ngày */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="h-12 w-full sm:w-56 border border-gray-300 bg-white dark:bg-transparent dark:text-neutral-100 text-gray-700 px-4 py-3 rounded-lg flex items-center"
            >
              <BsCalendar2Date className="text-gray-400 mr-2 dark:text-neutral-50" />
              {date ? format(date, "dd 'tháng' MM 'năm' yyyy", { locale: vi }) : "Chọn ngày"}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            side="top"
            className="absolute z-50 w-auto left-0 top-12 bg-white shadow-md rounded-lg p-2 min-h-[300px] h-auto"
          >
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
            />

          </PopoverContent>
        </Popover>

        {/* Nút tìm chuyến */}
        <button
          className="bg-primary hover:bg-primary dark:bg-slate-500 dark:hover:bg-slate-400 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-semibold shadow-md whitespace-nowrap"
          onClick={handleSearch}
        >
          <FaSearch /> Tìm chuyến
        </button>
      </div>

      {/* Hiển thị lỗi */}
      {error && (
        <div className="text-red-500 mt-2">
          {error}
        </div>
      )}

      {/* Hướng dẫn */}
      <div className="mt-6 text-center w-full">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-neutral-100">DỄ DÀNG ĐẶT XE TRÊN WEBSITE</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-4">
          {[FaMapMarkedAlt, FaBus, FaTicketAlt, FaWallet].map((Icon, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="w-14 h-14 border-2 border-dashed border-primary rounded-full flex items-center justify-center dark:border-neutral-200">
                <Icon className="text-primary text-3xl dark:text-neutral-200" />
              </div>
              <p className="mt-2 text-base text-gray-600 dark:text-neutral-300">
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
