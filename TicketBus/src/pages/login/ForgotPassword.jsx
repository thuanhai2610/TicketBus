import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [otpSent, setOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userId, setUserId] = useState("");
  const [error, setError] = useState("");
  const [resendMessage, setResendMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0); // Thêm trạng thái đếm ngược gửi lại OTP
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Đếm ngược cho nút gửi lại OTP
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleSendOTP = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setError("Vui lòng nhập địa chỉ email của bạn.");
      return;
    }
    if (!emailRegex.test(email)) {
      setError("Vui lòng nhập email hợp lệ.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      setResendMessage("");
      const response = await axios.post("http://localhost:3001/forgot-password", { email });
      const { success, userId, message } = response.data;
      if (success === false) {
        setError(message || "Không tìm thấy email. Vui lòng kiểm tra lại.");
        return;
      }
      setOtpSent(true);
      setUserId(userId);
      setResendMessage("Mã OTP đã được gửi đến email của bạn!");
      setResendCooldown(60); // Đặt thời gian chờ 60 giây cho gửi lại OTP
    } catch (error) {
      setError(error.response?.data?.message || "Không thể gửi OTP. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!userId || isLoading || resendCooldown > 0) return;

    try {
      setIsLoading(true);
      setError("");
      setResendMessage("");
      const response = await axios.post("http://localhost:3001/otp/resend", {
        userId,
        isForgotPassword: true, // Thêm tham số này để backend truy vấn từ users
      });
      const { success, message } = response.data;
      if (success === false) {
        setError(message || "Gửi lại OTP thất bại. Vui lòng thử lại.");
        return;
      }
      setResendMessage("Mã OTP mới đã được gửi đến email của bạn!");
      setResendCooldown(60); // Đặt lại thời gian chờ
    } catch (error) {
      setError(error.response?.data?.message || "Gửi lại OTP thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("Vui lòng nhập mã OTP 6 chữ số.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      setResendMessage("");
      const response = await axios.post("http://localhost:3001/verify-otp", { otp: otpCode, userId });
      const { success, message } = response.data;
      if (!success) {
        setError(message || "Mã OTP không hợp lệ. Vui lòng thử lại.");
        return;
      }
      setIsOtpVerified(true);
    } catch (error) {
      setError(error.response?.data?.message || "Lỗi xác minh OTP. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    let newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("Text").trim();
    if (!/^\d{6}$/.test(pastedData)) return;

    const otpArray = pastedData.split("");
    setOtp(otpArray);
    otpArray.forEach((num, idx) => {
      if (inputRefs.current[idx]) {
        inputRefs.current[idx].value = num;
      }
    });

    inputRefs.current[5]?.focus();
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword !== confirmPassword) {
      setError("Mật khẩu không khớp. Vui lòng thử lại.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      const response = await axios.post("http://localhost:3001/change-password", {
        userId,
        newPassword,
      });
      alert(response.data.message || "Đặt lại mật khẩu thành công!");
      navigate("/login");
    } catch (error) {
      setError(error.response?.data?.message || "Lỗi đặt lại mật khẩu. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cover bg-center bg-primaryblue dark:bg-transparent">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-96 border border-gray-300 dark:bg-transparent">
        {!otpSent ? (
          <>
            <h2 className="text-primary dark:text-neutral-100 text-3xl font-semibold text-center mb-6">Quên Mật Khẩu</h2>
            <p className="text-gray-500 dark:text-neutral-300 text-center mb-6">
              Nhập địa chỉ email của bạn để nhận mã OTP đặt lại mật khẩu!
            </p>
            <div className="relative mb-4">
              <FaEnvelope className="absolute left-3 top-4 text-gray-400 dark:text-neutral-300" />
              <input
                type="email"
                placeholder="Địa chỉ email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border dark:bg-transparent border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading}
              />
            </div>
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            {resendMessage && <p className="text-green-500 text-center mb-4">{resendMessage}</p>}
            {isLoading && (
              <div className="text-center mb-4">
                <svg className="animate-spin h-5 w-5 mx-auto text-primary" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              </div>
            )}
            <button
              onClick={handleSendOTP}
              disabled={isLoading}
              className={`w-full bg-primary text-white py-3 rounded-lg text-lg font-semibold dark:hover:bg-slate-500 hover:bg-primary transition ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? "Đang gửi..." : "Gửi OTP"}
            </button>
          </>
        ) : !isOtpVerified ? (
          <>
            <h2 className="text-primary text-3xl font-semibold text-center mb-6 dark:text-neutral-200">Nhập OTP</h2>
            <p className="text-gray-500 text-center mb-6 dark:text-neutral-300">
              Vui lòng nhập mã OTP gồm 6 chữ số được gửi đến {email}.
            </p>
            <div className="flex justify-center gap-2 mb-4">
              {otp.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  value={data}
                  onChange={(e) => handleChange(e, index)}
                  onPaste={handlePaste}
                  ref={(el) => (inputRefs.current[index] = el)}
                  className="w-12 h-12 text-center border font-bold dark:text-neutral-50 dark:bg-transparent border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-lg"
                  disabled={isLoading}
                />
              ))}
            </div>
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            {resendMessage && <p className="text-green-500 text-center mb-4">{resendMessage}</p>}
            {isLoading && (
              <div className="text-center mb-4">
                <svg className="animate-spin h-5 w-5 mx-auto text-primary" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              </div>
            )}
            <button
              onClick={handleVerifyOTP}
              disabled={isLoading}
              className={`w-full bg-primary text-white py-3 rounded-lg text-lg font-semibold dark:hover:bg-slate-500 hover:bg-primary transition ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? "Đang xác minh..." : "Xác minh OTP"}
            </button>
            <p className="text-center text-sm text-gray-500 dark:text-neutral-400 mt-6">
              Không nhận được OTP?{" "}
              <button
                onClick={handleResendOTP}
                className="text-primary dark:text-neutral-100 font-bold underline"
                disabled={isLoading || !userId || resendCooldown > 0}
              >
                {resendCooldown > 0 ? `Gửi lại (${resendCooldown}s)` : "Gửi lại"}
              </button>
            </p>
          </>
        ) : (
          <>
            <h2 className="text-primary dark:text-neutral-100 text-3xl font-semibold text-center mb-6">Nhập Mật Khẩu Mới</h2>
            <p className="text-gray-500 dark:text-neutral-300 text-center mb-6">Nhập mật khẩu mới của bạn bên dưới.</p>
            <div className="relative mb-4">
              <FaLock className="absolute left-3 top-4 text-gray-400 dark:text-gray-200" />
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="Mật Khẩu Mới"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 border dark:bg-transparent border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading}
              />
              <span
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-4 text-gray-400 cursor-pointer"
              >
                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            <div className="relative mb-4">
              <FaLock className="absolute left-3 top-4 text-gray-400 dark:text-gray-200" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Xác nhận mật khẩu"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 border dark:bg-transparent border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading}
              />
              <span
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-4 text-gray-400 cursor-pointer"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            {isLoading && (
              <div className="text-center mb-4">
                <svg className="animate-spin h-5 w-5 mx-auto text-primary" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              </div>
            )}
            <button
              onClick={handleResetPassword}
              disabled={isLoading}
              className={`w-full bg-primary text-white py-3 rounded-lg text-lg font-semibold hover:bg-primary transition ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? "Đang đặt lại..." : "Đặt Lại Mật Khẩu"}
            </button>
          </>
        )}
        <p className="text-center text-sm text-gray-500 dark:text-neutral-300 mt-6">
          Ghi nhớ mật khẩu của bạn?{" "}
          <Link to="/login" className="text-primary font-bold dark:text-neutral-50 underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;