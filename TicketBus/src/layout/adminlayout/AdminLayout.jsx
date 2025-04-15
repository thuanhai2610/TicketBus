/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import Logo from "../../assets/logo.png";
import { FaBus, FaTicketAlt, FaUsers, FaCog, FaUserCircle, FaHome, FaMoneyBillAlt, FaSignOutAlt, FaSignInAlt, FaStar, FaUser, FaCreditCard, FaBell, FaChevronDown, FaChevronRight } from "react-icons/fa";
import { MdOutlineLogout } from "react-icons/md";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const AdminLayout = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState(""); // State for email
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isTripsOpen, setIsTripsOpen] = useState(false); // State for collapsing "Nhà xe" section
  const [isTicketsOpen, setIsTicketsOpen] = useState(false); // State for collapsing "Đơn đặt vé" section
  const navigate = useNavigate();

  const handleGoToProfile = () => {
    navigate(`/user/profile?username=${username}`);
  };
  // API base URL
  const API_BASE_URL = "http://localhost:3001";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Check if the JWT token contains an email field
        setEmail(decoded.email || decoded.username || "user@example.com"); // Fallback to username if email is not present
        setIsLoggedIn(true);

        const fetchUserData = async () => {
          try {
            const response = await axios.get(`${API_BASE_URL}/user/profile?username=${decoded.username}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setFirstName(response.data.firstName || "");
            setLastName(response.data.lastName || "");
            // Check if the API response contains an email field
            if (response.data.email) {
              setEmail(response.data.email);
            }
            if (response.data.avatar) {
              if (response.data.avatar.startsWith("http")) {
                setAvatar(response.data.avatar);
              } else {
                setAvatar(`${API_BASE_URL}${response.data.avatar}`);
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

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const toggleTrips = () => {
    setIsTripsOpen((prev) => !prev);
  };

  const toggleTickets = () => {
    setIsTicketsOpen((prev) => !prev);
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col max-h-screen">
        {/* Header with Logo */}
        <div className="flex items-center p-4 border-b border-gray-700">
          <Link to="/admin" className="flex items-center space-x-2">
            <img src={Logo} alt="Logo" className="h-8 w-8" />
            <span className="text-xl font-semibold">TICKETBUS</span>
            <span className="text-gray-400 text-xl">ADMIN</span>
          </Link>
        </div>

        {/* Scrollable Menu */}
        <div className="flex-1 overflow-y-auto p-2">
          {/* Platform Section */}
          <div className="mb-4">
            <span className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Platform
            </span>
            <ul className="mt-1 space-y-1">
              <li>
                <Link
                  to="/admin"
                  className="flex items-center px-2 py-1.5 text-sm text-gray-200 hover:bg-gray-700 hover:text-white rounded-md transition-colors"
                >
                  <FaHome className="mr-3 h-4 w-4" />
                  Trang chủ
                </Link>
              </li>
              {/* Nhà xe with collapsible sub-menu */}
              <li className=" border-transparent hover:border-gray-500">
                <button
                  onClick={toggleTrips}
                  className="flex items-center w-full px-2 py-1.5 text-sm text-gray-200 hover:bg-gray-700 hover:text-white rounded-md transition-colors"
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
                  <ul className="mt-1 space-y-1 pl-6">
                    <li className="border-l-4 border-transparent hover:border-gray-500">
                      <Link
                        to="/admin/manage-trips"
                        className="flex items-center px-2 py-1.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors"
                      >
                        <FaBus className="mr-3 h-4 w-4" />
                        Quản lý chuyến
                      </Link>
                    </li>
                    <li className="border-l-4 border-transparent hover:border-gray-500">
                      <Link
                        to="/admin/manage-employees"
                        className="flex items-center px-2 py-1.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors"
                      >
                        <FaUsers className="mr-3 h-4 w-4" />
                        Nhân viên
                      </Link>
                    </li>
                  </ul>
                )}
              </li>

              {/* Đơn đặt vé with collapsible sub-menu */}
              <li>
                <button
                  onClick={toggleTickets}
                  className="flex items-center w-full px-2 py-1.5 text-sm text-gray-200 hover:bg-gray-700 hover:text-white rounded-md transition-colors"
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
                  <ul className="mt-1 space-y-1 pl-6">
                    <li>
                      <Link
                        to="/admin/manage-tickets"
                        className=" border-l-4 border-transparent hover:border-gray-500 flex items-center px-2 py-1.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors"
                      >
                        <FaTicketAlt className="mr-3 h-4 w-4" />
                        Vé đã bán
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/admin/revenue"
                        className="border-l-4 border-transparent hover:border-gray-500 flex items-center px-2 py-1.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors"
                      >
                        <FaMoneyBillAlt className="mr-3 h-4 w-4" />
                        Doanh thu
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
              <li>
                <Link
                  to="/admin/manage-customers"
                  className="flex items-center px-2 py-1.5 text-sm text-gray-200 hover:bg-gray-700 hover:text-white rounded-md transition-colors"
                >
                  <FaUsers className="mr-3 h-4 w-4" />
                  Khách hàng
                </Link>
              </li>
            </ul>
          </div>
          {/* Settings Section */}
          <div className="mb-4">
            <span className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Settings
            </span>
            <ul className="mt-1 space-y-1">
              <li>
                <Link
                  to="/admin/settings"
                  className="flex items-center px-2 py-1.5 text-sm text-gray-200 hover:bg-gray-700 hover:text-white rounded-md transition-colors"
                >
                  <FaCog className="mr-3 h-4 w-4" />
                  Cài đặt
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* User Profile with Dropdown */}
        <div className="p-4 border-t border-gray-700 top-0 bg-gray-800 z-10">
          {isLoggedIn ? (
            <div className="flex items-center space-x-3">
              {avatar ? (
                <img
                  src={avatar}
                  alt="User Avatar"
                  className="w-8 h-8 rounded-full border border-gray-500 object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                    const parent = e.target.parentNode;
                    if (parent) {
                      const icon = document.createElement("span");
                      icon.innerHTML = '<svg class="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path></svg>';
                      parent.appendChild(icon);
                    }
                  }}
                />
              ) : (
                <FaUserCircle className="h-8 w-8 text-gray-400" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-200 truncate">{firstName} {lastName}</p>
                <p className="text-xs text-gray-400 truncate">{email}</p>
              </div>
              <button onClick={handleLogout} className="text-red-400 hover:text-red-300">
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

      {/* Main Content */}
      <main className="flex-1 p-6 bg-gray-900">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;