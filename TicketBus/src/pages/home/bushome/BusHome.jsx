/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FaTicketAlt, FaCalendarAlt, FaCreditCard, FaMapMarkerAlt } from 'react-icons/fa'; // Importing ticket-related icons

const BusHome = () => {
  const { ref, inView } = useInView({
    triggerOnce: true, // Run animation only once
    threshold: 0.2, // Trigger animation when 20% of the element is in view
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);

  // Updated content for bus ticket options with relevant icons
  const busTicketOptions = [
    {
      icon: <FaTicketAlt className="w-12 h-12 text-blue-500" />, // Ticket Icon
      title: 'Chọn Vé',
      description: 'Chọn loại vé phù hợp với hành trình của bạn, từ vé đơn giản đến vé combo.',
    },
    {
      icon: <FaCalendarAlt className="w-12 h-12 text-blue-500" />, // Calendar Icon
      title: 'Lựa Chọn Ngày Khởi Hành',
      description: 'Chọn ngày và giờ khởi hành phù hợp với kế hoạch của bạn.',
    },
    {
      icon: <FaMapMarkerAlt className="w-12 h-12 text-blue-500" />, // Location Pin Icon
      title: 'Chọn Điểm Đến',
      description: 'Chọn điểm đến hoặc điểm dừng để xác nhận hành trình của bạn.',
    },
    {
      icon: <FaCreditCard className="w-12 h-12 text-blue-500" />, // Credit Card Icon
      title: 'Thanh Toán',
      description: 'Lựa chọn phương thức thanh toán dễ dàng và an toàn qua thẻ tín dụng hoặc ví điện tử.',
    },

  ];

  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        const scrollLeft = scrollRef.current.scrollLeft;
        const cardWidth = scrollRef.current.offsetWidth * 0.25; // Approximate width of each card
        const newIndex = Math.round(scrollLeft / cardWidth);
        setActiveIndex(newIndex);
      }
    };

    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  // Scroll to the selected card based on the index
  const handleDotClick = (index) => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.offsetWidth * 0.25;
      scrollRef.current.scrollTo({
        left: cardWidth * index,
        behavior: 'smooth', // Smooth scroll transition
      });
    }
    setActiveIndex(index); // Update active dot
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 1.5, ease: 'easeInOut' }}
      className="w-full max-w-6xl mx-auto p-5 flex flex-col items-center justify-center space-y-6"
    >
      {/* Heading */}
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 py-5 dark:text-neutral-50">
          Chọn Vé Xe Khách Dễ Dàng
        </h2>
      </div>

      {/* Horizontal Layout for Bus Ticket Cards */}
      <div
        ref={scrollRef}
        className="flex flex-row space-x-6 w-full overflow-x-auto snap-x snap-mandatory scrollbar-hide"
      >
        {busTicketOptions.map((option, index) => (
          <div
            key={index}
            className="min-w-[250px] bg-white rounded-lg shadow-lg p-6 flex flex-col items-center text-center snap-center dark:bg-primaryblue/5"
          >
            <div className="mb-4">{option.icon}</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2 dark:text-neutral-200">{option.title}</h3>
            <p className="text-gray-600 text-sm dark:text-neutral-400">{option.description}</p>
          </div>
        ))}
      </div>

    </motion.div>
  );
};

export default BusHome;
