/* eslint-disable no-unused-vars */
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";
import Home from "./pages/home/Home";
import Ticket from "./pages/ticket/Ticket";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import ForgotPassword from "./pages/login/ForgotPassword";
import AdminLayout from "./layout/adminlayout/AdminLayout";
import ManageTrips from "./pages/admin/managetrips/ManageTrips";
import ManageTickets from "./pages/admin/managetickets/ManageTickets";
import ManageCustomers from "./pages/admin/managecustomers/ManageCustomers";
import AdminPage from "./pages/admin/adminpage/AdminPage";
import Blog from "./pages/blog/Blog";
import Offer from "./pages/offer/Offer";
import RevenueChart from "./pages/admin/revenuechart/RevenueChart";
import ProtectedRoute from "./components/protected/ProtectedRoute";
import VerifyOtp from "./pages/login/VerifyOtp";
import Profile from "./pages/profile/Profile";
import UpdateProfile from "./pages/profile/UpdateProfile";
import Detail from "./pages/ticket/detail/Detail";
import Checkout from "./pages/ticket/checkout/Checkout";
import Invoice from "./pages/ticket/invoice/Invoice";
import { ToastContainer, toast } from 'react-toastify';
import Employees from "./pages/admin/employee/Employee";
import 'react-toastify/dist/ReactToastify.css';
import TicketHistory from "./pages/profile/TicketHistory";
import BlogDetail from "./pages/blog/BlogDetail";
import VNPAY from "./pages/ticket/invoice/TicketVNPAY";
import QRCodeScanner from "./pages/ticket/qrcode/QRCodeScanner";
import React from "react";
import "./pages/ticket/qrcode/style.css";
import 'leaflet/dist/leaflet.css';
import Discount from "./pages/admin/Discout";
import SupportUser from "./pages/admin/SupportUser";
import AdminChatButton from "./components/chatbox/AdminChatButton";
import Support from "./pages/ticket/Support";
import ChatBot from "./components/Chatbot";
function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  // Kiểm tra xem người dùng đang ở trang admin hay trang khách
  const isAdminRoute = window.location.pathname.startsWith("/admin");

  return (
    <Router>
      <div className={darkMode ? "dark" : ""}>
        {/* Chỉ hiển thị Navbar nếu không phải trang admin */}
        {!isAdminRoute && <Navbar toggleDarkMode={toggleDarkMode} darkMode={darkMode} />}

        <main className="w-full flex flex-col bg-neutral-50 dark:bg-gray-900 text-black dark:text-white min-h-screen">
          <Routes>
            {/* Client Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/chatbot" element={<ChatBot />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<BlogDetail />} />
            <Route path="/offer" element={<Offer />} />
            <Route path="/bus-tickets" element={<Ticket />} />
            <Route path="/login" element={<Login />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/qr-scanner" element={<QRCodeScanner />} />
            <Route path="/user/profile" element={<Profile />}>
              <Route path="" element={<div />} /> {/* Thông tin mặc định */}
              <Route path="edit" element={<UpdateProfile />} />
              <Route path="history" element={<TicketHistory />} />
           
            </Route>

            <Route path="/bus-tickets/detail/:vehicleId" element={<Detail />} />
            <Route path="/bus-tickets/checkout" element={<Checkout />} />
            <Route path="/bus-tickets/payment" element={<Invoice />} />
            <Route path="/bus-tickets/VNPAY" element={<VNPAY />} />
            <Route path="/bus-tickets/support" element={<Support />} />

            {/* Admin Routes */}
            <Route path="/admin/*" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminPage />} />
              <Route path="manage-trips" element={<ManageTrips />} />z
              <Route path="manage-tickets" element={<ManageTickets />} />
              <Route path="manage-customers" element={<ManageCustomers />} />
              <Route path="manage-employees" element={<Employees />} />
              <Route path="revenue" element={<RevenueChart />} />
              <Route path="discount" element={<Discount />} />
              <Route path="support-user" element={<SupportUser />} />

            </Route>
          </Routes>
          {!isAdminRoute && (
            <div className="fixed bottom-6 right-6 z-50">
              <AdminChatButton />
            </div>
          )}
        </main>

        <Footer />
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </Router>
  );
}

export default App;