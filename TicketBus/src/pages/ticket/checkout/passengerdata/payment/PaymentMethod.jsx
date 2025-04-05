
import React, { useState } from 'react'
import PaymentCard from '../../../../../components/payment/PaymentCard';


import PayPalImg from "../../../../../assets/paypal.png"
import CreditCardImg from "../../../../../assets/creditcard.png"
import { FaPlus } from 'react-icons/fa';

const PaymentMethod = () => {

    const [selectedPaymentMethod , setSelectedPaymentMethod] = useState('');

    const handleChange = (e) => {
        setSelectedPaymentMethod(e.target.value);
    }

  return (
    <div className='w-full space-y-3'>
        <h6 className="text-sm text-neutral-600 text-medium">
            Select Payment Method
        </h6>
      <div className="w-full grid grid-cols-2 gap-10">
    <PaymentCard 
        selectPayment={selectedPaymentMethod}
        value={"PayPalImg"}
        onChange = {handleChange}
        cardholderName={'NhismdKhoaHaiz'}
        cardNumber={"8888"}
        cardImage={PayPalImg}
    />
       <PaymentCard 
        selectPayment={selectedPaymentMethod}
        value={"CreditCardImg"}
        onChange = {handleChange}
        cardholderName={'dKhoaNhismHaiz'}
        cardNumber={"9999"}
        cardImage={CreditCardImg}
    />
      </div>

      <div className="w-full flex justify-end">
            <div className="w-fit flex items-center justify-center gap-x-2 cursor-pointer text-base font-normal text-primary">
                <FaPlus />
                <p className="capitalize">Add new card</p>
            </div>
      </div>
    </div>
  )
}

export default PaymentMethod
