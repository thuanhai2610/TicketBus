import React, { useState } from 'react';

const PassengerData = ({ passengerInfo, setPassengerInfo }) => {
  // Trạng thái lỗi cho từng trường
  const [errors, setErrors] = useState({
    email: '',
    phone: '',
  });

  // Hàm validate email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email không được để trống.';
    if (!emailRegex.test(email)) return 'Email không đúng định dạng.';
    return '';
  };

  // Hàm validate phone
  const validatePhone = (phone) => {
    const phoneRegex = /^(?:\+84|0)(3|5|7|8|9)\d{8}$/;
    if (!phone) return 'Số điện thoại không được để trống.';
    if (!phoneRegex.test(phone)) return 'Số điện thoại không đúng định dạng (ví dụ: +84 hoặc 0, theo sau là 9 chữ số).';
    return '';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Cập nhật passengerInfo
    setPassengerInfo((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validate và cập nhật lỗi
    if (name === 'email') {
      setErrors((prev) => ({
        ...prev,
        email: validateEmail(value),
      }));
    } else if (name === 'phone') {
      setErrors((prev) => ({
        ...prev,
        phone: validatePhone(value),
      }));
    }
  };

  return (
    <div className="w-full col-span-4 py-4 space-y-6">
      <h1 className="text-xl text-neutral-700 font-semibold uppercase dark:text-neutral-50">Thông tin khách hàng</h1>

      <div className="space-y-7">
        <div className="w-full space-y-2">
          <label htmlFor="fullName" className="text-sm text-neutral-500 font-medium uppercase dark:text-neutral-50">
            Họ và Tên
          </label>
          <input
            type="text"
            name="fullName"
            value={passengerInfo.fullName}
            onChange={handleInputChange}
            placeholder="e.g. NhismdKhoaHaiz"
            className="w-full h-14 px-4 dark:text-neutral-50 dark:placeholder:text-neutral-300 bg-neutral-100/40 dark:bg-transparent focus:bg-neutral-100/70 border border-neutral-400/50 rounded-xl focus:outline-none focus:border-neutral-400 text-base text-neutral-600 font-normal placeholder:text-neutral-400"
          />
        </div>

        <div className="w-full space-y-2">
          <label htmlFor="email" className="text-sm text-neutral-500 font-medium uppercase dark:text-neutral-50">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={passengerInfo.email}
            onChange={handleInputChange}
            placeholder="NhismdKhoaHaiz@gmail.com"
            className={`w-full h-14 px-4 dark:text-neutral-50 dark:placeholder:text-neutral-300 bg-neutral-100/40 dark:bg-transparent focus:bg-neutral-100/70 border ${
              errors.email ? 'border-red-500' : 'border-neutral-400/50'
            } rounded-xl focus:outline-none focus:border-neutral-400 text-base text-neutral-600 font-normal placeholder:text-neutral-400`}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        <div className="w-full space-y-2">
          <label htmlFor="phone" className="text-sm text-neutral-500 font-medium uppercase dark:text-neutral-50">
            Số điện thoại
          </label>
          <input
            type="tel"
            name="phone"
            value={passengerInfo.phone}
            onChange={handleInputChange}
            placeholder="+84 123-456-789"
            className={`w-full h-14 px-4 dark:text-neutral-50 dark:placeholder:text-neutral-300 bg-neutral-100/40 dark:bg-transparent focus:bg-neutral-100/70 border ${
              errors.phone ? 'border-red-500' : 'border-neutral-400/50'
            } rounded-xl focus:outline-none focus:border-neutral-400 text-base text-neutral-600 font-normal placeholder:text-neutral-400`}
          />
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
        </div>

        <div className="w-full space-y-2">
          <label htmlFor="address" className="text-sm text-neutral-500 font-medium uppercase dark:text-neutral-50">
            Địa chỉ
          </label>
          <input
            type="text"
            name="address"
            value={passengerInfo.address}
            onChange={handleInputChange}
            placeholder="Da Nang, Viet Nam"
            className="w-full h-14 px-4 dark:text-neutral-50 dark:placeholder:text-neutral-300 dark:bg-transparent bg-neutral-100/40 focus:bg-neutral-100/70 border border-neutral-400/50 rounded-xl focus:outline-none focus:border-neutral-400 text-base text-neutral-600 font-normal placeholder:text-neutral-400"
          />
        </div>
      </div>
    </div>
  );
};

export default PassengerData;