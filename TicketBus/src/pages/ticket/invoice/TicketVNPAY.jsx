/* eslint-disable no-unused-vars */
import React, { useRef, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { FaArrowRightLong } from 'react-icons/fa6';
import axios from 'axios';
import { toPng } from 'html-to-image';
import download from 'downloadjs';
import TopLayout from '../../../layout/toppage/TopLayout';
import RootLayout from '../../../layout/RootLayout';
import PassengerInvoice from '../../../pages/ticket/invoice/passengerinvoice/PassengerInvoice';
import CompanyInvoice from '../../../pages/ticket/invoice/company/CompanyInvoice';

// Mock background image (replace with actual URL in production)
import bgImg from "../../../assets/bgimg.png"

const TicketVNPAY = () => {
  const inVoiceRef = useRef(null);
  const [paymentData, setPaymentData] = useState(null);
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ticketDetails, setTicketDetails] = useState(null);
  const [tripDetails, setTripDetails] = useState(null);
  const [vehicleDetails, setVehicleDetails] = useState(null);
  const [qrCodeData, setQrCodeData] = useState(null);
  const navigate = useNavigate();
  const [finalAmount, setFinalAmount] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const queryString = urlParams.toString();
        const paymentResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/payments/vnpay/return?${queryString}`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        setFinalAmount(paymentResponse.data.finalAmount);
        setPaymentData(paymentResponse.data);
        if (paymentResponse.data.code === '24') {
          setError('Thanh toán không thành công. Vui lòng thử lại.');
          navigate('/');
          return;
        }
        if (paymentResponse.data.paymentId) {
          const ticketResponse = await axios.get(
            `${import.meta.env.VITE_API_URL}/payments/tickets/ticketvnpay`,
            {
              params: { paymentId: paymentResponse.data.paymentId },
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );
          setTicketData(ticketResponse.data);
          if (ticketResponse.data.ticketId) {
            const ticketDetailsResponse = await axios.get(
              `${import.meta.env.VITE_API_URL}/tickets/vn-pay/details?ticketId=${ticketResponse.data.ticketId}`,
              {
                headers: { 'Content-Type': 'application/json' },
              }
            );
            setTicketDetails(ticketDetailsResponse.data);
            if (ticketDetailsResponse.data.tripId) {
              const tripDetailsResponse = await axios.get(
                `${import.meta.env.VITE_API_URL}/trip/tripdetails?tripId=${ticketDetailsResponse.data.tripId}`,
                {
                  headers: { 'Content-Type': 'application/json' },
                }
              );
              setTripDetails(tripDetailsResponse.data);
              if (tripDetailsResponse.data.vehicleId) {
                const vehicleDetailsResponse = await axios.get(
                  `${import.meta.env.VITE_API_URL}/vehicle/get/details?vehicleId=${tripDetailsResponse.data.vehicleId}`,
                  {
                    headers: { 'Content-Type': 'application/json' },
                  }
                );
                setVehicleDetails(vehicleDetailsResponse.data);
                const qrData = JSON.stringify({
                  ticketId: ticketDetailsResponse.data.ticketId,
                  status: 'Paid',
                  fullName: ticketDetailsResponse.data.fullName,
                  departurePoint: tripDetailsResponse.data.departurePoint,
                  destinationPoint: tripDetailsResponse.data.destinationPoint,
                  departureTime: tripDetailsResponse.data.departureTime,
                  seats: ticketDetailsResponse.data.seatNumber,
                  seatsLength: ticketDetailsResponse.data.seatNumber.length,
                  licensePlate: vehicleDetailsResponse.data.licensePlate || 'Unknown', // Corrected typo
                });
                setQrCodeData(qrData);
              }
            }
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentData();
  }, [navigate]);

  if (loading) return <div><h1>Đang xử lý thanh toán...</h1></div>;
  if (error) return <div><h1>Lỗi thanh toán</h1><p>{error}</p></div>;

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

  const departureTime = formatTime(tripDetails?.departureTime);
  const arrivalTime = formatTime(tripDetails?.arrivalTime);

  // Desktop Layout (unchanged)
  const DesktopInvoice = (
    <div className="space-y-12 w-full pb-16 py-8 bg-white">
      <div className="w-full flex items-center justify-center">
        <div
          ref={inVoiceRef}
          className="w-[90%] grid grid-cols-5 bg-white rounded-3xl border border-neutral-200 shadow-sm relative"
        >
          <PassengerInvoice
            qrCodeData={qrCodeData}
            licensePlate={vehicleDetails?.lisencePlate || 'Không xác định'} // Corrected typo
            ticketId={ticketDetails?.ticketId || ''}
            passengerInfo={ticketDetails}
            passengerName={ticketDetails?.fullName || 'Khách hàng'}
            totalSeats={ticketDetails?.seatNumber || []}
            totalPassengers={ticketDetails?.seatNumber?.length || 0}
            pickupStation={ticketDetails?.address || 'Chưa có địa chỉ'}
            departurePoint={tripDetails?.departurePoint || 'Chưa rõ'}
            destinationPoint={tripDetails?.destinationPoint || 'Chưa rõ'}
            departureTime={tripDetails?.departureTime || '00:00'}
            arrivalTime={tripDetails?.arrivalTime || '00:00'}
            vehicleId={vehicleDetails?.vehicleId || 'Không xác định'}
            totalPrice={ticketDetails?.ticketPrice || 0}
            bookedAt={ticketDetails?.bookedAt}
            finalAmount={finalAmount}
          />
          <CompanyInvoice
            ticketId={ticketDetails?.ticketId || ''}
            bookedAt={ticketDetails?.bookedAt}
            licensePlate={vehicleDetails?.lisencePlate || 'Không xác định'} // Corrected typo
            passengerInfo={ticketDetails}
            passengerName={ticketDetails?.fullName || 'Khách hàng'}
            totalSeats={ticketDetails?.seatNumber || []}
            totalPassengers={ticketDetails?.seatNumber?.length || 0}
            pickupStation={ticketDetails?.address || 'Chưa có địa chỉ'}
            departurePoint={tripDetails?.departurePoint || 'Chưa rõ'}
            destinationPoint={tripDetails?.destinationPoint || 'Chưa rõ'}
            departureTime={tripDetails?.departureTime || '00:00'}
            arrivalTime={tripDetails?.arrivalTime || '00:00'}
            vehicleId={vehicleDetails?.vehicleId || 'Không xác định'}
            totalPrice={ticketDetails?.ticketPrice || 0}
            finalAmount={finalAmount}
            billStatus="Đã thanh toán"
          />
          <div className="absolute -top-3 right-[18.8%] h-6 w-6 rounded-full bg-neutral-50" />
          <div className="absolute -bottom-3 right-[18.8%] h-6 w-6 rounded-full bg-neutral-50" />
        </div>
      </div>
      <div className="w-full flex justify-center items-center">
        <button
          onClick={handleDownload}
          className="w-fit px-6 py-3 bg-blue-500 text-white font-bold text-lg rounded-lg"
        >
          Tải hóa đơn
        </button>
      </div>
    </div>
  );

  // Mobile Layout (styled like Invoice's mobile layout)
  const MobileInvoice = (
    <div className="space-y-8 w-full pb-16 py-6 bg-white">
      <div className="w-full flex items-center justify-center">
        <div
          ref={inVoiceRef}
          className="w-full bg-white rounded-lg border border-neutral-200 shadow-md"
        >
          {/* Header */}
          <div className="bg-primary text-white text-center py-4 rounded-t-lg">
            <h2 className="text-xl font-semibold">
              Xin Chào, {ticketDetails?.fullName || 'Khách hàng'}.
            </h2>
            <p className="text-sm">Xác nhận thanh toán VNPAY thành công!</p>
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
                Mã Vé: {ticketDetails?.ticketId || 'N/A'}
              </p>
              <p className="text-xs text-neutral-500">
                Mã Xe: {vehicleDetails?.vehicleId || 'Không xác định'} | Biển Số Xe: {vehicleDetails?.lisencePlate || 'Không xác định'}
              </p>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-neutral-700">
                  {tripDetails?.departurePoint || 'Chưa rõ'}
                </p>
                <p className="text-xs text-blue-500">{departureTime}</p>
              </div>
              <div className="text-center">
                <FaArrowRightLong className="text-neutral-400" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-neutral-700">
                  {tripDetails?.destinationPoint || 'Chưa rõ'}
                </p>
                <p className="text-xs text-blue-500 font-medium">{arrivalTime}</p>
              </div>
            </div>
            <div className="flex justify-between items-center border-t border-dashed border-neutral-300 pt-4">
              <div>
                <p className="text-sm font-medium text-neutral-700">Ghế</p>
                <p className="text-xs font-semibold text-emerald-500">
                  {ticketDetails?.seatNumber?.join(', ') || 'N/A'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-neutral-700">
                  Giá Vé: {(finalAmount || ticketDetails?.ticketPrice || 0).toLocaleString()} VND
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
      <TopLayout bgImg={bgImg} title={'Xác nhận thanh toán VNPAY'} />
      <RootLayout className="w-full">
        {isMobile ? MobileInvoice : DesktopInvoice}
      </RootLayout>
    </div>
  );
};

export default TicketVNPAY;