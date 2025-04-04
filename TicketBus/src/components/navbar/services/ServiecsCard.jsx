import React from 'react'

// eslint-disable-next-line no-unused-vars
const ServiecsCard = ({ icon : Icon ,title , desc}) => {
  return (
    <div className='w-full bg-neutral-200 hover:bg-neutral-300 rounded-xl p-7  flex items-center justify-center gap-4 flex-col text-center cursor-pointer ease-in-out duration-300'>
      <div className="w-full flex items-center justify-center gap-x-3">
        <div className="w-12 h-12 rounded-xl bf-neutral-400/40 flex items-center justify-center">
         <Icon className=" w-7 h-7 text-neutral-800" />
      </div>
        <h1 className="text-2xl text-neutral-800 font-bold">
            {title}
        </h1>
        </div>
        <p className="text-sm text-neutral-600 font-normal">
            {desc}
        </p>
    </div>
  )
}

export default ServiecsCard
