/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import RootLayout from "../../../layout/RootLayout";

// Main slides for web
const slides = [
    {
        title: "ĐẶT VÉ XE DỄ DÀNG",
        description: "Tìm kiếm & đặt vé xe khách nhanh chóng với hệ thống đặt vé thông minh. Chỉ với vài thao tác đơn giản trên điện thoại hoặc máy tính, bạn có thể dễ dàng lựa chọn chuyến đi phù hợp và hoàn tất thanh toán một cách an toàn, tiện lợi. Không còn lo lắng về việc hết vé hay xếp hàng dài tại bến xe, tất cả đều trong tầm tay bạn!",
        buttonText: "ĐẶT NGAY"
    },
    {
        title: "TUYẾN ĐƯỜNG PHÙ HỢP",
        description: "Chúng tôi cung cấp hàng trăm tuyến đường khác nhau với nhiều lựa chọn nhà xe chất lượng, đáp ứng đầy đủ nhu cầu di chuyển của bạn. Hệ thống giúp bạn so sánh giá vé, thời gian xuất bến, và các tiện ích đi kèm như xe giường nằm, điều hòa, wifi miễn phí để bạn có thể đưa ra quyết định tối ưu nhất cho hành trình của mình.",
        buttonText: "XEM TUYẾN XE"
    },
    {
        title: "ƯU ĐÃI GIÁ TỐT NHẤT",
        description: "Đặt vé trực tuyến qua BusTicket ngay hôm nay để nhận hàng loạt ưu đãi hấp dẫn! Chúng tôi thường xuyên cập nhật các chương trình khuyến mãi, mã giảm giá và chính sách tích điểm đổi quà giúp bạn tiết kiệm hơn trên mỗi chuyến đi. Hãy theo dõi để không bỏ lỡ những cơ hội giảm giá tốt nhất!",
        buttonText: "XEM KHUYẾN MÃI"
    },

];

const mobileSlides = [
    {
        title: "ĐẶT VÉ NHANH",
        description: "Tìm vé xe nhanh chóng và dễ dàng.",
        buttonText: "ĐẶT NGAY"
    },
    {
        title: "TUYẾN ĐƯỜNG DỄ DÀNG",
        description: "Chọn tuyến đường phù hợp với bạn.",
        buttonText: "XEM TUYẾN"
    },
    {
        title: "ƯU ĐÃI MỚI",
        description: "Nhận ngay các ưu đãi hấp dẫn.",
        buttonText: "XEM ƯU ĐÃI"
    }
];

const Hero = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const heroRef = useRef(null);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % (window.innerWidth <= 768 ? mobileSlides.length : slides.length));
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            ref={heroRef}
            className="w-full flex-1 min-h-[420px] sm:min-h-screen sm:bg-[url('./assets/bg1.jpg')] bg-[url('./assets/bg2.jpg')] bg-cover bg-no-repeat bg-top relative flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.85, ease: "easeInOut" }}
        >

            {/* Web Version */}
            <RootLayout className="hidden sm:flex absolute top-72 left-10 h-auto py-8 px-4 sm:px-6 md:px-8 items-start justify-start text-start flex-col gap-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className="w-full sm:w-[90%] md:w-3/4 lg:w-2/5 space-y-4"
                    >
                        <motion.h1 className="text-3xl sm:text-4xl text-primaryblue font-bold uppercase tracking-wide w-full break-words">
                            {slides[currentSlide].title}
                        </motion.h1>

                        <motion.p className="text-base sm:text-lg text-gray-400">
                            {slides[currentSlide].description}
                        </motion.p>

                        <motion.button
                            className="mt-4 px-6 py-3 bg-primary text-white text-base sm:text-lg font-semibold rounded-lg shadow-md shadow-slate-100 hover:bg-primaryblue hover:text-neutral-700 transition"
                        >
                            {slides[currentSlide].buttonText}
                        </motion.button>
                    </motion.div>
                </AnimatePresence>

                {/* Dots Indicator */}
                <div className="flex gap-2 mt-4 justify-center">
                    {slides.map((_, index) => (
                        <span
                            key={index}
                            className={`w-3 h-3 rounded-full transition-all duration-300 cursor-pointer ${index === currentSlide ? "bg-primaryblue scale-110" : "bg-gray-400"}`}
                            onClick={() => setCurrentSlide(index)}
                        ></span>
                    ))}
                </div>
            </RootLayout>

            {/* Mobile Version */}
            <RootLayout className="mt-10 w-[50%] absolute top-1/4 left-0 transform -translate-y-1/4 sm:hidden flex flex-col items-start justify-start gap-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className="w-full text-start space-y-2"
                    >
                        <motion.h1 className="text-xs text-primaryblue font-bold uppercase tracking-wide">
                            {mobileSlides[currentSlide].title}
                        </motion.h1>

                        <motion.p className="text-xs text-gray-400 text-start">
                            {mobileSlides[currentSlide].description}
                        </motion.p>

                        <motion.button
                            className=" w-24 px-3 py-1 bg-primary text-white text-xs flex font-semibold rounded-lg shadow-md shadow-slate-100 hover:bg-primaryblue hover:text-neutral-700 transition"
                        >
                            {mobileSlides[currentSlide].buttonText}
                        </motion.button>
                    </motion.div>
                </AnimatePresence>

                {/* Mobile Dots Indicator */}
                <div className="flex gap-2 mt-1 justify-center">
                    {mobileSlides.map((_, index) => (
                        <span
                            key={index}
                            className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${index === currentSlide ? "bg-primaryblue scale-110" : "bg-gray-400"}`}
                            onClick={() => setCurrentSlide(index)}
                        ></span>
                    ))}
                </div>
            </RootLayout>

        </motion.div>
    );
};

export default Hero;
