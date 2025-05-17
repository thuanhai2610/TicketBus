/* eslint-disable no-unused-vars */
import React, { useRef, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { FaArrowRightLong } from "react-icons/fa6";

import axios from 'axios';
import { toPng } from 'html-to-image';
import download from 'downloadjs';
import TopLayout from '../../../layout/toppage/TopLayout';
import RootLayout from '../../../layout/RootLayout';
import PassengerInvoice from './passengerinvoice/PassengerInvoice';
import CompanyInvoice from './company/CompanyInvoice';

// Mock background image (replace with actual URL in production)
import bgImage from "../../../assets/bgimg.png"

const Invoice = () => {
  const inVoiceRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  // Extract data from state
  const {
    lisencePlate, // Corrected typo from lisencePlate
    ticketId,
    tripInfo,
    selectedSeats,
    totalPrice,
    passengerInfo,
    vehicleId,
    qrCodeData,
    finalAmount,
  } = location.state || {};

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchTicket = async () => {
      if (!ticketId) {
        setFetchError('Ticket ID is missing. Unable to fetch ticket details.');
        return;
      }

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found. Please log in.');
        }

        const response = await axios.get(`${import.meta.env.VITE_API_URL}/tickets/${ticketId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTicket(response.data);
      } catch (error) {
        console.error('Error fetching ticket:', error);
        setFetchError(error.response?.data?.message || 'Failed to fetch ticket details.');
      }
    };

    fetchTicket();
  }, [ticketId]);

  useEffect(() => {
    if (!location.state || !ticketId) {
      console.warn('No state or ticketId found. Redirecting to booking page.');
      navigate('/bus-tickets');
    }
  }, [location.state, ticketId, navigate]);

  const handleDownload = async () => {
    if (inVoiceRef.current === null) return;

    try {
      const dataUrl = await toPng(inVoiceRef.current);
      download(dataUrl, 'nhismdKhoaHaiz.png');
    } catch (error) {
      console.error('Error while downloading the invoice', error);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "Unknown Time";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = date.toLocaleString('default', { month: 'short' });
    const hours = String(date.getHours() % 12 || 12).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = date.getHours() >= 12 ? "PM" : "AM";
    return `${day} ${month}, ${hours}:${minutes} ${ampm}`;
  };

  const departureTime = formatTime(tripInfo?.departureTime);
  const arrivalTime = formatTime(tripInfo?.arrivalTime);

  // Desktop Layout
  const DesktopInvoice = (
    <div className="space-y-12 w-full pb-16 py-8 bg-white">
      <div className="w-full flex items-center justify-center">
        <div
          ref={inVoiceRef}
          className="w-[90%] grid grid-cols-5 bg-white rounded-3xl border border-neutral-200 shadow-sm relative"
        >
          <PassengerInvoice
            qrCodeData={qrCodeData}
            lisencePlate={lisencePlate}
            ticketId={ticketId}
            passengerInfo={passengerInfo}
            passengerName={passengerInfo?.fullName || 'NhismdKhoaHaiz'}
            totalSeats={selectedSeats}
            totalPassengers={selectedSeats?.length || 0}
            pickupStation={passengerInfo?.address || 'Nhism dKhoa thHai'}
            departurePoint={tripInfo?.departurePoint || 'Nha Trang'}
            destinationPoint={tripInfo?.destinationPoint || 'Da Nang'}
            departureTime={tripInfo?.departureTime || '09:05 AM'}
            arrivalTime={tripInfo?.arrivalTime || '04:10 PM'}
            vehicleId={vehicleId || '79D1-72778'}
            totalPrice={totalPrice || 500000}
            bookedAt={ticket?.bookedAt}
            finalAmount={finalAmount}
          />
          <CompanyInvoice
            ticketId={ticketId}
            bookedAt={ticket?.bookedAt}
            lisencePlate={lisencePlate}
            passengerInfo={passengerInfo}
            passengerName={passengerInfo?.fullName || 'NhismdKhoaHaiz'}
            totalSeats={selectedSeats}
            totalPassengers={selectedSeats?.length || 0}
            pickupStation={passengerInfo?.address || 'Nhism dKhoa thHai'}
            departurePoint={tripInfo?.departurePoint || 'Nha Trang'}
            destinationPoint={tripInfo?.destinationPoint || 'Da Nang'}
            departureTime={tripInfo?.departureTime || '09:05 AM'}
            arrivalTime={tripInfo?.arrivalTime || '04:10 PM'}
            vehicleId={vehicleId || '79D1-72778'}
            totalPrice={totalPrice || 500000}
            finalAmount={finalAmount}
            billStatus="Bill Paid"
          />
          <div className="absolute -top-3 right-[18.8%] h-6 w-6 rounded-full bg-neutral-50" />
          <div className="absolute -bottom-3 right-[18.8%] h-6 w-6 rounded-full bg-neutral-50" />
        </div>
      </div>
      <div className="w-full flex justify-center items-center">
        <button
          onClick={handleDownload}
          className="w-fit px-6 py-3 bg-primary text-neutral-50 font-bold text-lg rounded-lg"
        >
          Tải Vé
        </button>
      </div>
    </div>
  );

  // Mobile Layout (Simplified like the image)
  const MobileInvoice = (
    <div className="space-y-8 w-full pb-16 py-6 bg-white">
      <div className="w-full flex items-center justify-center">
        <div
          ref={inVoiceRef}
          className="w-[90%] bg-white rounded-lg border border-neutral-200 shadow-md"
        >
          {/* Header */}
          <div className="bg-primary text-white text-center py-4 rounded-t-lg">
            <h2 className="text-xl font-semibold">
              Xin Chào, {passengerInfo?.fullName || 'NhismdKhoaHaiz'}.
            </h2>
            <p className="text-sm">Vé của bạn đã được xác nhận!</p>
          </div>
          {/* QR Code */}
          <div className="flex justify-center py-4">
            {qrCodeData ? (
              <QRCodeCanvas id="ticket-qr-code" value={qrCodeData} size={120} />
            ) : (
              <p className="text-sm text-neutral-500">QR Code not available</p>
            )}
          </div>
          {/* Ticket Info */}
          <div className="px-4 pb-4 space-y-4">
            <div className="text-center border-b border-dashed border-neutral-300 pb-4">
              <p className="text-xs font-semibold text-neutral-700 text-center mb-2">
                Mã Vé: {ticketId || 'N/A'}
              </p>
              <p className="text-xs text-neutral-500">
                Mã Xe: {vehicleId || '79D1-72778'} | Biển Số Xe: {lisencePlate || 'N/A'}
              </p>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-neutral-700">
                  {tripInfo?.departurePoint || 'Nha Trang'}
                </p>
                <p className="text-xs text-blue-500 ">{departureTime}</p>
              </div>
              <div className="text-center">
                <FaArrowRightLong className="text-neutral-400" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-neutral-700">
                  {tripInfo?.destinationPoint || 'Da Nang'}
                </p>
                <p className="text-xs text-blue-500 font-medium">{arrivalTime}</p>
              </div>
            </div>
            <div className="flex justify-between items-center border-t border-dashed border-neutral-300 pt-4">
              <div>
                <p className="text-sm font-medium text-neutral-700">Ghế</p>
                <p className="text-xs font-semibold text-emerald-500">
                  {selectedSeats?.join(', ') || 'N/A'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-neutral-700">
                  Giá Vé: {(finalAmount || totalPrice || 500000).toLocaleString()} VND
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full flex justify-center items-center">
        <button
          onClick={handleDownload}
          className="w-fit px-6 py-2 bg-primary text-neutral-50 font-semibold text-base rounded-lg"
        >
          Tải Vé
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <TopLayout bgImg={bgImage} title={'Collect your invoice'} />
      <RootLayout className="w-full">
        {isMobile ? MobileInvoice : DesktopInvoice}
      </RootLayout>
    </div>
  );
};

export default Invoice;