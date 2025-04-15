import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

const PromotionCard = ({ promo }) => {
  const [copiedCode, setCopiedCode] = useState(null);

  const handleCopy = async (code) => {
    try {
      // Sao chép mã vào clipboard
      await navigator.clipboard.writeText(code);
      // Cập nhật mã đã sao chép và hiển thị icon check
      setCopiedCode(code);
      
      // Reset trạng thái sau 2 giây
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error("Không thể sao chép mã:", err);
    }
  };

  return (
    <div className="flex flex-col justify-between h-[200px] bg-white dark:bg-primaryblue/5 rounded-2xl shadow-md dark:shadow-lg hover:shadow-xl transition duration-300 p-6 text-left">
      <div>
        <h2 className="text-xl font-semibold text-primary dark:text-neutral-100 mb-2">
          {promo.title}
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm">{promo.description}</p>
      </div>
      <div className="flex items-center justify-between bg-blue-100 dark:bg-gray-800 rounded-md px-4 py-2">
        <span className="text-blue-700 dark:text-blue-300 font-bold">
          Mã: {promo.code}
        </span>
        <button
          onClick={() => handleCopy(promo.code)}
          className={`transition ${copiedCode === promo.code
              ? 'text-green-600 dark:text-green-400'
              : 'text-primary dark:text-blue-500 hover:text-blue-800 dark:hover:text-blue-400'
            }`}
          title="Sao chép mã"
        >
          {copiedCode === promo.code ? <Check size={18} /> : <Copy size={18} />}
        </button>
      </div>
    </div>
  );
};

export default PromotionCard;
