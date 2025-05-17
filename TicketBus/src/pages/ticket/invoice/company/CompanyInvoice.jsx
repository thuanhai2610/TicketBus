/* eslint-disable no-unused-vars */
import React from 'react';
import { FaPhone } from 'react-icons/fa';

const CompanyInvoice = ({
    ticketId,
    bookedAt,
    passengerName,
    departurePoint,
    destinationPoint,
    departureTime,
    totalSeats,
    totalPassengers,
    finalAmount,
}) => {
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const year = date.getUTCFullYear();
        const hours = String(date.getUTCHours()).padStart(2, '0');
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} - ${hours}:${minutes}`;
    };

    const formatDateVerbose = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return `Ngày ${date.getDate().toString().padStart(2, '0')} tháng ${date.getMonth() + 1} năm ${date.getFullYear()}`;
    };

    return (
        <div className="w-full col-span-1 border-dashed border-l-2 relative flex flex-col ">
            {/* Header */}
            <div className="w-full bg-primary px-2 py-5 rounded-tr-3xl">
                <h1 className="text-2xl text-neutral-50 font-bold text-center uppercase">Bus Ticket</h1>
            </div>

            {/* Main content */}
            <div className="flex-1 w-full px-4 py-6 space-y-2 text-sm text-neutral-600 font-normal">
                <p>Mã Vé: <span className="font-semibold">{ticketId}</span></p>
                
                <p>Tên Khách Hàng: <span className="font-semibold">{passengerName}</span></p>

                <hr className="border-dashed border-t border-neutral-300 my-2" />

                <p>Điểm Đi: <span className="font-semibold">{departurePoint}</span></p>
                <p>Điểm Đến: <span className="font-semibold">{destinationPoint}</span></p>
                <p>Giờ Khởi Hành: <span className="font-semibold">{departureTime ? formatTime(departureTime) : 'Unknown Time'}</span></p>

                <hr className="border-dashed border-t border-neutral-300 my-2" />

                <p>Ghế: <span className="font-semibold">{Array.isArray(totalSeats) ? totalSeats.join(', ') : totalSeats}</span></p>
             
                <p className="pb-4">Tổng Tiền: <span className="font-bold text-base">{Number(finalAmount).toLocaleString("vi-VN")} VNĐ</span></p>
            </div>

            {/* Footer */}
            <div className="w-full bg-primary rounded-br-3xl flex items-center justify-center px-5 py-2">
                <div className="flex items-center gap-x-2 text-xs text-neutral-100 font-light">
                    <FaPhone className="w-3 h-3" />
                    <span>+84 8888-8888 , +84 9999-9999</span>
                </div>
            </div>
        </div>
    );
};

export default CompanyInvoice;
