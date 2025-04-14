import React, { useState, useRef } from "react";
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
    const [userId, setUserId] = useState(""); // Store userId from forgot password and OTP verification
    const [error, setError] = useState(""); // Add error state for displaying errors
    const inputRefs = useRef([]);
    const navigate = useNavigate();
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);


    const handleSendOTP = async () => {
        if (!email) {
            setError("Vui lòng nhập địa chỉ email của bạn.");
            return;
        }

        try {
            const response = await axios.post("http://localhost:3001/forgot-password", { email });
            setOtpSent(true);
            setUserId(response.data.userId); // Store the userId returned from the backend
            setError("");
        } catch (error) {
            setError(error.response?.data?.message || "Error sending OTP. Please try again.");
            console.error("Error sending OTP:", error);
        }
    };

    const handleVerifyOTP = async () => {
        const otpCode = otp.join("");
        if (otpCode.length !== 6) {
            setError("Please enter a 6-digit OTP.");
            return;
        }

        try {
            const response = await axios.post("http://localhost:3001/verify-otp", { otp: otpCode });
            setIsOtpVerified(true);
            setUserId(response.data.userId); // Update userId in case it's needed (already set from forgot-password)
            setError("");
        } catch (error) {
            setError(error.response?.data?.message || "Error verifying OTP. Please try again.");
            console.error("Error verifying OTP:", error);
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

        // Move focus to last input
        inputRefs.current[5]?.focus();
    };
    const handleResetPassword = async () => {
        if (!newPassword || newPassword !== confirmPassword) {
            setError("Mật khẩu không khớp. Vui lòng thử lại.");
            return;
        }

        try {
            const response = await axios.post("http://localhost:3001/change-password", {
                userId,
                newPassword,
            });
            alert(response.data.message);
            navigate("/login");
        } catch (error) {
            setError(error.response?.data?.message || "Error resetting password. Please try again.");
            console.error("Error resetting password:", error);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-cover bg-center bg-primaryblue dark:bg-transparent">
            <div className="bg-white p-10 rounded-2xl shadow-2xl w-96 border border-gray-300 dark:bg-transparent">
                {!otpSent ? (
                    <>
                        <h2 className="text-primary dark:text-neutral-100 text-3xl font-semibold text-center mb-6">Quên Mật Khẩu</h2>
                        <p className="text-gray-500 dark:text-neutral-300 text-center mb-6">Nhập địa chỉ EMAIL của bạn để nhận mã OTP đặt lại mật khẩu!</p>
                        <div className="relative mb-4">
                            <FaEnvelope className="absolute left-3 top-4 text-gray-400 dark:text-neutral-300" />
                            <input
                                type="email"
                                placeholder="Địa chỉ email của bạn"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border dark:bg-transparent border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        {error && <p className="text-primary text-center mb-4">{error}</p>}
                        <button onClick={handleSendOTP} className="w-full bg-primary text-white py-3 rounded-lg text-lg font-semibold dark:hover:bg-slate-500 hover:bg-primary transition">
                            Gửi OTP
                        </button>
                    </>
                ) : !isOtpVerified ? (
                    <>
                        <h2 className="text-primary text-3xl font-semibold text-center mb-6 dark:text-neutral-200">Nhập OTP</h2>
                        <p className="text-gray-500 text-center mb-6 dark:text-neutral-300">Vui lòng nhập mã OTP gồm 6 chữ số được gửi đến {email}.</p>
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
                                />
                            ))}
                        </div>
                        {error && <p className="text-primary text-center mb-4">{error}</p>}
                        <button onClick={handleVerifyOTP} className="w-full bg-primary text-white py-3 rounded-lg text-lg font-semibold dark:hover:bg-slate-500 hover:bg-primary transition">
                            Xác minh OTP
                        </button>
                        <p className="text-center text-sm text-gray-500  dark:text-neutral-400 mt-6">
                            Không nhận được OTP? <button onClick={handleSendOTP} className="text-primary dark:text-neutral-100 font-bolf">Gửi lại</button>
                        </p>
                    </>
                ) : (
                    <>
                        <h2 className="text-primary  dark:text-neutral-100 text-3xl font-semibold text-center mb-6">Nhập Mật Khẩu Mới</h2>
                        <p className="text-gray-500 dark:text-neutral-300 text-center mb-6">Nhập mật khẩu mới của bạn bên dưới.</p>
                        <div className="relative mb-4">
                            <FaLock className="absolute left-3 top-4 text-gray-400 dark:text-gray-200" />
                            <input
                                type={showNewPassword ? "text" : "password"}
                                placeholder="Mật Khẩu Mới"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full pl-10 pr-10 py-3 border dark:bg-transparent border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
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
                            />
                            <span
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-4 text-gray-400 cursor-pointer"
                            >
                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>

                        {error && <p className="text-primary text-center mb-4">{error}</p>}
                        <button onClick={handleResetPassword} className="w-full bg-primary text-white py-3 rounded-lg text-lg font-semibold hover:bg-primary transition">
                            Đặt Lại Mật Khẩu
                        </button>
                    </>
                )}
                <p className="text-center text-sm text-gray-500 dark:text-neutral-300 mt-6">
                    Ghi nhớ mật khẩu của bạn? <Link to="/login" className="text-primary font-bold dark:text-neutral-50 underline">Đăng nhập</Link>
                </p>
            </div>
        </div>
    );
}

export default ForgotPassword;