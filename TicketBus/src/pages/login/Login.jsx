/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import {  FaRegEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
// import FacebookLogin from "react-facebook-login/dist/facebook-login-render-props";

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
    
    const storeAndRedirect = ({ access_token, role, username }) => {
        localStorage.setItem("token", access_token);
        localStorage.setItem("username", username || "");
        navigate(role === "admin" ? "/admin" : "/");
        window.location.reload();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isLoading) return;
        setIsLoading(true);
        setError("");

        try {
            const res = await axios.post("http://localhost:3001/login", { username, password });
            storeAndRedirect(res.data);
        } catch (err) {
            const msg = err.response?.data?.message || "Login failed. Please check your credentials.";
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSuccess = async (response) => {
        setSocialLoading(true);
        setError("");
        try {
            const res = await axios.post("http://localhost:3001/google-login", {
                credential: response.credential,
            });
            storeAndRedirect(res.data);
        } catch (err) {
            const msg = err.response?.data?.message || "Google login failed. Please try again.";
            setError(msg);
        } finally {
            setSocialLoading(false);
        }
    };

     
    const handleGoogleFailure = () => {
        setError("Google login failed. Please try again.");
        setSocialLoading(false);
    };

    return (
        <GoogleOAuthProvider clientId="1055268521864-uqrdrd5mpqbeskmqe28gb2kk37050t4b.apps.googleusercontent.com">
            <div className="flex min-h-screen items-center justify-center bg-primaryblue dark:bg-transparent">
                <div className="bg-white p-10 rounded-2xl shadow-2xl w-96 border border-gray-300 dark:bg-transparent">
                    <h2 className="text-primary text-3xl font-bold text-center mb-6 dark:text-neutral-50 uppercase ">Đăng Nhập </h2>

                    {error && <p className="text-primary text-center mb-4">{error}</p>}

                    <div className="space-y-4">
                 

                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleFailure}
                            render={(renderProps) => (
                                <button
                                    onClick={renderProps.onClick}
                                    disabled={renderProps.disabled || socialLoading}
                                    className="flex  items-center justify-center w-full py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-primary hover:text-white transition duration-200 "
                                >
                                    <FcGoogle className="mr-2" />
                                    {socialLoading ? "Loading..." : "Log in with Google"}
                                </button>
                            )}
                        />
                    </div>

                    <div className="my-6 flex items-center">
                        <div className="flex-1 border-t border-gray-300"></div>
                        <p className="mx-3 text-gray-500 text-sm">Hoặc</p>
                        <div className="flex-1 border-t border-gray-300"></div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-neutral-500 dark:text-neutral-50  ">Tên đăng nhập</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full dark:bg-transparent dark:focus:ring-neutral-50 dark:text-neutral-100 px-4 py-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-primaryblue"
                                required
                            />
                        </div>

                        <div className="relative">
                            <label className="block text-neutral-500 dark:text-neutral-50">Mật khẩu</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full dark:bg-transparent dark:focus:ring-neutral-50 dark:text-neutral-100 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary pr-10"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-11 transform -translate-y-1/2 text-gray-500 dark:text-neutral-300"
                            >
                                {showPassword ? <FaRegEye size={20} /> : <FaEyeSlash size={18} />}
                            </button>
                        </div>

                        <div className="flex justify-between items-center text-sm text-gray-500 dark:text-neutral-300">
                            <label className="flex items-center">
                                <input type="checkbox" className="mr-2" /> Ghi nhớ tài khoản
                            </label>
                            <Link to="/forgot-password" className="text-primary dark:text-neutral-200 font-bold underline">Quên Mật Khẩu?</Link>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-primary dark:bg-slate-500 dark:hover:bg-slate-400 text-white py-2 rounded-lg hover:bg-primary transition"
                            disabled={isLoading}
                        >
                            {isLoading ? "Logging in..." : "Log In"}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 dark:text-neutral-300 mt-6">
                        Đăng ký tài khoản? <Link to="/register" className="text-primary font-bold dark:text-neutral-200 underline">Đăng Ký</Link>
                    </p>
                </div>
            </div>
        </GoogleOAuthProvider>
    );
};

export default Login;
