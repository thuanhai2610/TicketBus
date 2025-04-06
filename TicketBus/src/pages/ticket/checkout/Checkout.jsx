import React from 'react'
import bgImage from "../../../assets/bgimg.png";
import TopLayout from '../../../layout/toppage/TopLayout';
import RootLayout from '../../../layout/RootLayout';
import PassengerData from './passengerdata/PassengerData';
import BookingStatus from './bookingstatus/BookingStatus';
const Checkout = () => {
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
            <PassengerData />
            {/* Ticket Report Status */}
            <BookingStatus />

        </div>
      </RootLayout>

    </div>
  )
}

export default Checkout
