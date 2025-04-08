/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import RootLayout from "../../../layout/RootLayout";

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
    {
        title: "DỊCH VỤ CHẤT LƯỢNG",
        description: "Chúng tôi hợp tác với các nhà xe uy tín hàng đầu để mang đến cho bạn trải nghiệm di chuyển an toàn, thoải mái và đáng tin cậy. Với đội ngũ tài xế giàu kinh nghiệm, xe luôn được bảo dưỡng định kỳ, cùng nhiều tiện ích hiện đại như ghế massage, nước uống miễn phí, đảm bảo hành trình của bạn luôn trọn vẹn.",
        buttonText: "TÌM HIỂU NGAY"
    },
    {
        title: "HỖ TRỢ KHÁCH HÀNG 24/7",
        description: "Chúng tôi luôn sẵn sàng đồng hành cùng bạn mọi lúc, mọi nơi! Đội ngũ chăm sóc khách hàng chuyên nghiệp hoạt động 24/7 để hỗ trợ, giải đáp mọi thắc mắc về đặt vé, đổi vé, hay các vấn đề phát sinh trong chuyến đi. Hãy liên hệ ngay để được phục vụ nhanh chóng và chu đáo!",
        buttonText: "LIÊN HỆ NGAY"
    },
];

const Hero = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const heroRef = useRef(null);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            ref={heroRef}
            className='w-full flex-1 min-h-screen bg-[url("./assets/bg1.jpg")] bg-cover bg-no-repeat bg-top relative flex items-center justify-center'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.85, ease: "easeInOut" }}
        >
            <RootLayout className="absolute top-72 left-10 h-auto py-8 px-4 sm:px-6 md:px-8 flex items-start justify-start text-start flex-col gap-6">
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
                <div className="flex gap-2 mt-4">
                    {slides.map((_, index) => (
                        <span
                            key={index}
                            className={`w-3 h-3 rounded-full transition-all duration-300 cursor-pointer ${index === currentSlide ? "bg-primaryblue scale-110" : "bg-gray-400"}`}
                            onClick={() => setCurrentSlide(index)}
                        ></span>
                    ))}
                </div>
            </RootLayout>
        </motion.div>

    );
};

export default Hero;
