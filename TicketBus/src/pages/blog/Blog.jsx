import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const busData = [
  {
    id: 1,
    name: "Xe khách Hà Nội - Quảng Ninh",
    description: "Chuyến xe chất lượng cao từ Hà Nội đến Quảng Ninh, với tiện nghi đầy đủ và lịch trình cố định.",
    datePosted: "Ngày đăng: 10/04/2025",
    imageUrl: "https://via.placeholder.com/300",
  },
  {
    id: 2,
    name: "Xe khách TP.HCM - Vũng Tàu",
    description: "Chuyến xe từ TP.HCM đến Vũng Tàu với ghế ngả, điều hòa và wifi miễn phí.",
    datePosted: "Ngày đăng: 08/04/2025",
    imageUrl: "https://via.placeholder.com/300",
  },
  {
    id: 3,
    name: "Xe khách Đà Nẵng - Huế",
    description: "Xe khách sang trọng phục vụ hành trình từ Đà Nẵng đến Huế, đảm bảo an toàn và tiện lợi.",
    datePosted: "Ngày đăng: 06/04/2025",
    imageUrl: "https://via.placeholder.com/300",
  },
  {
    id: 4,
    name: "Xe khách Hà Nội - Sapa",
    description: "Chuyến xe từ Hà Nội đến Sapa, được trang bị ghế ngồi thoải mái, điều hòa và wifi.",
    datePosted: "Ngày đăng: 04/04/2025",
    imageUrl: "https://via.placeholder.com/300",
  },
  {
    id: 5,
    name: "Xe khách TP.HCM - Phan Thiết",
    description: "Chuyến xe từ TP.HCM đến Phan Thiết, với hành trình 5 giờ di chuyển, đầy đủ tiện nghi.",
    datePosted: "Ngày đăng: 02/04/2025",
    imageUrl: "https://via.placeholder.com/300",
  },
  {
    id: 6,
    name: "Xe khách Đà Nẵng - Nha Trang",
    description: "Xe khách đi Đà Nẵng - Nha Trang, với các ghế ngả, dịch vụ ăn uống đầy đủ.",
    datePosted: "Ngày đăng: 01/04/2025",
    imageUrl: "https://via.placeholder.com/300",
  },
  {
    id: 7,
    name: "Xe khách TP.HCM - Cần Thơ",
    description: "Chuyến xe đi từ TP.HCM đến Cần Thơ, với ghế ngồi và không gian thoải mái.",
    datePosted: "Ngày đăng: 30/03/2025",
    imageUrl: "https://via.placeholder.com/300",
  },
  {
    id: 8,
    name: "Xe khách Hà Nội - Hải Phòng",
    description: "Xe khách đi từ Hà Nội đến Hải Phòng, phục vụ xe giường nằm thoải mái.",
    datePosted: "Ngày đăng: 28/03/2025",
    imageUrl: "https://via.placeholder.com/300",
  },
];

const Blog = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [page, setPage] = useState(1);
  const limit = 5;

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const pageFromUrl = parseInt(urlParams.get('page') || '1', 10);
    setPage(pageFromUrl);
  }, [location]);

  const start = (page - 1) * limit;
  const currentPosts = busData.slice(start, start + limit);
  const totalPages = Math.ceil(busData.length / limit);

  const handlePageChange = (pageNum) => {
    setPage(pageNum);
    navigate(`?page=${pageNum}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-gray-100 py-10 pt-32">
      <h1 className="text-5xl text-neutral-500 font-bold mb-8">Tin tức</h1>
      <div className="w-full max-w-4xl p-4">
        {currentPosts.map((bus) => (
          <Link to={`/blog/${bus.id}`} key={bus.id} className="mb-6 p-6 bg-white shadow-lg rounded-lg flex items-center space-x-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex-1">
              <h2 className="text-3xl font-semibold text-blue-600">{bus.name}</h2>
              <p className="text-lg text-neutral-700 mb-4">{bus.description}</p>
              <p className="text-sm text-gray-500 mt-4">{bus.datePosted}</p>
            </div>
            <div className="w-48 h-48 bg-gray-200 rounded-lg overflow-hidden">
              <img src={bus.imageUrl} alt={bus.name} className="w-full h-full object-cover" />
            </div>
          </Link>
        ))}
      </div>

      {/* Phân trang */}
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
  );
};

export default Blog;
