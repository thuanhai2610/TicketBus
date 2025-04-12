/* eslint-disable no-unused-vars */
import React from 'react'
import { FaPhone } from 'react-icons/fa'

const CompanyInvoice = ( {totalPrice,
    passengerName,
    totalSeats,
    totalPassengers,
    pickupStation,
    departurePoint,
    destinationPoint,
    departureTime,
    arrivalTime,
    vehicleId,
    bookedAt,
    passengerInfo,
ticketId}) => { 
        const formatTime = (dateString) => {
        const date = new Date(dateString);
        let hours = date.getUTCHours();
        const minutes = date.getUTCMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12; // chuyển 0 thành 12
        const paddedMinutes = String(minutes).padStart(2, '0');
        return `${hours}:${paddedMinutes} ${ampm}`;
      };

      const formatDateVerbose = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return `Ngày ${date.getDate().toString().padStart(2, '0')} tháng ${date.getMonth() + 1} năm ${date.getFullYear()}`;
      };
      
  return (
    <div className='w-full col-span-1 border-dashed border-l-2 relative'>
        <div className="w-full bg-primary px-4 py-5 rounded-tr-3xl">
            <h1 className="text-2xl text-neutral-50 font-bold text-center">
                Bus Ticket 
            </h1>
        </div>
        <div className="w-full px-4 py-7 space-y-2">
            <p className="text-sm text-neutral-600 font-normal">
                Hóa Đơn : {ticketId}
            </p>
            <p className="text-sm text-neutral-600 font-normal">
                Ngày Đặt : {bookedAt ? formatDateVerbose(bookedAt) : ''}
            </p>
            <p className="text-sm text-neutral-600 font-normal">
                Tên Khách Hàng: {passengerName}
            </p>
            <p className="text-sm text-neutral-600 font-normal">
                Điểm Đi : {departurePoint} <span className="text-xs"></span>
            </p>
            <p className="text-sm text-neutral-600 font-normal">
                Điểm Đến : {destinationPoint} <span className="text-xs"></span>
            </p>
            <p className="text-sm text-neutral-600 font-normal">
                Giờ Khởi Hành : { departureTime ? formatTime(departureTime) : 'Unknown Time'}
            </p>
            <p className="text-sm text-neutral-600 font-normal">
                Ghế : {Array.isArray(totalSeats) ? totalSeats.join(', ') : totalSeats}
            </p>
            <p className="text-sm text-neutral-600 font-normal">
                Tổng Hành Khách: {totalPassengers}
            </p>
            <p className="text-sm text-neutral-600 font-normal">
                Tổng Tiền : {Number(totalPrice).toLocaleString("vi-VN")} VNĐ
            </p>
        </div>
      
      {/* Right bottom section */}
       <div className="w-full bg-primary absolute bottom-0 left-0 rounded-br-3xl flex items-center justify-center px-5 py-1.5">
              <div className="flex items-center gap-x-2">
                  <FaPhone  className='w-3 h-3 text-neutral-100'/>
                  <p className="text-xs text-neutral-100 font-light">
                 +84 8888-8888 , +84 9999-9999
              </p>
              </div>
              
            </div>
    </div>
  )
}

export default CompanyInvoice
