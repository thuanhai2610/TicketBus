import React ,  { useState } from 'react'
import bgImage from "../../../assets/bgimg.png";
import TopLayout from '../../../layout/toppage/TopLayout';
import RootLayout from '../../../layout/RootLayout';
import PassengerData from './passengerdata/PassengerData';
import BookingStatus from './bookingstatus/BookingStatus';
import { useLocation} from 'react-router-dom';
const Checkout = () => {
  const location = useLocation();
  const { tripInfo, selectedSeats, vehicleId, seatData, username, tripId,  ticketId } = location.state || {};
  const [passengerInfo, setPassengerInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
  });
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
