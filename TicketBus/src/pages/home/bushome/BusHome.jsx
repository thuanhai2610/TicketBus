/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { FaTicketAlt, FaCalendarAlt, FaCreditCard, FaMapMarkerAlt } from "react-icons/fa";

const BusHome = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const scrollRef = useRef(null);

  // Handle resize for mobile/desktop toggle
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Bus ticket options
  const busTicketOptions = [
    {
      icon: <FaTicketAlt className="w-10 h-10 text-primary dark:text-primaryblue" />,
      title: "Chọn Vé",
      description: "Chọn loại vé phù hợp với hành trình, từ vé đơn đến vé combo.",
    },
    {
      icon: <FaCalendarAlt className="w-10 h-10 text-primary dark:text-primaryblue" />,
      title: "Ngày Khởi Hành",
      description: "Chọn ngày và giờ khởi hành phù hợp với kế hoạch.",
    },
    {
      icon: <FaMapMarkerAlt className="w-10 h-10 text-primary dark:text-primaryblue" />,
      title: "Chọn Điểm Đến",
      description: "Chọn điểm đến hoặc điểm dừng cho hành trình.",
    },
    {
      icon: <FaCreditCard className="w-10 h-10 text-primary dark:text-primaryblue" />,
      title: "Thanh Toán",
      description: "Thanh toán an toàn qua thẻ tín dụng hoặc ví điện tử.",
    },
  ];

  // Scroll handling for active index
  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        const scrollLeft = scrollRef.current.scrollLeft;
        const cardWidth = scrollRef.current.offsetWidth * (isMobile ? 0.8 : 0.25);
        const newIndex = Math.round(scrollLeft / cardWidth);
        setActiveIndex(newIndex);
      }
    };

    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScroll);
      }
    };
  }, [isMobile]);

  // Scroll to selected card
  const handleDotClick = (index) => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.offsetWidth * (isMobile ? 0.8 : 0.25);
      scrollRef.current.scrollTo({
        left: cardWidth * index,
        behavior: "smooth",
      });
    }
    setActiveIndex(index);
  };

  // Desktop layout
  const DesktopBusHome = (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
      className="w-full max-w-6xl mx-auto p-6 flex flex-col items-center justify-center space-y-8 bg-gray-50 dark:bg-gray-900"
    >
      {/* Heading */}
      <div className="text-center">
        <h2 className="text-4xl font-bold text-neutral-900 dark:text-neutral-50">
          Chọn Vé Xe Khách Dễ Dàng
        </h2>
      </div>

      {/* Cards */}
      <div
        ref={scrollRef}
        className="flex flex-row space-x-6 w-full overflow-x-auto snap-x snap-mandatory scrollbar-hide"
      >
        {busTicketOptions.map((option, index) => (
          <div
            key={index}
            className="min-w-[250px] bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 flex flex-col items-center text-center snap-center hover:shadow-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            <div className="mb-4">{option.icon}</div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-2">
              {option.title}
            </h3>
            <p className="text-gray-600 dark:text-neutral-400 text-sm">{option.description}</p>
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="flex space-x-2">
        {busTicketOptions.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={`h-3 w-3 rounded-full transition ${
              activeIndex === index ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"
            } hover:bg-primaryblue`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </motion.div>
  );

  // Mobile layout
  const MobileBusHome = (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
      className="w-full max-w-md mx-auto p-4 flex flex-col items-center justify-center space-y-6 bg-white dark:bg-primary"
    >
      {/* Heading */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
          Chọn Vé Xe Khách
        </h2>
      </div>

      {/* Cards */}
      <div
        ref={scrollRef}
        className="flex flex-row space-x-4 w-full overflow-x-auto snap-x snap-mandatory scrollbar-hide"
      >
        {busTicketOptions.map((option, index) => (
          <div
            key={index}
            className="min-w-[200px] bg-white dark:bg-gray-900 rounded-lg shadow-sm p-4 flex flex-col items-center text-center snap-center hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            <div className="mb-3">{option.icon}</div>
            <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-50 mb-1">
              {option.title}
            </h3>
            <p className="text-gray-600 dark:text-neutral-400 text-xs">{option.description}</p>
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="flex space-x-2">
        {busTicketOptions.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={`h-2 w-2 rounded-full transition ${
              activeIndex === index ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"
            } hover:bg-primaryblue`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </motion.div>
  );

  return isMobile ? MobileBusHome : DesktopBusHome;
};

export default BusHome;