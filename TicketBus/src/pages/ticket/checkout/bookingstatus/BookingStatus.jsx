import React from 'react';
import { FaArrowRightLong } from 'react-icons/fa6';
import { Link } from 'react-router-dom';

const BookingStatus = ({ tripInfo, selectedSeats, vehicleId, seatData }) => {
  // Tính tổng giá dựa trên selectedSeats và seatData
  const totalPrice = selectedSeats?.reduce((total, seatId) => {
    const seat = seatData?.find((seat) => seat.id === seatId);
    return total + (seat ? seat.price : 0);
  }, 0) || 111;

  return (
    <div className="w-full col-span-3 sticky top-20 space-y-7">
      <div className="w-full bg-neutral-50 rounded-xl py-4 px-6 border border-neutral-200 shadow-sm space-y-5">
        <h1 className="text-lg text-neutral-700 font-bold text-center border-b border-neutral-200 pb-4">
          Your Ticket Report Status
        </h1>
        <div className="space-y-5">
          <div className="space-y-2 w-full">
            <h1 className="text-base text-neutral-700 font-medium">Your Destination</h1>

            <div className="space-y-0.5 w-full">
              <div className="w-full flex items-center justify-between gap-x-5">
                <p className="text-sm text-neutral-400 font-normal">From</p>
                <p className="text-sm text-neutral-400 font-normal">To</p>
              </div>

              <div className="w-full flex items-center justify-between gap-x-4">
                <h1 className="text-sm text-neutral-600 font-normal">
                  {tripInfo?.departurePoint || 'Unknown Departure'}{' '}
                  <span className="font-medium">
                    ({tripInfo?.departureTime
                      ? new Date(tripInfo.departureTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Unknown Time'})
                  </span>
                </h1>
                <div className="flex-1 border-dashed border border-neutral-300" />
                <h1 className="text-sm text-neutral-600 font-normal">
                  {tripInfo?.destinationPoint || 'Unknown Destination'}{' '}
                  <span className="font-medium">
                    ({tripInfo?.arrivalTime
                      ? new Date(tripInfo.arrivalTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Unknown Time'})
                  </span>
                </h1>
              </div>

              <div className="w-full flex items-center justify-between gap-x-4 !mt-1.5">
                <h1 className="text-sm text-neutral-600 font-normal">Bus No.:</h1>
                <h1 className="text-sm text-neutral-600 font-normal">{vehicleId || 'Unknown Bus'}</h1>
              </div>
            </div>
          </div>

          <div className="space-y-2 w-full">
            <h1 className="text-base text-neutral-700 font-medium">Your Seats</h1>
            <div className="w-full flex items-center gap-x-3">
              {selectedSeats && selectedSeats.length > 0 ? (
                selectedSeats.map((seatId) => (
                  <div
                    key={seatId}
                    className="w-9 h-9 bg-neutral-200/80 rounded-lg flex items-center justify-center text-base text-neutral-700 font-semibold"
                  >
                    {seatId}
                  </div>
                ))
              ) : (
                <p className="text-sm text-neutral-500 font-normal">No seats selected</p>
              )}
            </div>
          </div>

          <div className="space-y-2 w-full">
            <h1 className="text-base text-neutral-700 font-medium">Total Fare Price</h1>
            <div className="flex items-center justify-between gap-x-4">
              <div className="flex gap-y-0.5 flex-col">
                <h3 className="text-base text-neutral-500 font-medium">Total Price:</h3>
                <span className="text-xs text-neutral-500 font-normal">(Including all taxes)</span>
              </div>
              <p className="text-base text-neutral-600 font-semibold">
                VND {totalPrice.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-1.5">
        <Link
          to="/bus-tickets/payment"
          className="w-full bg-primary hover:bg-primary/90 text-neutral-50 font-normal py-2.5 flex items-center justify-center uppercase rounded-lg transition gap-x-2"
        >
          Proceed to Payment
          <FaArrowRightLong />
        </Link>
      </div>
    </div>
  );
};

export default BookingStatus;