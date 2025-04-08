import React from 'react'


import { FaCircleCheck } from 'react-icons/fa6'
import { IoCloseCircle } from 'react-icons/io5'

import BusImg from '../../../../assets/bus.png'
import QrCode from '../../../../assets/qrcode.jpg'
import { FaPhone } from 'react-icons/fa'

const PassengerInvoice = ({
    ticketId,
    totalPrice,
    passengerName,
    totalSeats,
    totalPassengers,
    pickupStation,
    departurePoint,
    destinationPoint,
    departureTime,
    arrivalTime,
    vehicleId,
bookedAt,
lisencePlate}


) => {
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        let hours = date.getUTCHours();
        const minutes = date.getUTCMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12; // chuyển 0 thành 12
        const paddedMinutes = String(minutes).padStart(2, '0');
        return `${hours}:${paddedMinutes} ${ampm}`;
      };
      const formatDateVerbose = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return `Ngày ${date.getDate().toString().padStart(2, '0')} tháng ${date.getMonth() + 1} năm ${date.getFullYear()}`;
      };
    return (

        <div className='w-full col-span-4 rounded-3xl relative '>
            {/* top bus detail */}
            <div className="w-full flex items-center justify-between bg-primary px-6 py-3 rounded-tl-3xl">
                <div className="flex items-center gap-x-3">
                    <img src={BusImg} alt="bus img" className="w-auto h-12 object-cover object-center" />
                    <h1 className="text-xl text-neutral-50 font-bold uppercase tracking-wider pt-1">
                        Ticket Bus
                    </h1>
                </div>

                <div className="flex items-center gap-x-2">
                    <p className="text-xl text-neutral-50 font-bold">
                        <span className="text-lg">(Bus No.)</span>  { lisencePlate}
                    </p>
                </div>
            </div>

            <div className="w-full grid grid-cols-5 gap-8 items-center px-5 py-6 mb-1">
                <div className="col-span-4 space-y-3.5">
                    {/* seat and date */}
                    <div className="w-full flex items-center justify-between border-dashed border-b-2 border-neutral-200 pb-3">
                        <p className="text-base text-neutral-500 font-normal">
                            Bill No.: {ticketId}
                        </p>
                       
                        <p className="text-base text-neutral-500 font-normal">
                            Date : {bookedAt ? formatDateVerbose(bookedAt) : ''}
                        </p>
                    </div>


                    {/* passenger detail */}
                    <div className="w-full flex items-center justify-between">
                        <div className="space-y-1.5">
                            <p className="text-base text-neutral-600 font-normal">
                                Name of passenger : <span className="font-medium">
                                {passengerName}
                                </span>
                            </p>
                            <p className="text-base text-neutral-600 font-normal">
                                Total Seat No. : <span className="font-medium">
                                   {totalSeats}
                                </span>
                            </p>
                            <p className="text-base text-neutral-600 font-normal">
                                Total No. of Passenger : <span className="font-medium">
                                    {totalPassengers}
                                </span>
                            </p>
                            <p className="text-base text-neutral-600 font-normal">
                                Pickup Stations : <span className="font-medium">
                                {pickupStation}
                                </span>
                            </p>
                        </div>

                        <div className="space-y-4 flex items-center justify-center flex-col">
                            <div className="space-y-1 text-center">
                                <p className="text-base text-neutral-600 font-normal">
                                    Total Price:
                                </p>

                                <h1 className="text-xl text-neutral-600 font-bold">
                                    {totalPrice}
                                </h1>
                            </div>


                            {/* Paid */}
                            <div className="w-fit px-3 py-1 rounded-full bg-green-500/5 border border-green-600 text-green-600 text-sm font-medium flex items-center justify-center gap-2">
                                <FaCircleCheck size={16} />
                                <span>Bill Paid</span>
                            </div>
                        
                        </div>
                    </div>


                    {/* route detail */}
                    <div className="w-full flex items-center justify-between border-dashed border-t-2 border-neutral-200 pt-3">
                        <p className="text-base text-neutral-600 font-normal">
                            {departurePoint}
                            <span className="text-neutral-400 px-2">-------</span>
                            {destinationPoint}
                        </p>
                        <p className="text-base text-neutral-600 font-normal">
                            Departure  at { departureTime ? formatTime(departureTime) : 'Unknown Time'}
                        </p>
                        <p className="text-base text-neutral-600 font-normal">
                            Arrive  at {arrivalTime ? formatTime(arrivalTime) : 'Unknown Time'}
                        </p>

                    </div>
                </div>

                <div className="col-span-1 border border-neutral-200 rounded-xl shadow-sm p-1">
                    <img src={QrCode} alt="" className="w-full aspect-square object-cover object-center rounded-xl" />
                </div>

            </div>

            {/* Left bottom section */}
            <div className="w-full bg-primary absolute bottom-0 left-0 rounded-bl-3xl flex items-center justify-between px-5 py-1.5">
                <p className="text-xs text-neutral-100 font-light">
                    Note : 40% charge for canellation price 24 hours of progamme
                </p>
                <div className="flex items-center gap-x-2">
                    <FaPhone className='w-3 h-3 text-neutral-100' />
                    <p className="text-xs text-neutral-100 font-light">
                        +84 8888-8888 , +84 9999-9999
                    </p>
                </div>

            </div>

        </div>
    )
}

export default PassengerInvoice
