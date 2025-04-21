import React from 'react';
import bg from '../../../assets/homebg.jpg'; 

const Testimonial = () => {
  return (
    <div className="relative ">
      {/* Nền ảnh cố định ở dưới */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-80 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: `url(${bg})` }} 
      >
        <div className="absolute top-0 left-0 right-0 h-80 bg-black bg-opacity-70 flex items-center justify-center z-10">
          <div className="text-center">
            <h1 className="text-5xl font-semibold text-neutral-300">Chào mừng đến với TICKETBUS</h1>
            <p className="text-lg text-neutral-300 mt-2">Đặt vé xe khách online dễ dàng - Hành trình thuận tiện, giá cả hợp lý!</p>
            <p className="text-xs text-neutral-500 mt-2">Dev Team : Nguyen Thuan Hai - Le Tran Thu Lieu - Do Tien Khoa</p>
          </div>
        </div>
      </div>

      {/* Phần overlay với nền mờ */}
    </div>
  );
}

export default Testimonial;