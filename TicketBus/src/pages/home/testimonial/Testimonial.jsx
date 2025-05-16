/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import bg from "../../../assets/homebg.jpg";

const Testimonial = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const [bgLoaded, setBgLoaded] = useState(true);

  // Handle resize for mobile/desktop toggle
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Check if background image loads
  useEffect(() => {
    const img = new Image();
    img.src = bg;
    img.onload = () => setBgLoaded(true);
    img.onerror = () => setBgLoaded(false);
  }, []);

  // Animation variants for text
  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeInOut" } },
  };

  // Desktop layout
  const DesktopTestimonial = (
    <div className="relative w-full">
      <div
        className="relative min-h-[400px] bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: bgLoaded
            ? `url(${bg})`
            : "linear-gradient(to bottom, #4b5e7a, #2d3748)", // Fallback gradient
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-10">
          <motion.div
            className="text-center rounded-lg p-8 max-w-2xl mx-4 shadow-md"
            initial="hidden"
            animate="visible"
            variants={textVariants}
          >
            <h1 className="text-4xl font-bold text-neutral-50 dark:text-neutral-50 mb-4">
              Chào mừng đến với TICKETBUS
            </h1>
            <p className="text-lg text-gray-200 dark:text-neutral-300 mb-4">
              Đặt vé xe khách online dễ dàng - Hành trình thuận tiện, giá cả hợp lý!
            </p>
            <p className="text-sm text-gray-400 dark:text-neutral-400">
              Dev Team: Nguyen Thuan Hai - Le Tran Thu Lieu - Do Tien Khoa
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );

  // Mobile layout
  const MobileTestimonial = (
    <div className="relative w-full bg-white dark:bg-primary">
      <div
        className="relative min-h-[300px] bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: bgLoaded
            ? `url(${bg})`
            : "linear-gradient(to bottom, #4b5e7a, #2d3748)", // Fallback gradient
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-10">
          <motion.div
            className="text-center rounded-lg p-6 max-w-md mx-4 shadow-sm"
            initial="hidden"
            animate="visible"
            variants={textVariants}
          >
            <h1 className="text-3xl font-bold text-neutral-50 dark:text-neutral-50 mb-3 text-center">
              Chào mừng đến với TICKETBUS
            </h1>
            <p className="text-base text-gray-200 dark:text-neutral-300 mb-3">
              Đặt vé xe khách dễ dàng, giá cả hợp lý!
            </p>
            <p className="text-xs text-gray-400 dark:text-neutral-400">
              Dev Team: Nguyen Thuan Hai - Le Tran Thu Lieu - Do Tien Khoa
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );

  return isMobile ? MobileTestimonial : DesktopTestimonial;
};

export default Testimonial;