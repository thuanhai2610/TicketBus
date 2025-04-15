/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React ,  { useState } from 'react'
import bgImage from "../../../assets/bgimg.png";
import TopLayout from '../../../layout/toppage/TopLayout';
import RootLayout from '../../../layout/RootLayout';
import PassengerData from './passengerdata/PassengerData';
import BookingStatus from './bookingstatus/BookingStatus';
import { useNavigate, useLocation} from 'react-router-dom';
import { useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Checkout = () => {
  const location = useLocation();
  const { tripInfo, selectedSeats, vehicleId, seatData, username, tripId,  ticketId } = location.state || {};
  const [passengerInfo, setPassengerInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
  });
  const navigate = useNavigate(); 
  useEffect(() => {
    // Hiển thị thông báo ngay khi vào trang
    toast.info('Bạn có 5 phút để giữ ghế và thanh toán. Vui lòng hoàn tất trước khi hết giờ!', {
      position: "top-center",
      autoClose: 5000,
    });

    const timeout = setTimeout(() => {
      if (!ticketId) return;

      // Hiển thị thông báo khi hết 5 phút
      toast.error('Bạn đã chờ quá lâu. Vé đã bị hủy.', {
        position: "top-center",
        autoClose: 5000,
      });

      // Chuyển hướng về trang bus-tickets sau 5 giây
      setTimeout(() => {
        navigate('/bus-tickets');
      }, 5000);
    }, 5 * 60 * 1000); // 5 phút

    return () => clearTimeout(timeout); // Dọn dẹp nếu user rời trang
  }, [ticketId, navigate]);
    
  return (
    <div>
        {/* Top Layout */}
        <TopLayout
        bgImg={bgImage}
        title={'Checkout '}
      />

      <RootLayout className="space-y-12 w-full pb-16 py-8">
        <div className="w-full grid grid-cols-7 items-start gap-44 relative">

            {/* Passenger Detail */}
            <PassengerData setPassengerInfo={setPassengerInfo} passengerInfo={passengerInfo}/>
            {/* Ticket Report Status */}
            <BookingStatus 
            ticketId={ticketId}
            tripInfo={tripInfo}
            selectedSeats={selectedSeats}
            vehicleId={vehicleId}
            seatData={seatData} 
            setPassengerInfo={setPassengerInfo}
            passengerInfo={passengerInfo}
            />
            

        </div>
      </RootLayout>
      <ToastContainer position="top-center" autoClose={5000} />

    </div>
  )
}

export default Checkout
