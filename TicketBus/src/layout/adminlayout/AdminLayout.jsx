import React from "react";
import { Link, Outlet } from "react-router-dom";
import Logo from "../../assets/logo.png";
import { FaBus, FaTicketAlt, FaUsers, FaCog, FaUserCircle, FaSignOutAlt, FaSignInAlt } from "react-icons/fa";

const AdminLayout = () => {
  const isLoggedIn = true;
  const user = { name: "Admin" };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-96 bg-white shadow-lg p-6 flex flex-col justify-between">
        <div>
          <Link to="/" className='flex items-center text-4xl text-primary font-bold'>
            <img src={Logo} alt="Logo" className="h-12 w-12 mr-2" />
            TicketBus<span className='text-neutral-400 dark:text-neutral-600'>Admin</span>
          </Link>

          <nav className="mt-6">
            <ul className="space-y-3">
              <li>
                <Link to="/admin" className="flex items-center p-3 text-gray-700 hover:bg-primary hover:text-white rounded-lg">
                  <FaBus className="mr-3" /> Trang chủ
                </Link>
              </li>
              <li>
                <Link to="/admin/manage-trips" className="flex items-center p-3 text-gray-700 hover:bg-primary hover:text-white rounded-lg">
                  <FaBus className="mr-3" /> Nhà xe
                </Link>
              </li>
              <li>
                <Link to="/admin/manage-tickets" className="flex items-center p-3 text-gray-700 hover:bg-primary hover:text-white rounded-lg">
                  <FaTicketAlt className="mr-3" /> Đơn đặt vé
                </Link>
              </li>
              <li>
                <Link to="/admin/manage-customers" className="flex items-center p-3 text-gray-700 hover:bg-primary hover:text-white rounded-lg">
                  <FaUsers className="mr-3" /> Khách hàng
                </Link>
              </li>
              <li>
                <Link to="/admin/settings" className="flex items-center p-3 text-gray-700 hover:bg-primary hover:text-white rounded-lg">
                  <FaCog className="mr-3" /> Cài đặt
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-6 border-t pt-4">
          {isLoggedIn ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FaUserCircle className="text-2xl text-gray-700 mr-2" />
                <span className="text-gray-700">{user.name}</span>
              </div>
              <button className="flex items-center text-red-500 hover:text-red-700" onClick={() => alert("Đăng xuất")}>
                <FaSignOutAlt className="mr-2" /> Sign Up
              </button>
            </div>
          ) : (
            <Link to="/admin/login" className="flex items-center text-blue-500 hover:text-blue-700">
              <FaSignInAlt className="mr-2" /> Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
