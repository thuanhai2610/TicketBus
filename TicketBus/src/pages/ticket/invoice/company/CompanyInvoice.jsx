import React from 'react'
import { FaPhone } from 'react-icons/fa'

const CompanyInvoice = () => {
  return (
    <div className='w-full col-span-1 border-dashed border-l-2 relative'>
        <div className="w-full bg-primary px-4 py-5 rounded-tr-3xl">
            <h1 className="text-2xl text-neutral-50 font-bold text-center">
                Bus Ticket 
            </h1>
        </div>
        <div className="w-full px-4 py-7 space-y-2">
            <p className="text-sm text-neutral-600 font-normal">
                Bill No. : 888
            </p>
            <p className="text-sm text-neutral-600 font-normal">
                Date : 31-05-2025
            </p>
            <p className="text-sm text-neutral-600 font-normal">
                Name : NhismdKhoaHaiz
            </p>
            <p className="text-sm text-neutral-600 font-normal">
                From : Nha Trang <span className="text-xs">(buspark)</span>
            </p>
            <p className="text-sm text-neutral-600 font-normal">
                To : Da Nang <span className="text-xs">(buspark)</span>
            </p>
            <p className="text-sm text-neutral-600 font-normal">
                Dept. Time : 04:10 AM
            </p>
            <p className="text-sm text-neutral-600 font-normal">
                Seat No.: A9,A5,B4,B10
            </p>
            <p className="text-sm text-neutral-600 font-normal">
                Total Passenger: 04 Only
            </p>
            <p className="text-sm text-neutral-600 font-normal">
                Total Price: 500.000 VND
            </p>
        </div>
      
      {/* Right bottom section */}
       <div className="w-full bg-primary absolute bottom-0 left-0 rounded-br-3xl flex items-center justify-center px-5 py-1.5">
              <div className="flex items-center gap-x-2">
                  <FaPhone  className='w-3 h-3 text-neutral-100'/>
                  <p className="text-xs text-neutral-100 font-light">
                 +84 8888-8888 , +84 9999-9999
              </p>
              </div>
              
            </div>
    </div>
  )
}

export default CompanyInvoice
