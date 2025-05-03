/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import Logo from "../../assets/logoxanh.png";
import {
  FaBus, FaTicketAlt, FaUsers, FaCog, FaUserCircle,
  FaHome, FaMoneyBillAlt, FaSignOutAlt, FaSignInAlt,
  FaChevronDown, FaChevronRight
} from "react-icons/fa";
import { MdOutlineLogout, MdDiscount, MdSupportAgent } from "react-icons/md";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const AdminLayout = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [isTripsOpen, setIsTripsOpen] = useState(true);
  const [isTicketsOpen, setIsTicketsOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;
  const isParentActive = (prefix) => location.pathname.startsWith(prefix);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setEmail(decoded.email || decoded.username || "user@example.com");
        setIsLoggedIn(true);

        const fetchUserData = async () => {
          try {
            const response = await axios.get(
              `${import.meta.env.VITE_API_URL}/user/profile?username=${decoded.username}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            localStorage.setItem("avatarAdmin", response.data.avatar);
            setFirstName(response.data.firstName || "");
            setLastName(response.data.lastName || "");
            if (response.data.email) setEmail(response.data.email);
            if (response.data.avatar) {
              if (response.data.avatar.startsWith("http")) {
                setAvatar(response.data.avatar);
              } else {
                setAvatar(`${import.meta.env.VITE_API_URL}${response.data.avatar}`);
              }
            } else {
              setAvatar("");
            }
          } catch (error) {
            console.error("Lỗi lấy dữ liệu người dùng", error);
            setFirstName("");
            setLastName("");
            setAvatar("");
          }
        };
        fetchUserData();
      } catch (error) {
        console.error("Token không hợp lệ", error);
        localStorage.removeItem("token");
        setIsLoggedIn(false);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setEmail("");
    setFirstName("");
    setLastName("");
    setAvatar("");
    navigate("/");
    window.location.reload();
  };

  const toggleTrips = () => setIsTripsOpen(!isTripsOpen);
  const toggleTickets = () => setIsTicketsOpen(!isTicketsOpen);

  return (
    <div className="flex min-h-screen bg-emerald-500 text-neutral-50">
      <aside className="w-64 bg-teal-800 flex flex-col max-h-screen">
        <div className="flex items-center p-4 border-b border-gray-300">
          <Link to="/admin" className="flex items-center space-x-2">
            <img src={Logo} alt="Logo" className="h-8 w-8" />
            <span className="text-xl font-semibold">TICKETBUS</span>
            <span className="text-neutral-400 text-xl">ADMIN</span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto p-0">
          <div className="mb-4v pt-2">
            <span className="px-4 py-2 text-xs font-semibold text-gray-300 uppercase tracking-wider">
              Platform
            </span>
            <ul className="mt-1 space-y-1">
              <li className="relative w-full pl-2">
                <div
                  className={`absolute inset-y-0 left-0 right-0 ${isActive("/admin") ? "bg-white" : "bg-transparent"
                    } -z-10`}
                />
                <Link
                  to="/admin"
                  className={`flex items-center pl-2 py-2 text-base rounded-tl-lg rounded-bl-lg transition-colors w-full ${isActive("/admin")
                    ? "bg-white text-black"
                    : "text-gray-200 hover:bg-emerald-600 hover:text-white"
                    }`}
                >
                  <FaHome className="mr-3 h-4 w-4" />
                  Trang chủ
                </Link>
                {isActive("/admin") && (
                  <>
                    <div
                      className="absolute top-[-24px] right-[-3px] w-16 h-6 bg-transparent rounded-br-full shadow-[0_12px_0_0_white]"
                    ></div>
                    <div
                      className="absolute bottom-[-24px] right-[-3px] w-16 h-6 bg-transparent rounded-tr-full shadow-[0_-12px_0_0_white]"
                    ></div>
                  </>
                )}
              </li>

              <li className="relative w-full">
                <button
                  onClick={toggleTrips}
                  className={`flex items-center w-full px-4 py-2 text-base font-semibold rounded-tl-lg rounded-bl-lg transition-colors ${isParentActive("/admin/manage-")

                    }`}
                >
                  <FaBus className="mr-3 h-4 w-4" />
                  Nhà xe
                  {isTripsOpen ? (
                    <FaChevronDown className="ml-auto h-4 w-4" />
                  ) : (
                    <FaChevronRight className="ml-auto h-4 w-4" />
                  )}
                </button>
                {isTripsOpen && (
                  <ul className="mt-1 space-y-1 pl-2 border-l border-gray-300 ml-8">
                    <li className="relative w-full">
                      <div
                        className={`absolute inset-y-0 left-0 right-0 ${isActive("/admin/manage-trips") ? "bg-amber-600" : "bg-transparent"
                          } -z-10`}
                      />
                      <Link
                        to="/admin/manage-trips"
                        className={`flex items-center px-4 py-2 text-sm rounded-tl-lg rounded-bl-lg transition-colors w-full ${isActive("/admin/manage-trips")
                          ? "bg-white text-black"
                          : "text-gray-200 hover:bg-emerald-600 hover:text-white"
                          }`}
                      >
                        <FaBus className="mr-2 h-3 w-3" />
                        Quản lý Bến Xe
                      </Link>
                      {isActive("/admin/manage-trips") && (
                        <>
                          <div
                            className="absolute top-[-24px] right-[-3px] w-16 h-6 bg-transparent rounded-br-full shadow-[0_12px_0_0_white]"
                          ></div>
                          <div
                            className="absolute bottom-[-24px] right-[-3px] w-16 h-6 bg-transparent rounded-tr-full shadow-[0_-12px_0_0_white]"
                          ></div>
                        </>
                      )}
                    </li>
                    <li className="relative w-full">
                      <div
                        className={`absolute inset-y-0 left-0 right-0 ${isActive("/admin/manage-employees") ? "bg-amber-600" : "bg-transparent"
                          } -z-10`}
                      />
                      <Link
                        to="/admin/manage-employees"
                        className={`flex items-center px-4 py-2 text-sm rounded-tl-lg rounded-bl-lg transition-colors w-full ${isActive("/admin/manage-employees")
                          ? "bg-white text-black"
                          : "text-gray-200 hover:bg-emerald-600 hover:text-white"
                          }`}
                      >
                        <FaUsers className="mr-2 h-3 w-3" />
                        Nhân Viên
                      </Link>
                      {isActive("/admin/manage-employees") && (
                        <>
                            <div
                            className="absolute top-[-24px] right-[-3px] w-16 h-6 bg-transparent rounded-br-full shadow-[0_12px_0_0_white]"
                          ></div>
                          <div
                            className="absolute bottom-[-24px] right-[-3px] w-16 h-6 bg-transparent rounded-tr-full shadow-[0_-12px_0_0_white]"
                          ></div>
                        </>
                      )}
                    </li>
                  </ul>
                )}
              </li>

              <li className="relative w-full">
                <button
                  onClick={toggleTickets}
                  className={`flex items-center w-full px-4 py-2 text-base font-semibold rounded-tl-lg rounded-bl-lg transition-colors ${isParentActive("/admin/manage-tickets") ||
                    isParentActive("/admin/revenue") ||
                    isParentActive("/admin/discount")

                    }`}
                >
                  <FaTicketAlt className="mr-3 h-4 w-4" />
                  Đơn đặt vé
                  {isTicketsOpen ? (
                    <FaChevronDown className="ml-auto h-4 w-4" />
                  ) : (
                    <FaChevronRight className="ml-auto h-4 w-4" />
                  )}
                </button>
                {isTicketsOpen && (
                  <ul className="mt-1 space-y-1 pl-2 border-l border-gray-300 ml-8">
                    <li className="relative w-full">
                      <div
                        className={`absolute inset-y-0 left-0 right-0 ${isActive("/admin/manage-tickets") ? "bg-amber-600" : "bg-transparent"
                          } -z-10`}
                      />
                      <Link
                        to="/admin/manage-tickets"
                        className={`flex items-center px-4 py-2 text-sm rounded-tl-lg rounded-bl-lg transition-colors w-full ${isActive("/admin/manage-tickets")
                          ? "bg-white text-black"
                          : "text-gray-200 hover:bg-emerald-600 hover:text-white"
                          }`}
                      >
                        <FaTicketAlt className="mr-2 h-3 w-3" />
                        Vé đã bán
                      </Link>
                      {isActive("/admin/manage-tickets") && (
                        <>
                            <div
                            className="absolute top-[-24px] right-[-3px] w-16 h-6 bg-transparent rounded-br-full shadow-[0_12px_0_0_white]"
                          ></div>
                          <div
                            className="absolute bottom-[-24px] right-[-3px] w-16 h-6 bg-transparent rounded-tr-full shadow-[0_-12px_0_0_white]"
                          ></div>
                        </>
                      )}
                    </li>
                    <li className="relative w-full">
                      <div
                        className={`absolute inset-y-0 left-0 right-0 ${isActive("/admin/revenue") ? "bg-amber-600" : "bg-transparent"
                          } -z-10`}
                      />
                      <Link
                        to="/admin/revenue"
                        className={`flex items-center px-4 py-2 text-sm rounded-tl-lg rounded-bl-lg transition-colors w-full ${isActive("/admin/revenue")
                          ? "bg-white text-black"
                          : "text-gray-200 hover:bg-emerald-600 hover:text-white"
                          }`}
                      >
                        <FaMoneyBillAlt className="mr-2 h-3 w-3" />
                        Doanh thu
                      </Link>
                      {isActive("/admin/revenue") && (
                        <>
                            <div
                            className="absolute top-[-24px] right-[-3px] w-16 h-6 bg-transparent rounded-br-full shadow-[0_12px_0_0_white]"
                          ></div>
                          <div
                            className="absolute bottom-[-24px] right-[-3px] w-16 h-6 bg-transparent rounded-tr-full shadow-[0_-12px_0_0_white]"
                          ></div>
                        </>
                      )}
                    </li>
                    <li className="relative w-full">
                      <div
                        className={`absolute inset-y-0 left-0 right-0 ${isActive("/admin/discount") ? "bg-amber-600" : "bg-transparent"
                          } -z-10`}
                      />
                      <Link
                        to="/admin/discount"
                        className={`flex items-center px-4 py-2 text-sm rounded-tl-lg rounded-bl-lg transition-colors w-full ${isActive("/admin/discount")
                          ? "bg-white text-black"
                          : "text-gray-200 hover:bg-emerald-600 hover:text-white"
                          }`}
                      >
                        <MdDiscount className="mr-2 h-3 w-3" />
                        Giảm giá
                      </Link>
                      {isActive("/admin/discount") && (
                        <>
                            <div
                            className="absolute top-[-24px] right-[-3px] w-16 h-6 bg-transparent rounded-br-full shadow-[0_12px_0_0_white]"
                          ></div>
                          <div
                            className="absolute bottom-[-24px] right-[-3px] w-16 h-6 bg-transparent rounded-tr-full shadow-[0_-12px_0_0_white]"
                          ></div>
                        </>
                      )}
                    </li>
                  </ul>
                )}
              </li>

              <li className="relative w-full pl-2">
                <div
                  className={`absolute inset-y-0 left-0 right-0 ${isActive("/admin/manage-customers") ? "bg-amber-600" : "bg-transparent"
                    } -z-10`}
                />
                <Link
                  to="/admin/manage-customers"
                  className={`flex items-center px-4 py-2 text-base rounded-tl-lg rounded-bl-lg transition-colors w-full ${isActive("/admin/manage-customers")
                    ? "bg-white text-black"
                    : "text-gray-200 hover:bg-emerald-600 hover:text-white"
                    }`}
                >
                  <FaUsers className="mr-3 h-4 w-4" />
                  Khách hàng
                </Link>
                {isActive("/admin/manage-customers") && (
                  <>
                     <div
                            className="absolute top-[-24px] right-[-3px] w-16 h-6 bg-transparent rounded-br-full shadow-[0_12px_0_0_white]"
                          ></div>
                          <div
                            className="absolute bottom-[-24px] right-[-3px] w-16 h-6 bg-transparent rounded-tr-full shadow-[0_-12px_0_0_white]"
                          ></div>
                  </>
                )}
              </li>

              
            </ul>
          </div>

          <div className="mb-4 mt-4">
            <span className="px-4 py-2 text-xs font-semibold text-gray-300 uppercase tracking-wider">
              Supports
            </span>
            <ul className="mt-1 space-y-1">
            <li className="relative w-full pl-2">
                <div
                  className={`absolute inset-y-0 left-0 right-0 ${isActive("/admin/support-user") ? "bg-amber-600" : "bg-transparent"
                    } -z-10`}
                />
                <Link
                  to="/admin/support-user"
                  className={`flex items-center px-4 py-2 text-base rounded-tl-lg rounded-bl-lg transition-colors w-full ${isActive("/admin/support-user")
                    ? "bg-white text-black"
                    : "text-gray-200 hover:bg-emerald-600 hover:text-white"
                    }`}
                >
                  <MdSupportAgent className="mr-3 h-4 w-4" />
                  Chăm sóc Khách hàng
                </Link>
                {isActive("/admin/support-user") && (
                  <>
                     <div
                            className="absolute top-[-24px] right-[-3px] w-16 h-6 bg-transparent rounded-br-full shadow-[0_12px_0_0_white]"
                          ></div>
                          <div
                            className="absolute bottom-[-24px] right-[-3px] w-16 h-6 bg-transparent rounded-tr-full shadow-[0_-12px_0_0_white]"
                          ></div>
                  </>
                )}
              </li>
            </ul>
          </div>
        </div>

        <div className="p-4 border-t border-gray-300 top-0 bg-teal-800 z-10">
          {isLoggedIn ? (
            <div className="flex items-center space-x-3">
              {avatar ? (
                <img
                  src={avatar}
                  alt="User Avatar"
                  className="w-10 h-10 rounded-full border border-gray-500 object-cover"
                />
              ) : (
                <FaUserCircle className="h-10 w-10 text-gray-400" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-gray-100 truncate">
                  {firstName} {lastName}
                </p>
                <p className="text-xs text-gray-300 truncate underline">{email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="text-red-500 hover:text-red-300"
              >
                <MdOutlineLogout className="h-6 w-6" />
              </button>
            </div>
          ) : (
            <Link
              to="/admin/login"
              className="flex items-center text-sm text-blue-400 hover:text-blue-300"
            >
              <FaSignInAlt className="mr-2 h-4 w-4" />
              Đăng nhập
            </Link>
          )}
        </div>
      </aside>

      <main className="flex-1 p-6 bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;