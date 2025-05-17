/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import bgImage from '../../../assets/bgimg.png';
import TopLayout from '../../../layout/toppage/TopLayout';
import RootLayout from '../../../layout/RootLayout';
import PassengerData from './passengerdata/PassengerData';
import BookingStatus from './bookingstatus/BookingStatus';
import { useNavigate, useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { tripInfo, selectedSeats, vehicleId, seatData, username, tripId, ticketId } = location.state || {};
  const [passengerInfo, setPassengerInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  // Handle screen size changes for responsive layout
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Validate location.state and handle timeout
  useEffect(() => {
    // Check for missing critical data
    if (!ticketId || !tripId || !selectedSeats || !vehicleId) {
      toast.error('Dữ liệu đặt vé không hợp lệ. Bạn sẽ được chuyển hướng về trang chọn vé.', {
        position: 'top-center',
        autoClose: 5000,
      });
      const redirectTimer = setTimeout(() => {
        navigate('/bus-tickets');
      }, 5000);
      return () => clearTimeout(redirectTimer);
    }

    // Show initial toast notification
    const toastId = toast.info('Bạn có 5 phút để giữ ghế và thanh toán. Vui lòng hoàn tất trước khi hết giờ!', {
      position: 'top-center',
      autoClose: 5000,
    });

    // Set 5-minute timeout
    const timeout = setTimeout(() => {
      toast.error('Bạn đã chờ quá lâu. Vé đã bị hủy.', {
        position: 'top-center',
        autoClose: 5000,
      });
      setTimeout(() => {
        navigate('/bus-tickets');
      }, 5000);
    }, 5 * 60 * 1000); // 5 minutes

    // Cleanup on unmount
    return () => {
      clearTimeout(timeout);
      toast.dismiss(toastId);
    };
  }, [navigate, ticketId, tripId, selectedSeats, vehicleId]);

  // Desktop Layout
  const DesktopCheckout = (
    <div className="w-full space-y-12 pb-16 bg-white dark:bg-primary">
      <TopLayout bgImg={bgImage} title="Thanh toán vé xe" />
      <RootLayout className="space-y-12 w-full pb-1 py-8">
        <div className="w-full grid grid-cols-7 items-start gap-8">
          {/* Passenger Detail */}
          <div className="col-span-4">
            <PassengerData setPassengerInfo={setPassengerInfo} passengerInfo={passengerInfo} />
          </div>
          {/* Ticket Report Status */}
          <div className="col-span-3">
            <BookingStatus
              ticketId={ticketId}
              tripInfo={tripInfo}
              selectedSeats={selectedSeats}
              vehicleId={vehicleId}
              seatData={seatData}
              setPassengerInfo={setPassengerInfo}
              passengerInfo={passengerInfo}
              username={username}
              tripId={tripId}
            />
          </div>
        </div>
      </RootLayout>
      <ToastContainer position="top-center" autoClose={5000} />
    </div>
  );

  // Mobile Layout
  const MobileCheckout = (
    <div className="w-full space-y-8 pb-1 bg-white dark:bg-primary px-4">
      <TopLayout bgImg={bgImage} title="Thanh toán vé xe" />
      <RootLayout className="space-y-2 w-full pb-1 py-1">

        <div className="w-full flex flex-col space-y-3">

            <PassengerData setPassengerInfo={setPassengerInfo} passengerInfo={passengerInfo} />
 

            <BookingStatus
              ticketId={ticketId}
              tripInfo={tripInfo}
              selectedSeats={selectedSeats}
              vehicleId={vehicleId}
              seatData={seatData}
              setPassengerInfo={setPassengerInfo}
              passengerInfo={passengerInfo}
              username={username}
              tripId={tripId}
            />
   
        </div>


      </RootLayout>
      <ToastContainer position="top-center" autoClose={5000} />
    </div>
  );

  // Show error if critical data is missing
  if (!ticketId || !tripId || !selectedSeats || !vehicleId) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-white dark:bg-primary">
        <div className="text-center space-y-4">
          <h2 className="text-lg text-neutral-600 font-bold dark:text-neutral-50">
            Lỗi: Dữ liệu đặt vé không hợp lệ
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-300">
            Vui lòng chọn lại vé từ trang danh sách chuyến xe.
          </p>
          <button
            onClick={() => navigate('/bus-tickets')}
            className="bg-primary hover:bg-primary/90 text-neutral-50 font-medium py-2 px-4 rounded-lg"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return isMobile ? MobileCheckout : DesktopCheckout;
};

export default Checkout;