/* eslint-disable no-unused-vars */
import React from 'react'
import { motion } from 'framer-motion'
import RootLayout from '../../../layout/RootLayout'
import TopSearchCard from '../../../components/topsearch/TopSearchCard'

const TopSearch = () => {
  return (
    <RootLayout className="space-y-12">
      <motion.div
        initial={{ opacity: 0, y: 800 }}
        animate={{ opacity: 1, y: -200 }} 
        exit={{ opacity: 0, y: 800 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        className="w-full flex flex-col items-center space-y-12"
      >
        {/* Tiêu đề */}
        <div className="w-full flex items-center justify-center text-center">
          <h1 className="text-3xl text-neutral-800 font-bold">
            Top Search <span className="text-primary">Routes</span>
          </h1>
        </div>

        {/* Top Search tickets */}
        <div className="w-full grid grid-cols-3 gap-5">
          <TopSearchCard routeFrom={"Nha Trang"} routeTo={"Da Nang"} timeDuration={"11 Hrs"} price={"9540"} />
          <TopSearchCard routeFrom={"Sai Gon"} routeTo={"Da Lat"} timeDuration={"3 Hrs"} price={"4105"} />
          <TopSearchCard routeFrom={"Ninh Thuan"} routeTo={"Quang Ngai"} timeDuration={"12 Hrs"} price={"2610"} />
          <TopSearchCard routeFrom={"Da Nang"} routeTo={"Quang Ngai"} timeDuration={"3 Hrs"} price={"2011"} />
          <TopSearchCard routeFrom={"Binh Thuan"} routeTo={"Da Nang"} timeDuration={"14 Hrs"} price={"950"} />
          <TopSearchCard routeFrom={"Ha Noi"} routeTo={"Da Nang"} timeDuration={"11 Hrs"} price={"2003"} />
          <TopSearchCard routeFrom={"Phu Yen"} routeTo={"Da Nang"} timeDuration={"9 Hrs"} price={"2025"} />
          <TopSearchCard routeFrom={"Binh Dinh"} routeTo={"Da Nang"} timeDuration={"7 Hrs"} price={"7254"} />
          <TopSearchCard routeFrom={"Ben Tre"} routeTo={"Da Nang"} timeDuration={"20 Hrs"} price={"72541"} />
        </div>
      </motion.div>
    </RootLayout>
  )
}

export default TopSearch
