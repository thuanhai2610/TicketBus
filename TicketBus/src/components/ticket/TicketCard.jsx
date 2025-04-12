import React from 'react'
import { FaBus, FaStar } from 'react-icons/fa'
import { MdOutlineChair } from 'react-icons/md'
import { RiVipFill } from 'react-icons/ri'
import { TbAirConditioning } from 'react-icons/tb'
import { Link } from 'react-router-dom'

// eslint-disable-next-line no-unused-vars
const TicketCard = ({ icon: Icon, busName,departureLatitude,
    departureLongtitude,
    destinationLatitude,
    destinationLongtitude,routeFrom, routeTo, arrivalTime,departureTime, price, availableSeats ,vehicleId}) => {
    
    return (
        <div className='w-full rounded-xl p-5 border-2 border-neutral-400 space-y-5 justify-center'>
            

            {/* Bus info , routes , */}
            <div className="space-y-5 w-full border-b border-neutral-300/60 pb-4 justify-center">
                {/* Route */}
                <div className="space-y-5">

                    {/* Bus Info*/}
                        <div className="w-full flex items-center justify-between">
                            <div className="flex items-center gap-x-2">
                                <FaBus className='h-5 w-5 text-red-500 dark:text-red-500' />
                                <p className="text-lg text-neutral-700 font-semibold dark:text-neutral-50">
                                    {busName}
                                </p>
                            </div>

                            <div className="flex items-center gap-x-4">
                               <div className="flex items-center gap-x-1 bg-neutral-200/50 rounded-full px-1.5 py-0.5">
                                    <TbAirConditioning className='w-4 h-4 text-primary dark:text-neutral-50'/>
                                    <p className="text-xs text-neutral-600 font-normal dark:text-neutral-50">
                                        AC
                                    </p>
                               </div>

                               <div className="flex items-center gap-x-1 bg-neutral-200/50 rounded-full px-1.5 py-0.5">
                                    <FaStar className='w-4 h-4 text-yellow-400 dark:text-yellow-400'/>
                                    <p className="text-xs text-yellow-600 font-normal pt-0.5 dark:text-neutral-50">
                                        4.5
                                    </p>
                               </div>

                               <div className="flex items-center gap-x-1 bg-neutral-200/50 rounded-full px-1.5 py-0.5">
                                    <RiVipFill className='w-4 h-4 text-red-500 dark:text-red-400'/>
                                    <p className="text-xs text-neutral-600 font-normal dark:text-neutral-50">
                                        Sofa
                                    </p>
                               </div>

                               <div className="flex items-center gap-x-1 bg-neutral-200/50 rounded-full px-1.5 py-0.5">
                                    <MdOutlineChair className='w-4 h-4 text-primary -rotate-90 dark:text-neutral-50'/>
                                    <p className="text-xs text-neutral-600 font-normal dark:text-neutral-50">
                                    {availableSeats} seats
                                    </p>
                               </div>
                            
                            </div>


                        </div>


                    {/* Route */}
                    <div className="space-y-0.5">

                       <div className="w-full flex items-center justify-between gap-x-2.5">
                        <h1 className="text-2xl text-neutral-600 font-semibold dark:text-neutral-50">
                            {departureTime}
                        </h1>

                        <div className="flex-1 border-dashed border border-neutral-300 relative">
                            <p className="absolute w-14 h-14 p-0.5 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2  bg-neutral-50 border-dashed border border-neutral-400 rounded-full flex items-center justify-center">
                                <Icon className="w-8 h-8 text-primary"/>
                            </p>
                            </div>
                        
                        <h1 className="text-2xl text-neutral-600 font-semibold dark:text-neutral-50">
                            {arrivalTime}
                        </h1>
                       </div>

                       <div className="w-full flex items-center justify-between gap-x-5">
                           <p className="text-base text-neutral-500 font-normal dark:text-neutral-50">
                                {routeFrom}
                            </p>
                            <p className="text-base text-neutral-500 font-normal dark:text-neutral-50">
                                {routeTo}
                            </p>         
                       </div>
                    </div>
                
                </div>


            </div>

            {/* price , available seats , and reserve button */}
            <div className="w-full flex items-center justify-between">
                {/* price */}
                <h1 className="text-xl text-neutral-700 font-semibold dark:text-neutral-50">
                   {price} <span className="text-sm text-neutral-500 font-normal dark:text-neutral-50">
                        /chỗ
                    </span>
                </h1>

                <h1 className="text-sm text-neutral-600 flex items-center justify-center gap-x-1.5 dark:text-neutral-50 ">
                    <span className="text-lg text-green-700 font-bold pt-0.5 dark:text-emerald-500">{availableSeats}</span>
                    Ghế trống
                </h1>

                <Link to={`/bus-tickets/detail/${vehicleId}`} className="w-fit px-5 py-1.5 bg-primary dark:bg-primaryblue/50 dark:hover:bg-primaryblue dark:hover:text-neutral-950 hover:bg-transparent border-2  border-primary hover:border-primary rounded-xl text-sm font-normal text-neutral-50 flex items-center justify-center gap-x-2 hover:text-primary ease-in-out duration-300">
                    Reserve Seat
                </Link>
            </div>
        </div>
    )
}

export default TicketCard
