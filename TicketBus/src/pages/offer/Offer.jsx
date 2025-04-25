import React, { useState, useEffect } from 'react';
import PromotionCard from './PromotionCard';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const Offer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const limit = 6;

  // Lấy page từ URL ?page=...
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setPage(parseInt(params.get('page') || '1', 10));
  }, [location.search]);

  // Fetch coupons từ backend
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/coupons`);
        setPromotions(res.data);
      } catch (err) {
        console.error(err);
        setError('Không lấy được danh sách khuyến mãi.');
      } finally {
        setLoading(false);
      }
    };
    fetchCoupons();
  }, []);

  if (loading) return <p className="text-center py-10">Đang tải ưu đãi...</p>;
  if (error)   return <p className="text-center py-10 text-red-600">{error}</p>;

  // Tính phân trang
  const start = (page - 1) * limit;
  const pageItems = promotions.slice(start, start + limit);
  const totalPages = Math.ceil(promotions.length / limit);

  const goToPage = (p) => {
    navigate(`?page=${p}`);
  };

  return (
    <div className="pt-40 pb-12 px-4 md:px-10">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-4xl font-extrabold text-primary mb-4 dark:text-neutral-50">🎉 Ưu Đãi Đặc Biệt 🎉</h1>
        <p className="text-lg text-gray-600 mb-10 dark:text-neutral-200">
          Nhanh tay đặt vé để nhận những khuyến mãi cực hấp dẫn!
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pageItems.map((promo) => (
            <PromotionCard key={promo._id} promo={promo} />
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8 flex-wrap">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => goToPage(p)}
                className={`px-4 py-2 rounded-lg border ${
                  p === page
                    ? 'bg-primary text-white'
                    : 'bg-white text-primary border-primary'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Offer;
