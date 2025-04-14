import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaGithub, FaDiscord, FaApple, FaRegEye, FaEyeSlash } from "react-icons/fa";
import { FaSquareTwitter } from "react-icons/fa6";
import axios from "axios";
const Register = () => {
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // Add loading state
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isLoading) return;

        setIsLoading(true);

        try {
            const response = await axios.post("http://localhost:3001/register", {
                username,
                password,
                email,
            });

            alert(response.data.message); // "OTP sent to your email"
            if (response.data.otp) {
                alert(`For testing: Your OTP is ${response.data.otp}`);
            }
            navigate("/verify-otp")
        } catch (error) {
            // Log the full error for debugging
            console.error('Registration error:', error);
            // Display the specific error message from the backend
            const errorMessage = error.response?.data?.message || "Registration failed. Please try again.";
            alert("Error: " + errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-primaryblue dark:bg-transparent">
            <div className="bg-white dark:bg-transparent p-10 rounded-2xl shadow-2xl w-96 h-auto border border-gray-300 justify-end">
                <h2 className="text-primary text-3xl font-bold text-center mb-6 dark:text-neutral-50 uppercase">Đăng ký</h2>

                <div className=" flex items-center">
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-neutral-500 dark:text-neutral-200">Tên đăng nhập</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg dark:bg-transparent dark:text-neutral-100 dark:focus:ring-primaryblue/100 focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-neutral-500 dark:text-neutral-200">Địa chỉ Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg dark:bg-transparent dark:text-neutral-100 dark:focus:ring-primaryblue/100 focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                        />
                    </div>
                    <div className="relative">
                        <label className="block text-neutral-500 dark:text-neutral-200">Mật khẩu</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg dark:bg-transparent dark:text-neutral-100 dark:focus:ring-primaryblue/100 focus:outline-none focus:ring-2 focus:ring-primary pr-10"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-11 transform -translate-y-1/2 text-gray-500 dark:text-gray-300"
                        >
                            {showPassword ? <FaRegEye size={18} /> : <FaEyeSlash size={18} />}
                        </button>
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            checked={agreeTerms}
                            onChange={(e) => setAgreeTerms(e.target.checked)}
                            className="mr-2"
                        />
                        <p className="text-sm text-neutral-500 dark:text-neutral-300">
                            Việc tạo tài khoản đồng nghĩa với việc bạn đồng ý với
                            <span className="text-primary cursor-pointer dark:text-primaryblue/100"> Điều khoản Dịch vụ</span>,
                            <span className="text-primary cursor-pointer dark:text-primaryblue/100"> Chính sách Bảo mật</span>,
                            và <span className="text-primary cursor-pointer dark:text-primaryblue/100"> Cài đặt Thông báo mặc định</span> của chúng tôi.
                        </p>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primaryblue hover:text-primary transition duration-300"
                    >
                        Đăng Ký
                    </button>
                </form>

                <p className="text-center text-neutral-500 dark:text-neutral-300 mt-4">
                    Đã có tài khoản?
                    <Link to="/login" className="text-primary dark:text-neutral-50 font-bold underline hover:underline ml-1">
                        Đăng nhập
                    </Link>
                </p>
            </div>
        </div>
    );

};

export default Register;
