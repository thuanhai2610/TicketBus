import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const VerifyOtp = () => {
    const [otp, setOtp] = useState(new Array(6).fill(""));
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const inputRefs = useRef([]);
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

        // Move focus to last input
        inputRefs.current[5]?.focus();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isLoading) return;

        const otpCode = otp.join("");
        if (otpCode.length !== 6) {
            setError("Please enter the 6-digit OTP.");
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post("http://localhost:3001/verify-otp", {
                otp: otpCode,
            });
            alert(response.data.message);
            navigate("/login");
        } catch (error) {
            const errorMessage = error.response?.data?.message || "OTP verification failed.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-primaryblue">
            <div className="bg-white p-10 rounded-2xl shadow-2xl w-96 border border-gray-300">
                <h2 className="text-primary text-3xl font-semibold text-center mb-6">Verify OTP</h2>
                <p className="text-gray-500 text-center mb-6">Please enter the 6-digit OTP sent to your email.</p>

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

                    {error && <p className="text-primary text-center">{error}</p>}

                    <button
                        type="submit"
                        className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primaryblue hover:text-primary transition"
                        disabled={isLoading}
                    >
                        {isLoading ? "Verifying..." : "Verify OTP"}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Already verified?{" "}
                    <Link to="/login" className="text-primary font-medium">
                        Log In
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default VerifyOtp;
