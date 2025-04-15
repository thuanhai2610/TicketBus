/* eslint-disable no-unused-vars */
import React, { useRef, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { QRCodeCanvas } from 'qrcode.react';
import bgImage from '../../../assets/bgimg.png';
import TopLayout from '../../../layout/toppage/TopLayout';
import RootLayout from '../../../layout/RootLayout';
import PassengerInvoice from '../../../pages/ticket/invoice/passengerinvoice/PassengerInvoice'; // Đường dẫn nếu giống Invoice
import CompanyInvoice from '../../../pages/ticket/invoice/company/CompanyInvoice'; // Đường dẫn nếu giống Invoice
import { toPng } from 'html-to-image';
import download from 'downloadjs';
import axios from 'axios';


const TicketVNPAY = () => {
  const inVoiceRef = useRef(null);
  const [paymentData, setPaymentData] = useState(null);
  const [ticketData, setTicketData] = useState(null); // New state for ticket data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ticketDetails, setTicketDetails] = useState(null);
  const [tripDetails, setTripDetails] = useState(null);
  const [vehicleDetails, setVehicleDetails] = useState(null);
    const [qrCodeData, setQrCodeData] = useState(null);
  
  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        // Step 1: Get query parameters from URL and fetch payment data
        const urlParams = new URLSearchParams(window.location.search);
        const queryString = urlParams.toString();

        const paymentResponse = await axios.get(
          `http://localhost:3001/payments/vnpay/return?${queryString}`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        setPaymentData(paymentResponse.data);

        // Step 2: If paymentId exists, fetch ticket data
        if (paymentResponse.data.paymentId) {
          const ticketResponse = await axios.get(
            `http://localhost:3001/payments/tickets/ticketvnpay`, // Adjust endpoint as needed
            {
              params: { paymentId: paymentResponse.data.paymentId }, // Pass paymentId as query param
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );

          setTicketData(ticketResponse.data);
          if (ticketResponse.data.ticketId) {
            // Step 3: Fetch ticket details using ticketId
            console.log('Fetching ticket details with ticketId:', ticketResponse.data.ticketId);
            const ticketDetailsResponse = await axios.get(
              `http://localhost:3001/tickets/vn-pay/details?ticketId=${ticketResponse.data.ticketId}`,
              {
                headers: { 'Content-Type': 'application/json' },
              }
            );
            console.log('Ticket details response:', ticketDetailsResponse.data);
            setTicketDetails(ticketDetailsResponse.data);
            if (ticketDetailsResponse.data.tripId) {
                // Step 4: Fetch trip details using tripId
          
                const tripDetailsResponse = await axios.get(
                  `http://localhost:3001/trip/tripdetails?tripId=${ticketDetailsResponse.data.tripId}`,
                  {
                    headers: { 'Content-Type': 'application/json' },
                  }
                );
                console.log('Trip details response:', tripDetailsResponse.data);
                setTripDetails(tripDetailsResponse.data);
                if (tripDetailsResponse.data.vehicleId) {
                    // Step 5: Fetch vehicle details using vehicleId
                    console.log('Fetching vehicle details with vehicleId:', tripDetailsResponse.data.vehicleId);
                    const vehicleDetailsResponse = await axios.get(
                      `http://localhost:3001/vehicle/get/details?vehicleId=${tripDetailsResponse.data.vehicleId}`,
                      {
                        headers: { 'Content-Type': 'application/json' },
                      }
                    );
                    console.log('Vehicle details response:', vehicleDetailsResponse.data);
                    setVehicleDetails(vehicleDetailsResponse.data);
                    const qrData = JSON.stringify({
                      ticketId: ticketDetailsResponse.data.ticketId,
                      status: 'Paid',
                      fullName: ticketDetailsResponse.data.fullName,
                      departurePoint: tripDetailsResponse.data.departurePoint,
                      destinationPoint: tripDetailsResponse.data.destinationPoint,
                      departureTime: tripDetailsResponse.data.departureTime,
                      // seats: selectedSeats,
                      seats: ticketDetailsResponse.data.seatNumber,
                      seatsLength: ticketDetailsResponse.data.seatNumber.length,

                      lisencePlate: vehicleDetailsResponse.data.lisencePlate || 'Unknown',
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
  }, []);

  if (loading) return <div><h1>Processing Payment...</h1></div>;
  if (error) return <div><h1>Payment Error</h1><p>{error}</p></div>;


   const handleDownload = async () => {
      if (inVoiceRef.current === null) return;
  
      try {
        const dataUrl = await toPng(inVoiceRef.current);
        // Download image
        download(dataUrl, 'nhismdKhoaHaiz.png');
      } catch (error) {
        console.error('Error while downloading the invoice', error);
      }
    };
  return (
    <div>
      {/* Header Layout */}
      <TopLayout bgImg={bgImage} title={'Xác nhận thanh toán VNPAY'} />
  
      <RootLayout className="space-y-12 w-full pb-16 py-8 bg-white">
        <div className="w-full flex items-center justify-center">
          {/* Hóa đơn hiển thị */}
          <div
            ref={inVoiceRef}
            className="w-[90%] grid grid-cols-5 bg-white rounded-3xl border border-neutral-200 shadow-sm relative"
          >
            {/* Phần trái: Hành khách */}
            <PassengerInvoice
              qrCodeData={qrCodeData}
              lisencePlate={vehicleDetails?.lisencePlate || 'Không xác định'}
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
              totalPrice={ticketDetails.ticketPrice}
              bookedAt={ticketDetails?.bookedAt}
            />
  
            {/* Phần phải: Công ty */}
            <CompanyInvoice
              ticketId={ticketDetails?.ticketId || ''}
              bookedAt={ticketDetails?.bookedAt}
              lisencePlate={vehicleDetails?.lisencePlate || 'Không xác định'}
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
              totalPrice={ticketDetails.ticketPrice}
              billStatus="Đã thanh toán"
            />
  
            {/* Các góc cắt */}
            <div className="absolute -top-3 right-[18.8%] h-6 w-6 rounded-full bg-neutral-50" />
            <div className="absolute -bottom-3 right-[18.8%] h-6 w-6 rounded-full bg-neutral-50" />
          </div>
        </div>
  
        {/* Nút tải hóa đơn */}
        <div className="w-full flex justify-center items-center">
          <button
            onClick={handleDownload}
            className="w-fit px-6 py-3 bg-primary text-white font-bold text-lg rounded-lg"
          >
            Tải hóa đơn
          </button>
        </div>
      </RootLayout>
    </div>
  );
  
  
};

export default TicketVNPAY;