/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { motion } from "framer-motion";
import { TbArrowsExchange } from "react-icons/tb";
import {
  FaBus,
  FaMapMarkerAlt,
  FaSearch,
  FaTicketAlt,
  FaWallet,
  FaMapMarkedAlt,
} from "react-icons/fa";
import { BsCalendar2Date } from "react-icons/bs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
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

  const locationsGo = ["Nha Trang", "Đà Nẵng"];
  const locations = ["Nha Trang", "Phú Yên", "Bình Định", "Quảng Ngãi", "Đà Nẵng", "Huế"];

  const handleSearch = () => {
    if (!from || !to) {
      setError("Vui lòng nhập điểm đi và điểm đến");
      return;
    }
    setError(null);
    navigate(
      `/bus-tickets?departurePoint=${encodeURIComponent(from)}&destinationPoint=${encodeURIComponent(
        to
      )}&date=${format(date, "yyyy-MM-dd")}`
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
      className="w-full max-w-6xl mx-auto bg-white dark:bg-primary/100 shadow-lg dark:shadow-slate-400 rounded-lg p-4 sm:p-5 flex flex-col items-center space-y-6"
    >
      {/* Web Layout */}
      <div className="hidden sm:flex flex-col sm:flex-row items-stretch gap-4 w-full">
        {/* Điểm đi */}
        <div className="relative w-full">
          <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-200 z-10" />
          <Select value={from} onValueChange={setFrom}>
            <SelectTrigger className="pl-10 w-full bg-white dark:bg-transparent rounded-lg border border-gray-300 h-12 text-left text-gray-500 dark:text-gray-200">
              <SelectValue placeholder="Chọn điểm đi" />
            </SelectTrigger>
            <SelectContent>
              {locationsGo.map((location, index) => (
                <SelectItem key={index} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Nút đảo chiều */}
        <div className="flex items-center justify-center">
          <button
            className="bg-primary dark:bg-slate-400 p-2 rounded-full shadow-md z-10"
            onClick={handleSwap}
          >
            <TbArrowsExchange className="text-white w-5 h-5" />
          </button>
        </div>

        {/* Điểm đến */}
        <div className="relative w-full">
          <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-200 z-10" />
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
          <PopoverContent align="start" side="top" className="bg-white shadow-md rounded-lg p-2">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
            />
          </PopoverContent>
        </Popover>

        {/* Tìm chuyến */}
        <button
          onClick={handleSearch}
          className="bg-primary hover:bg-primary dark:bg-slate-500 dark:hover:bg-slate-400 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-semibold shadow-md whitespace-nowrap"
        >
          <FaSearch /> Tìm chuyến
        </button>
      </div>

      {/* Mobile Layout */}
      <div className="sm:hidden w-full flex flex-col gap-4">
        {/* Row: From + Swap + To */}
        <div className="flex gap-2 items-center">
          <div className="relative w-1/2">
            <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
            <Select value={from} onValueChange={setFrom}>
              <SelectTrigger className="pl-10 w-full bg-white rounded-lg border border-gray-300 h-12 text-left text-gray-500">
                <SelectValue placeholder="Điểm đi" />
              </SelectTrigger>
              <SelectContent>
                {locationsGo.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <button
            onClick={handleSwap}
            className="p-2 bg-primary rounded-full text-white shadow"
          >
            <TbArrowsExchange />
          </button>

          <div className="relative w-1/2">
            <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
            <Select value={to} onValueChange={setTo}>
              <SelectTrigger className="pl-10 w-full bg-white rounded-lg border border-gray-300 h-12 text-left text-gray-500">
                <SelectValue placeholder="Điểm đến" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Row: Date + Search */}
        <div className="flex gap-2 mt-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="h-12 w-2/3 border border-gray-300 bg-white text-gray-700 px-4 py-3 rounded-lg flex items-center"
              >
                <BsCalendar2Date className="text-gray-400 mr-2" />
                {date ? format(date, "dd/MM/yyyy", { locale: vi }) : "Chọn ngày"}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" side="top" className="bg-white rounded-lg p-2 shadow-md">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
              />
            </PopoverContent>
          </Popover>

          <button
            onClick={handleSearch}
            className="w-1/3 bg-primary text-white text-xs px-2 py-3 rounded-lg flex items-center justify-center gap-2 font-semibold shadow"
          >
            <FaSearch /> Tìm chuyến
          </button>
        </div>
      </div>

      {/* Error */}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Guide Steps */}
      <div className="w-full mt-6 px-4">
        <h2 className="text-lg font-semibold text-center text-gray-800 dark:text-neutral-100">
          DỄ DÀNG ĐẶT XE TRÊN WEBSITE
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {[FaMapMarkedAlt, FaBus, FaTicketAlt, FaWallet].map((Icon, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center px-2"
            >
              <div className="w-14 h-14 border-2 border-dashed border-primary rounded-full flex items-center justify-center dark:border-neutral-200">
                <Icon className="text-primary text-3xl dark:text-neutral-200" />
              </div>
              <p className="mt-2 text-xs sm:text-sm md:text-base text-gray-600 dark:text-neutral-300">
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
