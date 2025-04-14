/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaRegEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import FacebookLogin from "react-facebook-login/dist/facebook-login-render-props";

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
    
    useEffect(() => {
        // Tải SDK Facebook
        window.fbAsyncInit = function () {
          window.FB.init({
            appId: '662001183185682', // Thay bằng App ID của bạn
            cookie: true,
            xfbml: true,
            version: 'v20.0', // Sử dụng phiên bản mới nhất
          });
        };
      
        (function (d, s, id) {
          var js,
            fjs = d.getElementsByTagName(s)[0];
          if (d.getElementById(id)) return;
          js = d.createElement(s);
          js.id = id;
          js.src = 'https://connect.facebook.net/en_US/sdk.js';
          fjs.parentNode.insertBefore(js, fjs);
        })(document, 'script', 'facebook-jssdk');
      }, []);
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

    const handleFacebookLogin = async () => {
        setSocialLoading(true);
        setError('');
        try {
          // Gửi yêu cầu đến backend để lấy URL đăng nhập
          const res = await axios.get('http://localhost:3001/facebook-login-url');
          window.location.href = res.data.authUrl;
        } catch (err) {
          setError('Không thể bắt đầu đăng nhập Facebook. Vui lòng thử lại.');
          setSocialLoading(false);
        }
      };
      useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        if (token) {
          localStorage.setItem('token', token);
          navigate('/');
        }
      }, [location, navigate]);
    const handleGoogleFailure = () => {
        setError("Google login failed. Please try again.");
        setSocialLoading(false);
    };

    return (
        <GoogleOAuthProvider clientId="1055268521864-uqrdrd5mpqbeskmqe28gb2kk37050t4b.apps.googleusercontent.com">
            <div className="flex min-h-screen items-center justify-center bg-primaryblue">
                <div className="bg-white p-10 rounded-2xl shadow-2xl w-96 border border-gray-300">
                    <h2 className="text-primary text-3xl font-semibold text-center mb-6">Welcome Back</h2>

                    {error && <p className="text-primary text-center mb-4">{error}</p>}

                    <div className="space-y-4">
                        {/* <FacebookLogin
                          appId='662001183185682'
                            autoLoad={false}
                            callback={handleFacebookLogin}
                            onFailure={handleFacebookFailure}
                            render={(renderProps) => ( */}
                                <button
                                    onClick={handleFacebookLogin}
                                    disabled={socialLoading}
                                    className="flex items-center justify-center w-full py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-primary hover:text-white transition duration-200"
                                >
                                    <FaFacebook className="mr-2" />
                                    {socialLoading ? "Loading..." : "Log in with Facebook"}
                                </button>
                            {/* )}
                        /> */}

                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleFailure}
                            render={(renderProps) => (
                                <button
                                    onClick={renderProps.onClick}
                                    disabled={renderProps.disabled || socialLoading}
                                    className="flex items-center justify-center w-full py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-primary hover:text-white transition duration-200"
                                >
                                    <FcGoogle className="mr-2" />
                                    {socialLoading ? "Loading..." : "Log in with Google"}
                                </button>
                            )}
                        />
                    </div>

                    <div className="my-6 flex items-center">
                        <div className="flex-1 border-t border-gray-300"></div>
                        <p className="mx-3 text-gray-500 text-sm">Or</p>
                        <div className="flex-1 border-t border-gray-300"></div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-neutral-500">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>

                        <div className="relative">
                            <label className="block text-neutral-500">Password</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary pr-10"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-11 transform -translate-y-1/2 text-gray-500"
                            >
                                {showPassword ? <FaRegEye size={20} /> : <FaEyeSlash size={20} />}
                            </button>
                        </div>

                        <div className="flex justify-between items-center text-sm text-gray-500">
                            <label className="flex items-center">
                                <input type="checkbox" className="mr-2" /> Keep me logged in
                            </label>
                            <Link to="/forgot-password" className="text-primary">Forgot Password?</Link>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary transition"
                            disabled={isLoading}
                        >
                            {isLoading ? "Logging in..." : "Log In"}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        Need an account? <Link to="/register" className="text-primary font-medium">Sign Up</Link>
                    </p>
                </div>
            </div>
        </GoogleOAuthProvider>
    );
};

export default Login;
