/* eslint-disable no-unused-vars */
import React ,  { useState } from 'react'
import bgImage from "../../../assets/bgimg.png";
import TopLayout from '../../../layout/toppage/TopLayout';
import RootLayout from '../../../layout/RootLayout';
import PassengerData from './passengerdata/PassengerData';
import BookingStatus from './bookingstatus/BookingStatus';
import { useLocation} from 'react-router-dom';
import { useEffect } from 'react';
const Checkout = () => {
  const location = useLocation();
  const { tripInfo, selectedSeats, vehicleId, seatData, username, tripId,  ticketId } = location.state || {};
  const [passengerInfo, setPassengerInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
  });
    useEffect(() => {
      const timeout = setTimeout(async () => {
        if (!ticketId) return;
    
        try {
          const token = localStorage.getItem('token');
          if (!token) throw new Error('No token found. Please log in.');
    
          await axios.put(
            `http://localhost:3001/tickets/${ticketId}`,
            { status: 'Cancelled' },
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
            }
          );
    
          console.warn('Tự động hủy vé do quá hạn thanh toán.');
          setError('Bạn đã chờ quá lâu. Vé đã bị huỷ.');
          navigate('/bus-tickets');
        } catch (err) {
          console.error('Lỗi khi tự động hủy vé:', err);
        }
      }, 5 * 60 * 1000); // 5 phút
    
      return () => clearTimeout(timeout); // Dọn dẹp nếu user rời trang
    }, [ticketId]);
    
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

    </div>
  )
}

export default Checkout
