/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

import React, { useEffect, useState } from 'react'
import { GiSteeringWheel } from 'react-icons/gi'
import busSeatData from '../../../../../constants/busseat/BusSeatData';
import { MdOutlineChair } from 'react-icons/md';
import { Link, Links } from 'react-router-dom';
import ErrorMessage from '../../../../../components/alertmessage/errormsg/ErrorMessage';

const BusSeat = () => {
    const [trips, setTrips] = useState([]);
      const [tripsLoading, setTripsLoading] = useState(false);
      const [tripsError, setTripsError] = useState(null);
    const fetchTrips = async (pageNum) => {
        setTripsLoading(true);
        try {
          const response = await axios.get('http://localhost:3001/trip/all', {
            params: { page: pageNum, limit },
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          
          // Handle the case where response.data is an array directly
          const newTrips = Array.isArray(response.data) ? response.data : response.data?.trips || [];
          
          setTrips((prevTrips) => (pageNum === 1 ? newTrips : [...prevTrips, ...newTrips]));
          setHasMore(newTrips.length === limit); // If we get fewer trips than the limit, there are no more to load
          
          // Extract vehicleIds to fetch vehicle data
          const vehicleIds = newTrips.map(trip => trip.vehicleId).filter(Boolean);
          if (vehicleIds.length > 0) {
            fetchVehicles(vehicleIds);
          }
        } catch (error) {
          console.error("Error fetching trips:", error);
          setTripsError(error.response?.data?.message || 'Failed to fetch trips');
          setTrips([]); // Reset trips to empty array on error
        } finally {
          setTripsLoading(false);
        }
      };
    
      useEffect(() => {
        fetchTrips(); // Fetch the first page on mount
      }, []); 
    
      const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchTrips(nextPage);
      };
    
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [showError, setShowError] = useState(false);

    const handleSeatClick = (seatId) => {
        const selectedSeats = busSeatData.find((seat) => seat.id === seatId);
        if (selectedSeats.status === 'booked') {
            return;
        };

        setSelectedSeats((prevSelectedSeats) => {
            if (prevSelectedSeats.includes(seatId)) {
                return prevSelectedSeats.filter((seat) => seat !== seatId);
            } else {
                if (prevSelectedSeats.length >= 10) {
                    setShowError(true);
                    return prevSelectedSeats;
                } else {
                    return [...prevSelectedSeats, seatId];
                }
            }
        })
    };

    useEffect(() => {
        if (showError) {
            const timer = setTimeout(() => {
                setShowError(false);
            }, 10000);
            return () => clearTimeout(timer);
        }
    }, [showError]);

    const getSeatName = (seat) => {
        if (seat.status === 'booked') {
            return 'text-red-500 cursor-not-allowed'
        } if (selectedSeats.includes(seat.id)) {
            return 'text-emerald-600 cursor-pointer'
        }
        return 'text-neutral-500 cursor-pointer'
    };

    return (
        <div className='w-full grid grid-cols-5 gap-10'>
            {/* Seat Layout */}
            <div className="col-span-3 w-full flex items-center justify-center shadow-sm rounded-xl p-4">
                <div className="w-full space-y-7">
                    <p className="text-base text-neutral-600 font-medium text-center">
                        Click on available seats to reserve your seat.
                    </p>

                    {/* Seat layout */}
                    <div className="w-full flex items-stretch gap-x-1.5 justify-center">
                        <div className="w-10 h-full flex items-center justify-center border-r-2 border-dashed border-neutral-300">
                            <GiSteeringWheel className='text-3xl mt-7 text-primary -rotate-90' />
                        </div>

                        {/* Seat rows */}
                        <div className="flex flex-col items-center">
                            <div className="flex-1 space-y-5">
                                {/* First rows */}
                                <div className="w-full h-auto grid grid-cols-9 gap-x-5 justify-end">
                                    {busSeatData.slice(0, 9).map((seat) => (
                                        <div
                                            key={seat.id}
                                            className="flex items-center gap-x-0"
                                            onClick={() => handleSeatClick(seat.id)}
                                        >
                                            <h6 className="text-base text-neutral-600 font-bold">{seat.id}</h6>
                                            <MdOutlineChair className={`text-3xl -rotate-90 ${getSeatName(seat)}`} />
                                        </div>
                                    ))}
                                </div>

                                {/* Second rows */}
                                <div className="w-full h-auto grid grid-cols-9 gap-x-5 justify-end">
                                    {busSeatData.slice(9, 18).map((seat) => (
                                        <div
                                            key={seat.id}
                                            className="flex items-center gap-x-0"
                                            onClick={() => handleSeatClick(seat.id)}
                                        >
                                            <h6 className="text-base text-neutral-600 font-bold">{seat.id}</h6>
                                            <MdOutlineChair className={`text-3xl -rotate-90 ${getSeatName(seat)}`} />
                                        </div>
                                    ))}
                                </div>

                                {/* Third rows */}
                                <div className="w-full h-auto grid grid-cols-10 gap-x-5 justify-end">
                                    <div className="col-span-9"></div>
                                    {busSeatData.slice(18, 19).map((seat) => (
                                        <div
                                            key={seat.id}
                                            className="flex items-center gap-x-0"
                                            onClick={() => handleSeatClick(seat.id)}
                                        >
                                            <h6 className="text-base text-neutral-600 font-bold">{seat.id}</h6>
                                            <MdOutlineChair className={`text-3xl -rotate-90 ${getSeatName(seat)}`} />
                                        </div>
                                    ))}
                                </div>

                                {/* Fourth rows */}
                                <div className="w-full h-auto grid grid-cols-9 gap-x-5 justify-end">
                                    {busSeatData.slice(19, 28).map((seat) => (
                                        <div
                                            key={seat.id}
                                            className="flex items-center gap-x-0"
                                            onClick={() => handleSeatClick(seat.id)}
                                        >
                                            <h6 className="text-base text-neutral-600 font-bold">{seat.id}</h6>
                                            <MdOutlineChair className={`text-3xl -rotate-90 ${getSeatName(seat)}`} />
                                        </div>
                                    ))}
                                </div>

                                {/* Fifth rows */}
                                <div className="w-full h-auto grid grid-cols-9 gap-x-5 justify-end">
                                    {busSeatData.slice(28, 37).map((seat) => (
                                        <div
                                            key={seat.id}
                                            className="flex items-center gap-x-0"
                                            onClick={() => handleSeatClick(seat.id)}
                                        >
                                            <h6 className="text-base text-neutral-600 font-bold">{seat.id}</h6>
                                            <MdOutlineChair className={`text-3xl -rotate-90 ${getSeatName(seat)}`} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reservation info */}
                    <div className="w-full flex items-center justify-center gap-6 border-t border-neutral-200 pt-5">
                        <div className="flex items-center gap-x-2">
                            <MdOutlineChair className='text-3xl text-neutral-500 -rotate-90' />
                            <p className="text-sm text-neutral-500 font-medium">Available</p>
                        </div>

                        <div className="flex items-center gap-x-2">
                            <MdOutlineChair className='text-3xl text-red-500 -rotate-90' />
                            <p className="text-sm text-neutral-500 font-medium">Booked</p>
                        </div>

                        <div className="flex items-center gap-x-2">
                            <MdOutlineChair className='text-3xl text-emerald-600 -rotate-90' />
                            <p className="text-sm text-neutral-500 font-medium">Selected</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Seat selection action */}
            <div className="col-span-2 w-full space-y-5 bg-neutral-50 rounded-xl py-4 px-6 border border-neutral-200 shadow-sm">
                <div className="w-full space-y-2">
                    <div className="w-full flex items-center justify-between">
                        <h1 className="text-lg text-neutral-600 font-medium">
                            Your Destition
                        </h1>
                        <Link to={"/bus-tickets"} className='text-sm text-primary font-normal'>
                            Change Route
                        </Link>
                    </div>

                    <div className="space-y-0.5 w-full">
                        <div className="w-full flex items-center justify-between gap-x-5">
                            <p className="text-sm text-neutral-400 font-normal">
                                From <span className="text-xs"></span>
                            </p>
                            <p className="text-sm text-neutral-400 font-normal">
                                To <span className="text-xs">(Da Nang)</span>
                            </p>
                        </div>

                        <div className="w-full flex items-center justify-between gap-x-4">
                            <h1 className="text-sm text-neutral-600 font-normal">
                                Nha Trang  <span className="font-medium">(09:05 am)</span>
                            </h1>
                            <div className="flex-1 border-dashed border border-neutral-300" />

                            <h1 className="text-sm text-neutral-600 font-normal">
                                Da Nang <span className="font-medium">(04:10 pm)</span>
                            </h1>
                        </div>

                    </div>
                    
                </div>

                <div className="w-full space-y-2">
                    <div className="w-full flex items-center justify-between">
                        <h1 className="text-lg text-neutral-600 font-medium">
                            Selected Seats
                        </h1>
                        <div className="bg-primary/20 rounded-lg py-0.5 px-1.5 text-neutral-600 font-normal uppercase">
                            Non-refundable
                        </div>
                    </div>
                    {
                        selectedSeats.length > 0
                            ?
                            <div className="w-full flex items-center gap-x-3">
                                {selectedSeats.map((seatId) => {
                                    return (
                                        <div key={seatId} className="w-9 h-9 bg-neutral-200/80 rounded-lg flex items-center justify-center text-base text-neutral-700 font-semibold">
                                            {seatId}
                                        </div>
                                    )
                                })}
                            </div>
                            :
                            <div className="w-full flex items-center gap-x-3">
                                <p className="text-sm text-neutrail-500 font-normal">No seat selected</p>
                            </div>
                    }

                </div>

                <div className="w-full space-y-2">

                    <h1 className="text-lg text-neutral-600 font-medium">
                        Fare Detail 
                    </h1>
                    <div className="w-full flex items-center justify-between border border-dashed border-l-[1.5px] border-neutral-400 pl-2">
                        <h3 className="text-sm text-neutral-500 font-medium"> Basic Fare </h3>
                        <p className="text-sm text-neutral-600 font-medium">1600VND</p>
                    </div>

                    <div className="flex items-center justify-between gap-x-4">
                        <div className="flex gap-y-0.5 flex-col">
                            <h3 className="text-base text-neutral-500 font-medium"> Total Price :</h3>
                            <span className="text-xs text-neutral-500 font-normal"></span>
                            (Including all taxes)
                        </div>

                        {/* Calculate the total price */}
                        <p className="text-base text-neutral-600 font-semibold">
                            VND{" "}
                           {selectedSeats.reduce((total,seatId) => {
                                const seat = busSeatData.find(busSeat => busSeat.id === seatId);
                                return total + (seat ? seat.price : 0);
                           },0)}
                        </p>

                    </div>


                </div>

                <div className="w-full flex items-center justify-center">
                        {
                            selectedSeats.length > 0
                            ?
                            <Link to="/bus-tickets/checkout" className='w-full bg-primary hover:bg-primary/90 text-neutral-50 font-normal py-2.5 flex items-center justify-center uppercase rounded-lg transition'>
                                Processed to Checkout
                            </Link>
                            :
                            <div className=" w-full space-y-0.5">
                                <button disabled className='w-full bg-primary hover:bg-primary/90 text-neutral-50 font-normal py-2.5 flex items-center justify-center uppercase rounded-lg transition cursor-not-allowed'>
                                Processed to Checkout
                            </button>
                            <small className="text-xs text-neutral-600 font-normal px-1">
                                Please select at least one seat to proceed to checkout page.
                            </small>
                        </div>
                        }
                </div>
            </div>

            {/* Show error message if more than 10 seats are selected */}
            {showError && <ErrorMessage message={" You can't select more than 10 seats."}/>
                
            }
        </div>
    )
}

export default BusSeat;
