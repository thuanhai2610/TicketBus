import React, { useState, useEffect } from 'react';
import PromotionCard from './PromotionCard';
import { useNavigate, useLocation } from 'react-router-dom';

const promotions = [
  {
    title: 'Giảm 20% cho chuyến đi đầu tiên',
    description: 'Đặt vé lần đầu và nhận ưu đãi 20% cho bất kỳ tuyến đường nào.',
    code: 'NEW20',
  },
  {
    title: 'Mua 2 tặng 1',
    description: 'Đặt 2 vé cùng lúc để nhận thêm 1 vé miễn phí.',
    code: 'BUY2GET1',
  },
  {
    title: 'Giảm 50K cho đơn từ 300K',
    description: 'Áp dụng cho tất cả các tuyến đường, không giới hạn số lần sử dụng.',
    code: 'SAVE50',
  },
  {
    title: 'Giảm 20% cho chuyến đi đầu tiên',
    description: 'Đặt vé lần đầu và nhận ưu đãi 20% cho bất kỳ tuyến đường nào.',
    code: 'NEW20',
  },
  {
    title: 'Mua 2 tặng 1',
    description: 'Đặt 2 vé cùng lúc để nhận thêm 1 vé miễn phí.',
    code: 'BUY2GET1',
  },
  {
    title: 'Giảm 50K cho đơn từ 300K',
    description: 'Áp dụng cho tất cả các tuyến đường, không giới hạn số lần sử dụng.',
    code: 'SAVE50',
  },
  {
    title: 'Giảm 30% cho đơn hàng từ 500K',
    description: 'Ưu đãi đặc biệt cho các đơn hàng lớn.',
    code: 'SAVE30',
  },
  {
    title: 'Mua 1 tặng 1 cho vé VIP',
    description: 'Đặt vé VIP và nhận thêm một vé miễn phí.',
    code: 'VIPBUY1',
  },
  // Add more promotions here
];

const Offer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [page, setPage] = useState(1);
  const limit = 6;  // Show 6 items per page (3 on top, 3 on bottom)

  // Extract page number from the URL query
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const pageFromUrl = parseInt(urlParams.get('page') || '1', 10);
    setPage(pageFromUrl);
  }, [location]);

  // Calculate pagination
  const start = (page - 1) * limit;
  const currentPromotions = promotions.slice(start, start + limit);
  const totalPages = Math.ceil(promotions.length / limit);

  const handlePageChange = (pageNum) => {
    setPage(pageNum);
    navigate(`?page=${pageNum}`);  // Update URL with page number without scrolling to the top
  };


  return (
    <div className="from-white dark:from-gray-900 dark:to-gray-800 pt-40 pb-12 px-4 md:px-10 transition-colors duration-300">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-4xl font-extrabold text-primary dark:text-neutral-50 mb-4">
          🎉 Ưu Đãi Đặc Biệt 🎉
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-10">
          Nhanh tay đặt vé để nhận những khuyến mãi cực hấp dẫn chỉ có trong hôm nay!
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Displaying 6 offers in a grid (2 rows, 3 columns) */}
          {currentPromotions.map((promo, idx) => (
            <PromotionCard
              key={idx}
              promo={promo}
            />
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="w-full flex items-center justify-center gap-2 mt-4 flex-wrap">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`px-4 py-2 rounded-lg border ${page === pageNum
                  ? 'bg-primary text-white'
                  : 'bg-white text-primary border-primary'
                  } hover:bg-primary hover:text-white transition duration-200`}
              >
                {pageNum}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Offer;
