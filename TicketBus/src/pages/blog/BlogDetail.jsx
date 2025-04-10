import React from 'react';
import { useParams } from 'react-router-dom';

const BlogDetail = () => {
    const { id } = useParams();

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
    
    ];

    const bus = busData.find(bus => bus.id === parseInt(id));

    return (
        <div className="h-screen flex items-center justify-center bg-gray-100 py-10">
            <div className="max-w-4xl p-6 bg-white shadow-lg rounded-lg">
                <h2 className="text-3xl font-semibold text-blue-600">{bus?.name}</h2>
                <img src={bus?.imageUrl} alt={bus?.name} className="w-full h-64 object-cover mt-4" />
                <p className="text-lg text-neutral-700 mt-4">{bus?.description}</p>
                <p className="text-sm text-gray-500 mt-4">{bus?.datePosted}</p>
            </div>
        </div>
    );
};

export default BlogDetail;
