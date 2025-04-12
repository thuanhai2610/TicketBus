/* eslint-disable no-unused-vars */
import React, { useRef, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import bgImage from '../../../assets/bgimg.png';
import TopLayout from '../../../layout/toppage/TopLayout';
import RootLayout from '../../../layout/RootLayout';
import PassengerInvoice from './passengerinvoice/PassengerInvoice';
import CompanyInvoice from './company/CompanyInvoice';
import { toPng } from 'html-to-image';
import download from 'downloadjs';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import ErrorBoundary from '../invoice/ErrorBoundary'

const Invoice = () => {
  const inVoiceRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  // Destructuring an toàn
  const {
    lisencePlate = '',
    ticketId = '',
    tripInfo = {},
    selectedSeats = [],
    totalPrice = 0,
    passengerInfo = {},
    vehicleId = '',
    qrCodeData = '',
  } = location.state || {};

  useEffect(() => {
    if (!location.state || !ticketId) {
      console.warn('No state or ticketId found. Redirecting to booking page.');
      navigate('/bus-tickets');
      return;
    }

    const fetchTicket = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found. Please log in.');
        }

        const response = await axios.get(`http://localhost:3001/tickets/${ticketId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('Fetched ticket:', response.data);
        setTicket(response.data);
      } catch (error) {
        console.error('Error fetching ticket:', error);
        setFetchError(error.response?.data?.message || 'Failed to fetch ticket details.');
      }
    };

    fetchTicket();
  }, [location.state, ticketId, navigate]);

  const position = [51.505, -0.09]; // Thay bằng tọa độ thực tế nếu có

  const handleDownload = async () => {
    if (inVoiceRef.current === null) return;

    try {
      const dataUrl = await toPng(inVoiceRef.current);
      download(dataUrl, 'invoice.png');
    } catch (error) {
      console.error('Error while downloading the invoice', error);
    }
  };

  return (
    <div>
      <TopLayout bgImg={bgImage} title={'Collect your invoice'} />
      <RootLayout className="space-y-12 w-full pb-16 py-8 bg-white">
        {fetchError && (
          <div className="text-red-500 text-center">{fetchError}</div>
        )}
        <div className="w-full flex items-center justify-center">
          <div
            ref={inVoiceRef}
            className="w-[90%] grid grid-cols-5 bg-white rounded-3xl border border-neutral-200 shadow-sm relative"
          >
            <PassengerInvoice
              qrCodeData={qrCodeData}
              lisencePlate={lisencePlate}
              ticketId={ticketId}
              passengerName={passengerInfo?.fullName || 'N/A'}
              totalSeats={selectedSeats}
              totalPassengers={selectedSeats.length}
              pickupStation={passengerInfo?.address || 'N/A'}
              departurePoint={tripInfo?.departurePoint || 'Nha Trang'}
              destinationPoint={tripInfo?.destinationPoint || 'Da Nang'}
              departureTime={tripInfo?.departureTime || '09:05 AM'}
              arrivalTime={tripInfo?.arrivalTime || '04:10 PM'}
              vehicleId={vehicleId || '79D1-72778'}
              totalPrice={totalPrice || 500000}
              bookedAt={ticket?.bookedAt}
            />
            <CompanyInvoice
              ticketId={ticketId}
              bookedAt={ticket?.bookedAt}
              lisencePlate={lisencePlate}
              passengerName={passengerInfo?.fullName || 'N/A'}
              totalSeats={selectedSeats}
              totalPassengers={selectedSeats.length}
              pickupStation={passengerInfo?.address || 'N/A'}
              departurePoint={tripInfo?.departurePoint || 'Nha Trang'}
              destinationPoint={tripInfo?.destinationPoint || 'Da Nang'}
              departureTime={tripInfo?.departureTime || '09:05 AM'}
              arrivalTime={tripInfo?.arrivalTime || '04:10 PM'}
              vehicleId={vehicleId || '79D1-72778'}
              totalPrice={totalPrice || 500000}
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
            Download Ticket
          </button>
        </div>
        <ErrorBoundary>
  {ticketId && (
    <div style={{ height: '400px', width: '100%', marginTop: '20px' }}>
      <MapContainer
        center={[51.505, -0.09]}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
    </div>
  )}
</ErrorBoundary>
      </RootLayout>
    </div>
  );
};

export default Invoice;