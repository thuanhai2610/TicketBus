import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaRegEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import bgLogin from "../../assets/bgLogin.jpg";

// Tách ra component LoginForm để tránh tạo lại khi render lại
function LoginForm({
  username,
  setUsername,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  isLoading,
  error,
  handleSubmit,
}) {
  return (
    <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
      <div>
        <label className="block text-neutral-500 dark:text-neutral-200">Tên Đăng Nhập</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-transparent dark:focus:ring-slate-300"
          required
          autoComplete="username"
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
          autoComplete="current-password"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-11 transform -translate-y-1/2 text-gray-500 dark:text-neutral-300"
          tabIndex={-1}
        >
          {showPassword ? <FaRegEye size={18} /> : <FaEyeSlash size={18} />}
        </button>
      </div>

      <div className="flex justify-between items-center text-sm text-gray-500 dark:text-neutral-300">
        <label className="flex items-center">
          <input type="checkbox" className="mr-2" /> Lưu Tài Khoản
        </label>
        <Link to="/forgot-password" className="text-primary dark:text-neutral-200 underline font-bold">
          Quên Mật Khẩu?
        </Link>
      </div>

      {error && <p className="text-red-500 text-center">{error}</p>}

      <button
        type="submit"
        className={`w-full ${isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-primary hover:bg-primaryblue"} text-white py-2 rounded-lg transition duration-300 dark:bg-slate-500`}
        disabled={isLoading}
      >
        {isLoading ? "Đang đăng nhập..." : "Đăng Nhập"}
      </button>
    </form>
  );
}

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Mobile state
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(() => {
    if (location.state?.error) {
      setError(location.state.error);
    }
  }, [location]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/login`, {
        username,
        password,
      });
      const { success, access_token, role, message } = response.data;
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
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/google-login`, {
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

  // Desktop layout
  const DesktopLogin = (
    <div
      className="hidden sm:flex items-center justify-center min-h-screen bg-primaryblue dark:bg-transparent"
      style={{ backgroundImage: `url(${bgLogin})` }}
    >
      <div className="bg-white dark:bg-primary p-10 rounded-2xl shadow-2xl shadow-primary dark:shadow-xl dark:shadow-slate-200 w-96 h-auto border border-gray-300">
        <h2 className="text-primary text-3xl font-semibold text-center mb-6 uppercase dark:text-neutral-50">
          Đăng Nhập
        </h2>

        <div className="space-y-4 mb-6">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleFailure}
            render={(renderProps) => (
              <button
                onClick={renderProps.onClick}
                disabled={renderProps.disabled || socialLoading}
                className="flex items-center justify-center w-full py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-primary hover:text-white transition duration-200"
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

        <LoginForm
          username={username}
          setUsername={setUsername}
          password={password}
          setPassword={setPassword}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          isLoading={isLoading}
          error={error}
          handleSubmit={handleSubmit}
        />

        <p className="text-center text-sm text-gray-500 mt-6 dark:text-neutral-300">
          Chưa Có Tài Khoản?{" "}
          <Link to="/register" className="text-primary font-bold dark:text-neutral-200 underline">
            Đăng Ký
          </Link>
        </p>
      </div>
    </div>
  );

  // Mobile layout
  const MobileLogin = (
    <div className="sm:hidden flex items-center justify-center min-h-screen bg-white dark:bg-primary p-6">
      <div className="w-full max-w-md">
        <h2 className="text-primary text-2xl font-semibold text-center mb-4 uppercase dark:text-neutral-50">
          Đăng Nhập
        </h2>

        <div className="space-y-4 mb-6">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleFailure}
            render={(renderProps) => (
              <button
                onClick={renderProps.onClick}
                disabled={renderProps.disabled || socialLoading}
                className="flex items-center justify-center w-full py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-primary hover:text-white transition duration-200"
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

        <LoginForm
          username={username}
          setUsername={setUsername}
          password={password}
          setPassword={setPassword}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          isLoading={isLoading}
          error={error}
          handleSubmit={handleSubmit}
        />

        <p className="text-center text-sm text-gray-500 mt-6 dark:text-neutral-300">
          Chưa Có Tài Khoản?{" "}
          <Link to="/register" className="text-primary font-bold dark:text-neutral-200 underline">
            Đăng Ký
          </Link>
        </p>
      </div>
    </div>
  );

  return isMobile ? MobileLogin : DesktopLogin;
};

export default Login;
