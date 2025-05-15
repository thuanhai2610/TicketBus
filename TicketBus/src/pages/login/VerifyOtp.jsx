/* eslint-disable no-unused-vars */
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import bgLogin from "../../assets/bgLogin.jpg";

// Separate component for the OTP form to avoid re-rendering
function OtpForm({
  otp,
  setOtp,
  inputRefs,
  handleChange,
  handlePaste,
  isLoading,
  error,
  resendMessage,
  handleSubmit,
  handleResendOtp,
  userId,
  resendCooldown,
}) {
  return (
    <>
      <h2 className="text-primary text-2xl sm:text-3xl font-semibold text-center mb-4 sm:mb-6 dark:text-neutral-50 uppercase">
        Xác Nhận OTP
      </h2>
      <p className="text-gray-500 text-center mb-4 sm:mb-6 dark:text-neutral-300 text-sm sm:text-base">
        Nhập 6 số OTP đã gửi đến email của bạn.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        <div className="flex justify-center gap-1 sm:gap-2 mb-4">
          {otp.map((data, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              value={data}
              onChange={(e) => handleChange(e, index)}
              onPaste={handlePaste}
              ref={(el) => (inputRefs.current[index] = el)}
              className="w-10 h-10 sm:w-12 sm:h-12 text-center border font-bold dark:text-neutral-50 dark:bg-transparent border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-slate-300 text-lg sm:text-xl"
              inputMode="numeric"
              pattern="[0-9]*"
              disabled={isLoading}
            />
          ))}
        </div>
        {error && <p className="text-red-500 text-center text-sm">{error}</p>}
        {resendMessage && <p className="text-green-500 text-center text-sm">{resendMessage}</p>}
        <button
          type="submit"
          className={`w-full ${isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-primary hover:bg-primaryblue"} text-white py-2 sm:py-3 rounded-lg transition duration-300 dark:bg-slate-500`}
          disabled={isLoading}
        >
          {isLoading ? "Đang xác minh..." : "Xác Nhận OTP"}
        </button>
      </form>
      <p className="text-center text-sm text-gray-500 dark:text-neutral-300 mt-4 sm:mt-6">
        Không nhận được OTP?{" "}
        <button
          onClick={handleResendOtp}
          disabled={isLoading || !userId || resendCooldown > 0}
          className="text-primary dark:text-neutral-200 font-bold underline hover:text-primaryblue disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          {resendCooldown > 0 ? `Gửi lại (${resendCooldown}s)` : "Gửi lại"}
        </button>
      </p>
    </>
  );
}

const VerifyOtp = () => {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendMessage, setResendMessage] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const inputRefs = useRef([]);
  const location = useLocation();
  const userId = location.state?.userId;
  const navigate = useNavigate();

  // Handle resize for mobile/desktop toggle
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Countdown for OTP resend
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("Nhập 6 số của mã OTP");
      return;
    }

    setIsLoading(true);
    setError("");
    setResendMessage("");

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/verify-otp`, {
        otp: otpCode,
        userId,
      });
      if (response.data.message.includes("successfully")) {
        alert("Đã cập nhật email, vui lòng đăng nhập.");
        navigate("/login");
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      const status = error.response?.status;

      if (status === 400 || status === 404) {
        setError("Không tìm thấy mã OTP hoặc mã sai.");
      } else {
        setError("Xác minh OTP thất bại. Vui lòng thử lại.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (isLoading || !userId || resendCooldown > 0) return;

    setIsLoading(true);
    setError("");
    setResendMessage("");

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/otp/resend`, {
        userId,
      });
      setResendMessage("Mã OTP mới đã được gửi đến email của bạn!");
      setResendCooldown(60);
    } catch (error) {
      const status = error.response?.status;
      if (status === 404) {
        setError("Không tìm thấy người dùng. Vui lòng đăng ký lại.");
      } else {
        setError("Gửi lại mã OTP thất bại. Vui lòng thử lại.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Desktop layout
  const DesktopVerifyOtp = (
    <div
      className="hidden sm:flex items-center justify-center min-h-screen bg-primaryblue dark:bg-progress"
      style={{ backgroundImage: `url(${bgLogin})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="bg-white dark:bg-primary p-10 rounded-2xl shadow-2xl shadow-primary dark:shadow-xl dark:shadow-slate-200 w-96 h-auto border border-gray-300">
        <OtpForm
          otp={otp}
          setOtp={setOtp}
          inputRefs={inputRefs}
          handleChange={handleChange}
          handlePaste={handlePaste}
          isLoading={isLoading}
          error={error}
          resendMessage={resendMessage}
          handleSubmit={handleSubmit}
          handleResendOtp={handleResendOtp}
          userId={userId}
          resendCooldown={resendCooldown}
        />
        <p className="text-center text-sm text-gray-500 mt-6 dark:text-neutral-300">
          Đã xác nhận?{" "}
          <Link to="/login" className="text-primary font-bold dark:text-neutral-200 underline">
            Đăng Nhập
 avoiding the use of the term "login" directly in the UI text
          </Link>
        </p>
      </div>
    </div>
  );

  // Mobile layout
  const MobileVerifyOtp = (
    <div className="sm:hidden flex items-center justify-center min-h-screen bg-white dark:bg-primary p-6">
      <div className="w-full max-w-md">
        <OtpForm
          otp={otp}
          setOtp={setOtp}
          inputRefs={inputRefs}
          handleChange={handleChange}
          handlePaste={handlePaste}
          isLoading={isLoading}
          error={error}
          resendMessage={resendMessage}
          handleSubmit={handleSubmit}
          handleResendOtp={handleResendOtp}
          userId={userId}
          resendCooldown={resendCooldown}
        />
        <p className="text-center text-sm text-gray-500 mt-6 dark:text-neutral-300">
          Đã xác nhận?{" "}
          <Link to="/login" className="text-primary font-bold dark:text-neutral-200 underline">
            Đăng Nhập
          </Link>
        </p>
      </div>
    </div>
  );

  return isMobile ? MobileVerifyOtp : DesktopVerifyOtp;
};

export default VerifyOtp;