import React, { useState, useEffect } from 'react';

const Blog = () => {
  const [news, setNews] = useState([]);
  const [page, setPage] = useState(1);
  const limit = 6;

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(
          'https://api.rss2json.com/v1/api.json?rss_url=https://vnexpress.net/rss/thoi-su.rss'
        );
        const data = await response.json();
        setNews(data.items || []);
      } catch (error) {
        console.error('Error fetching news:', error);
      }
    };

    fetchNews();
  }, []);

  const start = (page - 1) * limit;
  const currentPosts = news.slice(start, start + limit);
  const totalPages = Math.ceil(news.length / limit);

  const handlePageChange = (pageNum) => {
    setPage(pageNum);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-gray-100 min-h-screen py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-10">📰 Tin tức mới nhất từ VnExpress</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentPosts.map((item, index) => (
            <a
              key={index}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition duration-300 overflow-hidden"
            >
              <img src={item.thumbnail} alt={item.title} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h2 className="text-lg font-semibold text-blue-700 hover:underline line-clamp-2">{item.title}</h2>
                <p className="text-sm text-gray-600 mt-2 line-clamp-3" dangerouslySetInnerHTML={{ __html: item.description }} />
                <p className="text-xs text-gray-400 mt-3">{new Date(item.pubDate).toLocaleString()}</p>
              </div>
            </a>
          ))}
        </div>

        {/* Phân trang */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-10 space-x-2 flex-wrap">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`w-10 h-10 rounded-full font-medium border ${
                  page === pageNum
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white transition'
                }`}
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

export default Blog;
