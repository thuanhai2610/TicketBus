import React from 'react'
import { FaBus, FaStar } from 'react-icons/fa'
import { MdOutlineChair } from 'react-icons/md'
import { RiVipFill } from 'react-icons/ri'
import { TbAirConditioning } from 'react-icons/tb'
import { Link } from 'react-router-dom'

// eslint-disable-next-line no-unused-vars
const TicketCard = ({ icon: Icon, busName, routeFrom, routeTo, arrivalTime,departureTime, price, availableSeats }) => {
    return (
        <div className='w-full rounded-xl p-5 border-2 border-neutral-300 space-y-5'>
            

            {/* Bus info , routes , */}
            <div className="space-y-5 w-full border-b border-neutral-300/60 pb-4">
                {/* Route */}
                <div className="space-y-5">

                    {/* Bus Info*/}
                        <div className="w-full flex items-center justify-between">
                            <div className="flex items-center gap-x-2">
                                <FaBus className='h-5 w-5 text-primary' />
                                <p className="text-lg text-neutral-700 font-semibold">
                                    {busName}
                                </p>
                            </div>

                            <div className="flex items-center gap-x-4">
                               <div className="flex items-center gap-x-1 bg-neutral-200/50 rounded-full px-1.5 py-0.5">
                                    <TbAirConditioning className='w-4 h-4 text-primary'/>
                                    <p className="text-xs text-neutral-600 font-normal">
                                        AC
                                    </p>
                               </div>

                               <div className="flex items-center gap-x-1 bg-neutral-200/50 rounded-full px-1.5 py-0.5">
                                    <FaStar className='w-4 h-4 text-yellow-600'/>
                                    <p className="text-xs text-yellow-600 font-normal pt-0.5">
                                        4.5
                                    </p>
                               </div>

                               <div className="flex items-center gap-x-1 bg-neutral-200/50 rounded-full px-1.5 py-0.5">
                                    <RiVipFill className='w-4 h-4 text-primary'/>
                                    <p className="text-xs text-neutral-600 font-normal">
                                        Sofa
                                    </p>
                               </div>

                               <div className="flex items-center gap-x-1 bg-neutral-200/50 rounded-full px-1.5 py-0.5">
                                    <MdOutlineChair className='w-4 h-4 text-primary -rotate-90'/>
                                    <p className="text-xs text-neutral-600 font-normal">
                                        35 seats
                                    </p>
                               </div>
                            </div>


                        </div>


                    {/* Route */}
                    <div className="space-y-0.5">

                       <div className="w-full flex items-center justify-between gap-x-2.5">
                        <h1 className="text-2xl text-neutral-600 font-semibold">
                            {arrivalTime}
                        </h1>

                        <div className="flex-1 border-dashed border border-neutral-300 relative">
                            <p className="absolute w-14 h-14 p-0.5 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-neutral-50 border-dashed border border-neutral-400 rounded-full flex items-center justify-center">
                                <Icon className="w-8 h-8 text-primary"/>
                            </p>
                            </div>
                        
                        <h1 className="text-2xl text-neutral-600 font-semibold">
                            {departureTime}
                        </h1>
                       </div>

                       <div className="w-full flex items-center justify-between gap-x-5">
                           <p className="text-base text-neutral-500 font-normal">
                                {routeFrom}
                            </p>
                            <p className="text-base text-neutral-500 font-normal">
                                {routeTo}
                            </p>         
                       </div>
                    </div>
                
                </div>


            </div>

            {/* price , available seats , and reserve button */}
            <div className="w-full flex items-center justify-between">
                {/* price */}
                <h1 className="text-xl text-neutral-700 font-semibold">
                    $. {price} <span className="text-sm text-neutral-500 font-normal">
                        /per seat
                    </span>
                </h1>

                <h1 className="text-sm text-neutral-600 flex items-center justify-center gap-x-1.5">
                    <span className="text-lg text-green-700 font-bold pt-0.5">{availableSeats}</span>
                    seats available
                </h1>

                <Link to={"/bus-tickets/detail"} className="w-fit px-5 py-1.5 bg-primary hover:bg-transparent border-2  border-primary hover:border-primary rounded-xl text-sm font-normal text-neutral-50 flex items-center justify-center gap-x-2 hover:text-primary ease-in-out duration-300">
                    Reserve Seat
                </Link>
            </div>
        </div>
    )
}

export default TicketCard
