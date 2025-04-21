import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

const PromotionCard = ({ promo }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(promo.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Tạo tiêu đề tự động dựa theo discountType
  const title =
    promo.discountType === 'percentage'
      ? `Giảm ${promo.discountValue}%`
      : `Giảm ${promo.discountValue.toLocaleString()} VND`;

  // Format ngày hết hạn
  const expiresText = promo.expiresAt
    ? new Date(promo.expiresAt).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    : 'Không giới hạn';

  return (
    <div className="flex flex-col justify-between h-[240px] bg-white rounded-2xl shadow-md hover:shadow-xl transition p-6">
      <div>
        <h2 className="text-xl font-semibold text-primary mb-2">{title}</h2>
        <p className="text-gray-700 mb-2 text-sm">{promo.description}</p>
        <p className="text-xs text-gray-500">Hết hạn: {expiresText}</p>
      </div>

      <div className="flex items-center justify-between bg-blue-50 rounded-md px-4 py-2 mt-4">
        <span className="font-bold text-blue-700">Mã: {promo.code}</span>
        <button
          onClick={handleCopy}
          className={`transition ${
            copied ? 'text-green-600' : 'text-primary hover:text-blue-800'
          }`}
          title="Sao chép mã"
        >
          {copied ? <Check size={18} /> : <Copy size={18} />}
        </button>
      </div>
    </div>
  );
};

export default PromotionCard;
