/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import RootLayout from "../../layout/RootLayout";
import { Link } from "react-router-dom";
import { FaDiscord, FaFacebook, FaGithub, FaGoogle, FaInstagram, FaYoutube } from "react-icons/fa";
import Cash from "../../assets/cash.png";
import CreditCardImg from "../../assets/creditcard.png";
import VNPay from "../../assets/vnpay.png";
import Logo from "../../assets/logoxanh.png";

const Footer = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  // Handle resize for mobile/desktop toggle
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Desktop layout
  const DesktopFooter = (
    <div className="w-full h-auto bg-gray-900 py-12">
      <RootLayout className="space-y-10">
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
          <div className="col-span-2 space-y-6 md:pr-10">
            <div className="space-y-3">
              <Link to="/" className="flex items-center text-3xl text-primaryblue font-bold dark:text-primaryblue">
                <img src={Logo} alt="Logo" className="h-10 w-10 mr-2" />
                Ticket<span className="text-neutral-500 dark:text-neutral-50">Bus</span>
              </Link>
              <p className="text-sm text-neutral-400 font-normal w-full sm:w-[80%]">
                Bus Ticket Online là một nền tảng hiện đại giúp việc đặt vé xe buýt trở nên dễ dàng, nhanh chóng và tiện lợi.
                Với giao diện thân thiện, người dùng có thể tìm kiếm chuyến xe, đặt vé, thanh toán trực tuyến và theo dõi lịch trình một cách thuận tiện.
              </p>
            </div>
            <div className="w-full flex items-center gap-x-4 flex-wrap">
              {[
                { href: "https://www.instagram.com/", icon: FaInstagram },
                { href: "https://www.facebook.com/", icon: FaFacebook },
                { href: "https://www.youtube.com/", icon: FaYoutube },
                { href: "https://discord.gg/qWpYM7xr", icon: FaDiscord },
                { href: "https://www.google.com.vn/", icon: FaGoogle },
                { href: "https://github.com/thuanhai2610/TicketBus", icon: FaGithub },
              ].map(({ href, icon: Icon }, index) => (
                <a
                  key={index}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-neutral-800/50 hover:bg-primaryblue flex items-center justify-center cursor-pointer ease-in-out duration-300"
                >
                  <Icon className="w-5 h-5 text-neutral-50" />
                </a>
              ))}
            </div>
          </div>

          <div className="col-span-1 space-y-4">
            <h1 className="text-lg text-neutral-50 font-semibold">CÁCH THỨC THANH TOÁN</h1>
            <div className="flex items-center gap-x-2 flex-wrap">
              <img src={Cash} alt="Tiền mặt" className="w-14 h-14 object-contain" />
              <img src={VNPay} alt="VNPay" className="w-14 h-14 object-contain" />
              <img src={CreditCardImg} alt="Thẻ tín dụng" className="w-14 h-14 object-contain" />
            </div>
          </div>

          <div className="col-span-1 space-y-4">
            <h1 className="text-lg text-neutral-50 font-semibold">CÔNG TY TNHH TICKETBUS</h1>
            <div className="space-y-3 w-full">
              <p className="text-sm text-neutral-50 font-semibold">
                VP ĐÀ NẴNG: <span className="font-normal">33 Xô Viết Nghệ Tĩnh, Hòa Cường Nam, Hải Châu, Đà Nẵng</span>
              </p>
              <p className="text-sm text-neutral-50 font-semibold">
                EMAIL: <span className="font-normal">NhismdKhoaHaiz.@gmail.com</span>
              </p>
              <p className="text-sm text-neutral-50 font-semibold">
                PHONE: <span className="font-normal">+84 8888-8888</span>
              </p>
            </div>
          </div>

          <div className="col-span-1 space-y-4">
            <h1 className="text-lg text-neutral-50 font-semibold text-center">GOOGLE MAP</h1>
            <div className="w-full h-40">
              <iframe
                title="Google Maps Location"
                className="w-full h-full rounded-lg"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3834.018452018994!2d108.22169757587303!3d16.05156288461021!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3142183af2a3df5d%3A0xf8a5fbe60e3a327d!2zVHLGsOG7nW5nIMSQw7RuZyBhw6AgxJDhuqVuIE3huqdt!5e0!3m2!1sen!2s!4v1711749203821"
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>

        <div className="w-full h-px bg-neutral-700" />

        <div className="w-full flex items-center justify-center">
          <p className="text-sm text-neutral-400 font-normal">
            2025© Nguyen Thuan Hai - Le Tran Thu Lieu - Do Tien Khoa
          </p>
        </div>
      </RootLayout>
    </div>
  );

  // Mobile layout
  const MobileFooter = (
    <div className="w-full h-auto bg-primary py-8 px-4">
      <RootLayout className="space-y-8">
        <div className="w-full flex flex-col gap-6">
          <div className="space-y-4">
            <Link to="/" className="flex items-center text-2xl text-primaryblue font-bold dark:text-primaryblue">
              <img src={Logo} alt="Logo" className="h-8 w-8 mr-2" />
              Ticket<span className="text-neutral-950 dark:text-neutral-50">Bus</span>
            </Link>
            <p className="text-xs text-neutral-400 font-normal">
              Bus Ticket Online là một nền tảng hiện đại giúp việc đặt vé xe buýt trở nên dễ dàng, nhanh chóng và tiện lợi.
              Với giao diện thân thiện, người dùng có thể tìm kiếm chuyến xe, đặt vé, thanh toán trực tuyến và theo dõi lịch trình.
            </p>
            <div className="w-full flex items-center gap-x-3 flex-wrap">
              {[
                { href: "https://www.instagram.com/", icon: FaInstagram },
                { href: "https://www.facebook.com/", icon: FaFacebook },
                { href: "https://www.youtube.com/", icon: FaYoutube },
                { href: "https://discord.gg/qWpYM7xr", icon: FaDiscord },
                { href: "https://www.google.com.vn/", icon: FaGoogle },
                { href: "https://github.com/thuanhai2610/TicketBus", icon: FaGithub },
              ].map(({ href, icon: Icon }, index) => (
                <a
                  key={index}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-neutral-800/50 hover:bg-primaryblue flex items-center justify-center cursor-pointer ease-in-out duration-300"
                >
                  <Icon className="w-4 h-4 text-neutral-50" />
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-base text-neutral-50 font-semibold">CÁCH THỨC THANH TOÁN</h1>
            <div className="flex items-center gap-x-2 flex-wrap">
              <img src={Cash} alt="Tiền mặt" className="w-12 h-12 object-contain" />
              <img src={VNPay} alt="VNPay" className="w-12 h-12 object-contain" />
              <img src={CreditCardImg} alt="Thẻ tín dụng" className="w-12 h-12 object-contain" />
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-base text-neutral-50 font-semibold">CÔNG TY TNHH TICKETBUS</h1>
            <div className="space-y-2 w-full">
              <p className="text-xs text-neutral-50 font-semibold">
                VP ĐÀ NẴNG: <span className="font-normal">33 Xô Viết Nghệ Tĩnh, Hòa Cường Nam, Hải Châu, Đà Nẵng</span>
              </p>
              <p className="text-xs text-neutral-50 font-semibold">
                EMAIL: <span className="font-normal">NhismdKhoaHaiz.@gmail.com</span>
              </p>
              <p className="text-xs text-neutral-50 font-semibold">
                PHONE: <span className="font-normal">+84 8888-8888</span>
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-base text-neutral-50 font-semibold text-center">GOOGLE MAP</h1>
            <div className="w-full h-32">
              <iframe
                title="Google Maps Location"
                className="w-full h-full rounded-lg"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3834.018452018994!2d108.22169757587303!3d16.05156288461021!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3142183af2a3df5d%3A0xf8a5fbe60e3a327d!2zVHLGsOG7nW5nIMSQw7RuZyBhw6AgxJDhuqVuIE3huqdt!5e0!3m2!1sen!2s!4v1711749203821"
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>

        <div className="w-full h-px bg-neutral-700" />

        <div className="w-full flex items-center justify-center">
          <p className="text-xs text-neutral-400 font-normal">
            2025© Nguyen Thuan Hai - Le Tran Thu Lieu - Do Tien Khoa
          </p>
        </div>
      </RootLayout>
    </div>
  );

  return isMobile ? MobileFooter : DesktopFooter;
};

export default Footer;