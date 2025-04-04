/* eslint-disable no-unused-vars */
import React from 'react'
import { motion } from 'framer-motion'
import RootLayout from '../../../layout/RootLayout'
import ServiecsCard from '../../../components/navbar/services/ServiecsCard'
import { RiRefund2Line, RiSecurePaymentLine } from 'react-icons/ri'
import { PiHeadsetFill } from 'react-icons/pi'

const Services = () => {
  return (
    <RootLayout className="space-y-12 ">
      <motion.div
        initial={{ opacity: 0, y: 800 }}
        animate={{ opacity: 1, y: -200 }} // Điều chỉnh vị trí xuống 200px
        exit={{ opacity: 0, y: 800 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        className="w-full flex flex-col items-center space-y-12"
      >
        {/* Tag */}
        <div className="w-full flex items-center justify-center text-center">
          <h1 className="text-3xl text-neutral-800 font-bold">
            Our <span className="text-primary">Services</span>
          </h1>
        </div>

        {/* Services Card */}
        <div className="w-full grid grid-cols-3 gap-10">
          <ServiecsCard icon={RiSecurePaymentLine} title={"Secure Payment"} desc={"Integrate secure payment gateways for users to pay for their tickets.."} />
          <ServiecsCard icon={RiRefund2Line} title={"Refund Policy"} desc={"Offer options for the user to purchase refundable tickets with clear terms.."} />
          <ServiecsCard icon={PiHeadsetFill} title={"24/7 Support"} desc={"Get assistance anytime through chat, email, or phone.."} />
        </div>
      </motion.div>
    </RootLayout>
  )
}

export default Services
