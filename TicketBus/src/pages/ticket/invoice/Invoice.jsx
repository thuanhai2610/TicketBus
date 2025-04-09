/* eslint-disable no-unused-vars */
import React, { useRef, useEffect,  useState } from 'react';
import { useLocation } from 'react-router-dom'; // Import useLocation to access state
import bgImage from '../../../assets/bgimg.png';
import TopLayout from '../../../layout/toppage/TopLayout';
import RootLayout from '../../../layout/RootLayout';
import PassengerInvoice from './passengerinvoice/PassengerInvoice';
import CompanyInvoice from './company/CompanyInvoice';
import { toPng } from 'html-to-image';
import download from 'downloadjs';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
const Invoice = () => {
  const inVoiceRef = useRef(null);
  const location = useLocation(); // Access the state passed via navigate
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null); 
  const [fetchError, setFetchError] = useState(null); 
  // Extract data from state
  const {
    lisencePlate,
    ticketId,
    tripInfo,
    selectedSeats,
    totalPrice,
    passengerInfo,
    vehicleId,
  } = location.state || {};
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
      // Download image
      download(dataUrl, 'nhismdKhoaHaiz.png');
    } catch (error) {
      console.error('Error while downloading the invoice', error);
    }
  };

  return (
    <div>
      {/* Top Layout */}
      <TopLayout bgImg={bgImage} title={'Collect your invoice'} />

      <RootLayout className="space-y-12 w-full pb-16 py-8 bg-white">
        <div className="w-full flex items-center justify-center">
          {/* Invoice card */}
          <div
            ref={inVoiceRef}
            className="w-[90%] grid grid-cols-5 bg-white rounded-3xl border border-neutral-200 shadow-sm relative"
          >
            {/* Left side passenger */}
            <PassengerInvoice
             lisencePlate= { lisencePlate}
              ticketId= {ticketId}
              passengerName={passengerInfo?.fullName || 'NhismdKhoaHaiz'}
              totalSeats={selectedSeats}
              // totalPassengers={selectedSeats.length}
              pickupStation={passengerInfo?.address || 'Nhism dKhoa thHai'}
              departurePoint={tripInfo?.departurePoint || 'Nha Trang'}
              destinationPoint={tripInfo?.destinationPoint || 'Da Nang'}
              departureTime={tripInfo?.departureTime || '09:05 AM'}
              arrivalTime={tripInfo?.arrivalTime || '04:10 PM'}
              vehicleId={vehicleId || '79D1-72778'}
              totalPrice={totalPrice || 500000}
              bookedAt={ticket?.bookedAt}
            />
            {/* Right side company */}
            <CompanyInvoice
                         ticketId= {ticketId}
                         bookedAt={ticket?.bookedAt}
                         lisencePlate={ lisencePlate}
              passengerName={passengerInfo?.fullName || 'NhismdKhoaHaiz'}
              totalSeats={selectedSeats }
              totalPassengers={selectedSeats.length}
              pickupStation={passengerInfo?.address || 'Nhism dKhoa thHai'}
              departurePoint={tripInfo?.departurePoint || 'Nha Trang'}
              destinationPoint={tripInfo?.destinationPoint || 'Da Nang'}
              departureTime={tripInfo?.departureTime || '09:05 AM'}
              arrivalTime={tripInfo?.arrivalTime || '04:10 PM'}
              vehicleId={vehicleId || '79D1-72778'}
              totalPrice={totalPrice || 500000}
              billStatus="Bill Paid"
            />

            {/* Cut circle */}
            <div className="absolute -top-3 right-[18.8%] h-6 w-6 rounded-full bg-neutral-50" />
            <div className="absolute -bottom-3 right-[18.8%] h-6 w-6 rounded-full bg-neutral-50" />
          </div>
        </div>

        {/* Download invoice card button */}
        <div className="w-full flex justify-center items-center">
          <button
            onClick={handleDownload}
            className="w-fit px-6 py-3 bg-primary text-neutral-50 font-bold text-lg rounded-lg"
          >
            Download Ticket
          </button>
        </div>
      </RootLayout>
    </div>
  );
};

export default Invoice;