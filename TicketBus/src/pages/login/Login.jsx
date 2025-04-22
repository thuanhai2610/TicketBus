/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaRegEye, FaEyeSlash } from "react-icons/fa";
// import { FaSquareTwitter } from "react-icons/fa6";
import axios from "axios";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import bgLogin from "../../assets/bgLogin.jpg"


const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [socialLoading, setSocialLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.state?.error) {
            setError(location.state.error);
        }
    }, [location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isLoading) return;
        setIsLoading(true);
        setError("");

        try {
            const response = await axios.post("http://localhost:3001/login", {
                username,
                password,
            });
            const { success, access_token, role } = response.data;
            if (success === false) {
                alert(message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
                setError(message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
                return;
            }
            localStorage.setItem("token", access_token);
            localStorage.setItem("username", username);
            if (role === "admin") {
                navigate("/admin");
            } else {
                navigate("/");
            }
            window.location.reload();
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Đăng nhập lỗi, vui lòng kiểm tra lại thông tin đăng nhập.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setSocialLoading(true);
        setError("");
        try {
            const response = await axios.post("http://localhost:3001/google-login", {
                credential: credentialResponse.credential,
            });
            const { access_token, role, username } = response.data;
            localStorage.setItem("token", access_token);
            localStorage.setItem("username", username);
            if (role === "admin") {
                navigate("/admin");
            } else {
                navigate("/");
            }
            window.location.reload();
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Google login failed. Please try again.";
            setError(errorMessage);
        } finally {
            setSocialLoading(false);
        }
    };

    const handleGoogleFailure = () => {
        setError("Google login failed. Please try again.");
        setSocialLoading(false);
    };
    const handleFacebookSuccess = (response) => {
        console.log("Facebook login success:", response);
    };

    const handleFacebookFailure = (error) => {
        console.error("Facebook login failed:", error);
    };
    return (
        <GoogleOAuthProvider clientId={"1055268521864-uqrdrd5mpqbeskmqe28gb2kk37050t4b.apps.googleusercontent.com"}>
            <div
                className="flex min-h-screen items-center justify-center bg-cover bg-center dark:bg-transparent"
                style={{backgroundImage: `url(${bgLogin})` }}
            >
                <div className="bg-white p-10 mt-10 rounded-2xl shadow-2xl shadow-primary dark:shadow-xl dark:shadow-slate-200 w-96 border border-gray-300 dark:bg-primary">
                    <h2 className="text-primary text-3xl font-semibold text-center mb-6 uppercase dark:text-neutral-50">đăng Nhập</h2>

                    {error && <p className="text-primary text-center mb-4">{error}</p>}
                    <div className="space-y-4">

                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleFailure}
                            render={(renderProps) => (
                                <button
                                    onClick={renderProps.onClick}
                                    disabled={renderProps.disabled || socialLoading}
                                    className="flex items-center  justify-center w-full py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-primary hover:text-white transition duration-200"
                                >
                                    <FcGoogle className="mr-2" /> {socialLoading ? "Loading..." : "Log in with Google"}
                                </button>
                            )}
                        />
                    </div>


                    <div className="my-6 flex items-center">
                        <div className="flex-1 border-t border-gray-300"></div>
                        <p className="mx-3 text-gray-500 text-sm dark:text-neutral-200">Hoặc</p>
                        <div className="flex-1 border-t border-gray-300"></div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-neutral-500 dark:text-neutral-200">Tên Đăng Nhập</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-transparent dark:focus:ring-slate-300"
                                required
                            />
                        </div>

                        <div className="relative">
                            <label className="block text-neutral-500 dark:text-neutral-200">Mật Khẩu</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary pr-10 dark:bg-transparent dark:focus:ring-slate-300"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-11 transform -translate-y-1/2 text-gray-500 dark:text-neutral-300"
                            >
                                {showPassword ? <FaRegEye size={18} /> : <FaEyeSlash size={18} />}
                            </button>
                        </div>

                        <div className="flex justify-between items-center text-sm text-gray-500 dark:text-neutral-300">
                            <label className="flex items-center">
                                <input type="checkbox" className="mr-2" /> Lưu Tài Khoản
                            </label>
                            <Link to="/forgot-password" className="text-primary dark:text-neutral-200 underline font-bold">Quên Mật Khẩu?</Link>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary transition dark:bg-slate-500"
                            disabled={isLoading}
                        >
                            {isLoading ? "Logging in..." : "Đăng Nhập"}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-6 dark:text-neutral-300">
                        Chưa Có Tài Khoản? <Link to="/register" className="text-primary font-bold dark:text-neutral-200 underline ">Đăng Ký </Link>
                    </p>
                </div>
            </div>
        </GoogleOAuthProvider>
    );
};

export default Login;