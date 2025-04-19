import { useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const VerifyOtp = () => {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendMessage, setResendMessage] = useState(""); // Thêm trạng thái cho thông báo gửi lại
  const inputRefs = useRef([]);
  const location = useLocation();
  const userId = location.state?.userId;
  const navigate = useNavigate();

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
    setResendMessage(""); // Reset thông báo gửi lại

    try {
      const response = await axios.post("http://localhost:3001/verify-otp", {
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

  // Hàm xử lý gửi lại OTP
  const handleResendOtp = async () => {
    if (isLoading || !userId) return;

    setIsLoading(true);
    setError("");
    setResendMessage("");

    try {
      const response = await axios.post("http://localhost:3001/otp/resend", {
        userId,
      });
      setResendMessage("Mã OTP mới đã được gửi đến email của bạn!");
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-primaryblue">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-96 border border-gray-300">
        <h2 className="text-primary text-3xl font-semibold text-center mb-6">Xác nhận OTP</h2>
        <p className="text-gray-500 text-center mb-6">Nhập 6 số OTP đã gửi đến email của bạn.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
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
                className="w-12 h-12 text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-lg"
              />
            ))}
          </div>

          {error && <p className="text-red-500 text-center">{error}</p>}
          {resendMessage && <p className="text-green-500 text-center">{resendMessage}</p>}

          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primaryblue hover:text-primary transition"
            disabled={isLoading}
          >
            {isLoading ? "Đang xác minh..." : "Xác nhận OTP"}
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            onClick={handleResendOtp}
            disabled={isLoading || !userId}
            className="text-primary underline hover:text-primaryblue disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Gửi lại mã OTP
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Đã xác nhận?{" "}
          <Link to="/login" className="text-primary font-medium">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
};

export default VerifyOtp;