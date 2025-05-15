import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import bgRegister from "../../assets/bgRegister.jpg";
import { FaRegEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";

// Tách ra ngoài để tránh tạo lại khi render lại
function RegisterForm({
  username, setUsername,
  email, setEmail,
  password, setPassword,
  confirmPassword, setConfirmPassword,
  showPassword, setShowPassword,
  showConfirmPassword, setShowConfirmPassword,
  agreeTerms, setAgreeTerms,
  errors, isLoading,
  handleSubmit
}) {
  return (
    <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
      <div>
        <label className="block text-neutral-500 dark:text-neutral-200">Tên đăng nhập</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg dark:bg-transparent dark:text-neutral-100 dark:focus:ring-primaryblue/100 focus:outline-none focus:ring-2 focus:ring-primary"
          required
          autoComplete="off"
        />
        {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
      </div>

      <div>
        <label className="block text-neutral-500 dark:text-neutral-200">Địa chỉ Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg dark:bg-transparent dark:text-neutral-100 dark:focus:ring-primaryblue/100 focus:outline-none focus:ring-2 focus:ring-primary"
          required
          autoComplete="off"
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
      </div>

      <div className="relative">
        <label className="block text-neutral-500 dark:text-neutral-200">Mật khẩu</label>
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg dark:bg-transparent dark:text-neutral-100 dark:focus:ring-primaryblue/100 focus:outline-none focus:ring-2 focus:ring-primary pr-10"
          required
          autoComplete="new-password"
        />
        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-11 transform -translate-y-1/2 text-gray-500 dark:text-gray-300"
          tabIndex={-1}
        >
          {showPassword ? <FaRegEye size={18} /> : <FaEyeSlash size={18} />}
        </button>
      </div>

      <div className="relative">
        <label className="block text-neutral-500 dark:text-neutral-200">Xác nhận mật khẩu</label>
        <input
          type={showConfirmPassword ? "text" : "password"}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg dark:bg-transparent dark:text-neutral-100 dark:focus:ring-primaryblue/100 focus:outline-none focus:ring-2 focus:ring-primary pr-10"
          required
          autoComplete="new-password"
        />
        {errors.confirmPassword && (
          <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
        )}
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute right-3 top-11 transform -translate-y-1/2 text-gray-500 dark:text-gray-300"
          tabIndex={-1}
        >
          {showConfirmPassword ? <FaRegEye size={18} /> : <FaEyeSlash size={18} />}
        </button>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          checked={agreeTerms}
          onChange={(e) => setAgreeTerms(e.target.checked)}
          className="mr-2"
          id="agreeTerms"
        />
        <label htmlFor="agreeTerms" className="text-sm text-neutral-500 dark:text-neutral-300 cursor-pointer">
          Việc tạo tài khoản đồng nghĩa với việc bạn đồng ý với
          <span className="text-primary cursor-pointer dark:text-primaryblue/100">
            {" "}Điều khoản Dịch vụ
          </span>, 
          <span className="text-primary cursor-pointer dark:text-primaryblue/100">
            {" "}Chính sách Bảo mật
          </span>, và{" "}
          <span className="text-primary cursor-pointer dark:text-primaryblue/100">
            Cài đặt Thông báo mặc định
          </span>{" "}
          của chúng tôi.
        </label>
      </div>

      <button
        type="submit"
        disabled={isLoading || !agreeTerms}
        className={`w-full ${
          isLoading || !agreeTerms ? "bg-gray-400 cursor-not-allowed" : "bg-primary hover:bg-primaryblue"
        } dark:bg-slate-500 text-white py-2 rounded-lg transition duration-300`}
      >
        {isLoading ? "Đang đăng ký..." : "Đăng Ký"}
      </button>
    </form>
  );
}

const Register = () => {
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();

  // Mobile state
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

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

    let valid = true;
    const newErrors = { username: "", email: "", password: "", confirmPassword: "" };

    if (!username.trim()) {
      newErrors.username = "Tên đăng nhập không được để trống.";
      valid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = "Email không được để trống.";
      valid = false;
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Email không đúng định dạng.";
      valid = false;
    } else if (!email.toLowerCase().endsWith("@gmail.com")) {
      newErrors.email = "Chỉ chấp nhận địa chỉ Gmail.";
      valid = false;
    }

    if (!password) {
      newErrors.password = "Mật khẩu không được để trống.";
      valid = false;
    } else if (password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
      valid = false;
    }

    if (confirmPassword !== password) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp.";
      valid = false;
    }

    setErrors(newErrors);
    if (!valid) return;

    setIsLoading(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/register`, {
        username,
        password,
        email,
      });

      if (response.data.success === false) {
        setErrors((prev) => ({
          ...prev,
          username: response.data.message || "Đăng ký thất bại. Vui lòng thử lại.",
        }));
        alert("Đã có tên đăng nhập hoặc email này rồi.");
      } else {
        navigate("/verify-otp", { state: { userId: response.data.userId } });
      }
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        email: error.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const DesktopRegister = (
    <div
      className="hidden sm:flex items-center justify-center min-h-screen bg-primaryblue dark:bg-transparent"
      style={{ backgroundImage: `url(${bgRegister})` }}
    >
      <div className="bg-white dark:bg-primary p-10 rounded-2xl shadow-2xl shadow-primary dark:shadow-xl dark:shadow-slate-200 w-96 h-auto border border-gray-300 justify-end">
        <h2 className="text-primary text-3xl font-bold text-center mb-6 dark:text-neutral-50 uppercase">
          Đăng ký
        </h2>
        <RegisterForm
          username={username} setUsername={setUsername}
          email={email} setEmail={setEmail}
          password={password} setPassword={setPassword}
          confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword}
          showPassword={showPassword} setShowPassword={setShowPassword}
          showConfirmPassword={showConfirmPassword} setShowConfirmPassword={setShowConfirmPassword}
          agreeTerms={agreeTerms} setAgreeTerms={setAgreeTerms}
          errors={errors} isLoading={isLoading}
          handleSubmit={handleSubmit}
        />
      </div>
    </div>
  );

  const MobileRegister = (
    <div className="sm:hidden flex items-center justify-center min-h-screen bg-white dark:bg-primary p-6">
      <div className="w-full max-w-md">
        <h2 className="text-primary text-2xl font-bold text-center mb-4 dark:text-neutral-50 uppercase">
          Đăng ký
        </h2>
        <RegisterForm
          username={username} setUsername={setUsername}
          email={email} setEmail={setEmail}
          password={password} setPassword={setPassword}
          confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword}
          showPassword={showPassword} setShowPassword={setShowPassword}
          showConfirmPassword={showConfirmPassword} setShowConfirmPassword={setShowConfirmPassword}
          agreeTerms={agreeTerms} setAgreeTerms={setAgreeTerms}
          errors={errors} isLoading={isLoading}
          handleSubmit={handleSubmit}
        />
        <p className="text-sm mt-4 text-center dark:text-neutral-200">
          Bạn đã có tài khoản?{" "}
          <Link to="/login" className="text-primary font-semibold">
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );

  return isMobile ? MobileRegister : DesktopRegister;
};

export default Register;
