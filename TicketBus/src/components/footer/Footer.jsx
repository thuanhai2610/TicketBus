import React from 'react'
import RootLayout from '../../layout/RootLayout'
import { Link } from 'react-router-dom'
import { FaDiscord, FaFacebook, FaInstagram, FaYoutube } from 'react-icons/fa'

import MasterCardImg from "../../assets/mastercard.png"
import PayPalImg from "../../assets/paypal.png"
import CreditCardImg from "../../assets/creditcard.png"
import Visa from "../../assets/visa.png"
import Logo from "../../assets/logo.png";

const Footer = () => {
    return (
        <div className='w-full h-auto bg-primary py-12'>
            <RootLayout className="space-y-10">
                <div className="w-full grid grid-cols-5 gap-6">
                    <div className="col-span-2 space-y-8 md:pr-10 pr-0">
                        <div className="space-y-3">
                            <Link to="/" className='flex items-center text-4xl text-primaryblue font-bold'>
                                <img src={Logo} alt="Logo" className="h-12 w-12 mr-2" />
                                Ticket<span className='text-neutral-950 dark:text-neutral-300'>Bus</span>
                            </Link>
                            <p className="text-sm text-neutral-400 font-normal w-[75%]">
                                Bus Ticket Online là một nền tảng hiện đại giúp việc đặt vé xe buýt trở nên dễ dàng, nhanh chóng và tiện lợi.
                                Với giao diện thân thiện, người dùng có thể tìm kiếm chuyến xe, đặt vé, thanh toán trực tuyến và theo dõi lịch trình một cách thuận tiện.
                               
                            </p>
                        </div>
                        <div className="w-full flex items-center gap-x-5">
                            <div className="w-11 h-11 rounded-xl bg-neutral-800/50 hover:bg-primary flex items-center justify-center cursor-pointer ease-in-out duration-500">
                                <FaInstagram className='w-5 h-5 text-neutral-50' />
                            </div>
                            <div className="w-11 h-11 rounded-xl bg-neutral-800/50 hover:bg-primary flex items-center justify-center cursor-pointer ease-in-out duration-500">
                                <FaFacebook className='w-5 h-5 text-neutral-50' />
                            </div>
                            <div className="w-11 h-11 rounded-xl bg-neutral-800/50 hover:bg-primary flex items-center justify-center cursor-pointer ease-in-out duration-500">
                                <FaYoutube className='w-5 h-5 text-neutral-50' />
                            </div>
                            <div className="w-11 h-11 rounded-xl bg-neutral-800/50 hover:bg-primary flex items-center justify-center cursor-pointer ease-in-out duration-500">
                                <FaDiscord className='w-5 h-5 text-neutral-50' />
                            </div>
                        </div>
                    </div>

                    <div className="col-span-1 space-y-5">
                        <h1 className="text-lg text-neutral-100 font-semibold">CÁCH THỨC THANH TOÁN </h1>
                        <div className="flex items-center gap-x-2 ">
                            <img src={MasterCardImg} alt="MasterCard" className="w-fit h-16 object-contain justify-center items-center" />
                            <img src={PayPalImg} alt="PayPal" className="w-fit h-16 object-contain" />
                            <img src={CreditCardImg} alt="CreditCard" className="w-fit h-16 object-contain" />
                        </div>
                        <div className="flex items-center gap-x-2 ">
                            <img src={Visa} alt="MasterCard" className="w-fit h-10 object-contain justify-center items-center" />
                            <img src={PayPalImg} alt="PayPal" className="w-fit h-16 object-contain" />
                            <img src={MasterCardImg} alt="CreditCard" className="w-fit h-16 object-contain" />
                        </div>
                    </div>

                    <div className="col-span-1 space-y-5 ">
                        <h1 className="text-lg text-neutral-100 font-semibold"> CÔNG TY TNHH TICKETBUS </h1>
                        <div className="space-y-5 w-80">
                        <p className="text-md text-neutral-100 font-bold"> VP ĐÀ NẴNG : <span className='font-normal'> 33 Xô Viết Nghệ Tĩnh, Hòa Cường Nam , Hải Châu , Đà Nẵng</span></p>
                        <p className="text-md text-neutral-100 font-bold"> EMAIL :<span className='font-normal'> NhismdKhoaHaiz.@gmail.com</span></p>
                        <p className="text-md text-neutral-100 font-bold"> PHONE : <span className='font-normal'>+84 8888-8888 </span></p>
                        </div>
                    </div>

                    <div className="col-span-1 space-y-5">
                        <h1 className="text-lg text-neutral-100 font-semibold text-center">GOOGLE MAP</h1>
                        <div className="w-full h-40">
                            <iframe
                                title="Google Maps Location"
                                className="w-full h-full rounded-xl"
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3834.018452018994!2d108.22169757587303!3d16.05156288461021!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3142183af2a3df5d%3A0xf8a5fbe60e3a327d!2zVHLGsOG7nW5nIMSQw7RuZyBhw6AgxJDhuqVuIE3huqdt!5e0!3m2!1sen!2s!4v1711749203821"
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </div>
                    </div>
                </div>

                <div className="w-full h-px bg-neutral-800/50" />

                <div className="w-full flex items-center justify-center ">
                    <p className="text-sm text-neutral-400 font-normal">2025&copy; NhismdKhoaHaiz. All rights reserved</p>
                   
                </div>
            </RootLayout>
        </div>
    )
}

export default Footer;