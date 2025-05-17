import React from 'react';
import { FaCircleCheck, FaArrowRightLong } from 'react-icons/fa6';
import { QRCodeCanvas } from 'qrcode.react';
import BusImg from '../../../../assets/logoxanh.png';
import { FaPhone } from 'react-icons/fa';

const PassengerInvoice = ({
  ticketId,
  passengerName,
  totalSeats,
  totalPassengers,
  pickupStation,
  departurePoint,
  destinationPoint,
  departureTime,
  arrivalTime,
  qrCodeData,
  finalAmount,
  bookedAt,
  lisencePlate,
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
    <div className="w-full col-span-4 rounded-3xl relative flex flex-col pb-16 bg-white">
      {/* Header */}
      <div className="w-full flex items-center justify-between bg-primary px-6 py-3 rounded-tl-3xl">
        <div className="flex items-center gap-x-3">
          <img src={BusImg} alt="bus img" className="w-auto h-12 object-cover object-center" />
          <h1 className="text-xl text-primaryblue font-bold uppercase tracking-wider pt-1">
            Ticket<span className="text-neutral-50">Bus</span>
          </h1>
        </div>
        <p className="text-lg text-neutral-50 font-bold">
          <span className="text-base font-normal">Biển Số Xe:</span> {lisencePlate}
        </p>
      </div>

      {/* Content */}
      <div className="w-full grid grid-cols-5 gap-8 items-start px-5 py-6">
        {/* Left Section */}
        <div className="col-span-5 sm:col-span-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-dashed border-neutral-300 pb-3">
            <p className="text-base text-neutral-500">Hóa đơn: {ticketId}</p>
            <p className="text-base text-neutral-500">
              Ngày Đặt : {bookedAt ? formatDateVerbose(bookedAt) : ''}
            </p>
          </div>

          {/* Passenger Detail */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="space-y-1.5">
              <p className="text-base text-neutral-600">Tên Khách Hàng: <span className="font-bold">{passengerName}</span></p>
              <p className="text-base text-neutral-600">Vị Trí Ghế: <span className="font-bold">{Array.isArray(totalSeats) ? totalSeats.join(', ') : totalSeats}</span></p>
              <p className="text-base text-neutral-600">Tổng Khách Hàng: <span className="font-bold">{totalPassengers}</span></p>
              <p className="text-base text-neutral-600">Địa Chỉ: <span className="font-bold">{pickupStation}</span></p>
            </div>

            {/* Payment Section */}
            <div className="space-y-4 flex items-center justify-center flex-col">
              <div className="text-center space-y-1">
                <p className="text-base text-neutral-600">Tổng tiền:</p>
                <h1 className="text-2xl text-green-700 font-extrabold">
                  {Number(finalAmount).toLocaleString('vi-VN')} VNĐ
                </h1>
              </div>
              <div className="px-3 py-1 rounded-full bg-green-500/10 border border-green-600 text-green-700 text-sm font-medium flex items-center gap-2">
                <FaCircleCheck size={16} />
                <span>Đã thanh toán</span>
              </div>
            </div>
          </div>

          {/* Route Details */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t-2 border-dashed border-neutral-300 pt-3 gap-2">
            <p className="flex items-center gap-2 text-base font-bold text-neutral-600">
              {departurePoint}
              <FaArrowRightLong className="text-neutral-400 mt-[2px]" />
              {destinationPoint}
            </p>
            <p className="text-base text-neutral-600">
              Giờ Đi: {departureTime ? formatTime(departureTime) : 'Chưa xác định'}
            </p>
            <p className="text-base text-neutral-600">
              Giờ Đến: {arrivalTime ? formatTime(arrivalTime) : 'Chưa xác định'}
            </p>
          </div>
        </div>

        {/* QR Code Section */}
        {qrCodeData && (
          <div className="col-span-5 sm:col-span-1 flex justify-center sm:justify-end">
            <div className="max-w-[160px] sm:max-w-[200px]">
              <QRCodeCanvas
                id="ticket-qr-code-invoice"
                value={qrCodeData}
                size={200}
                style={{ width: '100%', height: 'auto' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="w-full bg-primary absolute bottom-0 left-0 rounded-bl-3xl flex flex-col sm:flex-row items-center justify-between px-5 py-2 text-xs text-neutral-100 font-light">
        <p>Phí Hủy Vé: 40% giá vé nếu hủy trong vòng 24 giờ trước giờ khởi hành.</p>
        <div className="flex items-center gap-2 mt-1 sm:mt-0">
          <FaPhone className="w-3 h-3" />
          <span>+84 8888-8888 , +84 9999-9999</span>
        </div>
      </div>
    </div>
  );
};

export default PassengerInvoice;
