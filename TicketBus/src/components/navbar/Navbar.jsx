/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { FaMoon, FaSun, FaUserCircle, FaBars } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import Logo from "../../assets/logo.png";
import { MdOutlineLogout } from "react-icons/md";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const Navbar = () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [isCompact, setIsCompact] = useState(window.innerWidth < 1270);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const [notificationModal, setNotificationModal] = useState({
    show: false,
    message: "",
    type: "error",
  });
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const navigate = useNavigate();

  // Handle resize for compact/mobile toggle
  useEffect(() => {
    const handleResize = () => {
      setIsCompact(window.innerWidth < 1270);
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch user data and handle token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUsername(decoded.username || "User");
        setIsLoggedIn(true);

        const fetchUserData = async () => {
          try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/user/profile`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setFirstName(response.data.firstName || "");
            setLastName(response.data.lastName || "");
            if (response.data.avatar) {
              if (response.data.avatar.startsWith("http")) {
                setAvatar(response.data.avatar);
              } else {
                setAvatar(`${import.meta.env.VITE_API_URL}${response.data.avatar}`);
              }
            } else {
              setAvatar("");
            }
          } catch (error) {
            setNotificationModal({
              show: true,
              message: "Không tải được thông tin người dùng! Vui lòng thử lại.",
              type: "error",
            });
          }
        };
        fetchUserData();
      } catch (error) {
        console.error("Token không hợp lệ", error);
        localStorage.removeItem("token");
        setIsLoggedIn(false);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUsername("");
    setFirstName("");
    setLastName("");
    setAvatar("");
    navigate("/");
    window.location.reload();
  };

  const handleGoToProfile = () => {
    navigate("/user/profile");
  };

  // Handle scroll-based visibility
  useEffect(() => {
    if (isCompact || isSheetOpen) {
      setIsVisible(true);
      return;
    }

    let lastScroll = window.scrollY;
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      const scrollingUp = currentScroll < lastScroll;
      setIsVisible(scrollingUp || currentScroll <= 50);
      setScrollPosition(currentScroll);
      lastScroll = currentScroll;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isCompact, isSheetOpen]);

  // Handle dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // Modal for error notifications
  const NotificationModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={`bg-white dark:bg-primary rounded-lg shadow-xl p-4 sm:p-6 w-11/12 max-w-sm ${
          isMobile ? "mx-4" : ""
        }`}
      >
        <h3 className="text-lg font-semibold mb-4 text-red-500 dark:text-red-400">Lỗi</h3>
        <p className="text-sm text-gray-600 dark:text-neutral-300 mb-6">
          {notificationModal.message}
        </p>
        <div className="flex justify-end">
          <button
            onClick={() => setNotificationModal({ show: false, message: "", type: "error" })}
            className="px-4 py-1.5 bg-primary hover:bg-primaryblue text-white rounded-lg text-sm"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );

  // Shared Sheet component for both layouts
  const NavSheet = () => (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <button
          className="flex items-center justify-center p-2 rounded-lg transition hover:bg-gray-200 dark:hover:bg-gray-700"
          aria-label="Open menu"
        >
          <FaBars className="h-5 w-5 text-neutral-900 dark:text-neutral-50" />
        </button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[80vw] max-w-[300px] bg-white dark:bg-primary p-4 flex flex-col overflow-y-auto"
        style={{
          paddingTop: "calc(1rem + env(safe-area-inset-top, 0px))",
          paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))",
          paddingLeft: "env(safe-area-inset-left, 0px)",
          paddingRight: "env(safe-area-inset-right, 0px)",
        }}
      >
        <SheetHeader>
          <SheetTitle>
            <Link
              to="/"
              onClick={() => setIsSheetOpen(false)}
              className="flex items-center text-2xl font-bold justify-center text-primary dark:text-primaryblue"
            >
              <img src={Logo} alt="Logo" className="h-8 w-8 mr-2" />
              Ticket<span className="text-neutral-800 dark:text-neutral-50">Bus</span>
            </Link>
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col space-y-4 mt-6 text-sm font-semibold text-center text-neutral-900 dark:text-neutral-50">
          <Link
            to="/"
            onClick={() => setIsSheetOpen(false)}
            className="py-2 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            Trang Chủ
          </Link>
          <Link
            to="/offer"
            onClick={() => setIsSheetOpen(false)}
            className="py-2 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            Khuyến Mãi
          </Link>
          <Link
            to="/bus-tickets"
            onClick={() => setIsSheetOpen(false)}
            className="py-2 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            Tra cứu vé
          </Link>
          <Link
            to="/blog"
            onClick={() => setIsSheetOpen(false)}
            className="py-2 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            Tin tức
          </Link>
          <Link
            to="/chatbot"
            onClick={() => setIsSheetOpen(false)}
            className="py-2 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            Hướng Dẫn Đặt Vé
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );

  // Desktop layout
  const DesktopNavbar = (
    <nav
      className={`w-screen fixed top-0 left-0 overflow-x-hidden transition-transform duration-300 ease-in-out z-50
        ${isVisible ? "translate-y-0" : "-translate-y-full"}
        ${scrollPosition > 50 ? "bg-gray-50 shadow-md dark:bg-gray-900" : "bg-transparent dark:bg-gray-900"}`}
      style={{
        height: "calc(96px + env(safe-area-inset-top, 0px))",
        paddingLeft: "env(safe-area-inset-left, 0px)",
        paddingRight: "env(safe-area-inset-right, 0px)",
      }}
    >
      <div
        className="w-full h-full flex items-center justify-between max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center font-bold text-primary dark:text-primaryblue text-3xl"
        >
          <img
            src={Logo}
            alt="Logo"
            className="h-10 w-10 mr-2 transition-all duration-200"
          />
          Ticket<span className="text-neutral-800 dark:text-neutral-50">Bus</span>
        </Link>

        {/* Center Navigation */}
        <div className="flex-1 flex justify-center">
          {!isCompact && (
            <ul className="list-none flex items-center justify-center flex-wrap gap-6 text-base font-semibold text-neutral-900 dark:text-neutral-50">
              <li>
                <Link to="/" className="hover:text-primaryblue dark:hover:text-primaryblue transition">
                  Trang Chủ
                </Link>
              </li>
              <li>
                <Link to="/offer" className="hover:text-primaryblue dark:hover:text-primaryblue transition">
                  Khuyến Mãi
                </Link>
              </li>
              <li>
                <Link to="/bus-tickets" className="hover:text-primaryblue dark:hover:text-primaryblue transition">
                  Tra cứu vé
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-primaryblue dark:hover:text-primaryblue transition">
                  Tin tức
                </Link>
              </li>
              <li>
                <Link to="/chatbot" className="hover:text-primaryblue dark:hover:text-primaryblue transition">
                  Hướng Dẫn Đặt Vé
                </Link>
              </li>
            </ul>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {isCompact && <NavSheet />}
          {/* Auth Section */}
          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 cursor-pointer">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt="User Avatar"
                      className={`rounded-full border border-primary object-cover ${
                        isMobile ? "w-8 h-8" : "w-9 h-9"
                      }`}
                      onError={(e) => (e.target.style.display = "none")}
                    />
                  ) : (
                    <FaUserCircle
                      className={`text-gray-500 dark:text-neutral-50 ${isMobile ? "w-8 h-8" : "w-9 h-9"}`}
                    />
                  )}
                  {!isMobile && (
                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
                      {firstName} {lastName}
                    </span>
                  )}
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white dark:bg-gray-900 text-neutral-900 dark:text-neutral-50 rounded-lg shadow-lg p-2 w-48">
                  <DropdownMenuItem
                    disabled
                    className="opacity-100 font-semibold cursor-default truncate text-sm"
                  >
                    {username}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                  <DropdownMenuItem
                    onClick={handleGoToProfile}
                    className="text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    👤 Tài Khoản
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate("/user/profile/history")}
                    className="text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    🔄 Lịch sử mua vé
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 dark:text-red-400 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <MdOutlineLogout className="h-5 w-5 mr-1" /> Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className={`flex items-center ${isMobile ? "gap-1 text-xs" : "gap-3 text-sm"}`}>
                <Link
                  to="/login"
                  className="text-neutral-900 dark:text-neutral-50 hover:text-primaryblue dark:hover:text-primaryblue transition"
                >
                  Đăng nhập
                </Link>
                {isMobile && (
                  <span className="text-neutral-500 dark:text-neutral-400 select-none">/</span>
                )}
                <Link
                  to="/register"
                  className={`text-neutral-900 dark:text-neutral-50 hover:text-primaryblue dark:hover:text-primaryblue transition ${
                    isMobile ? "" : "px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-lg"
                  }`}
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? (
              <FaSun className="text-yellow-400 h-4 w-4" />
            ) : (
              <FaMoon className="text-gray-700 dark:text-neutral-50 h-4 w-4" />
            )}
          </button>
        </div>
      </div>
      {notificationModal.show && <NotificationModal />}
    </nav>
  );

  // Mobile layout
  const MobileNavbar = (
    <nav
      className={`w-screen fixed top-0 left-0 overflow-x-hidden transition-transform duration-300 ease-in-out z-50
        ${isVisible ? "translate-y-0" : "-translate-y-full"}
        ${scrollPosition > 50 ? "bg-white shadow-md dark:bg-primary" : "bg-white dark:bg-primary"}`}
      style={{
        height: "calc(80px + env(safe-area-inset-top, 0px))",
        paddingLeft: "env(safe-area-inset-left, 0px)",
        paddingRight: "env(safe-area-inset-right, 0px)",
      }}
    >
      <div
        className="w-full h-full flex items-center justify-between max-w-md mx-auto px-4"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center font-bold text-primary dark:text-primaryblue text-2xl"
        >
          <img
            src={Logo}
            alt="Logo"
            className="h-8 w-8 mr-2 transition-all duration-200"
          />
          Ticket<span className="text-neutral-800 dark:text-neutral-50">Bus</span>
        </Link>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {isCompact && <NavSheet />}
          {/* Auth Section */}
          <div className="flex items-center gap-1">
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="cursor-pointer">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt="User Avatar"
                      className="w-8 h-8 rounded-full border border-primary object-cover"
                      onError={(e) => (e.target.style.display = "none")}
                    />
                  ) : (
                    <FaUserCircle className="w-8 h-8 text-gray-500 dark:text-neutral-50" />
                  )}
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white dark:bg-gray-900 text-neutral-900 dark:text-neutral-50 rounded-lg shadow-lg p-2 w-48">
                  <DropdownMenuItem
                    disabled
                    className="opacity-100 font-semibold cursor-default truncate text-sm"
                  >
                    {username}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                  <DropdownMenuItem
                    onClick={handleGoToProfile}
                    className="text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    👤 Tài Khoản
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate("/user/profile/history")}
                    className="text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    🔄 Lịch sử mua vé
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 dark:text-red-400 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <MdOutlineLogout className="h-5 w-5 mr-1" /> Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-1 text-xs">
                <Link
                  to="/login"
                  className="text-neutral-900 dark:text-neutral-50 hover:text-primaryblue dark:hover:text-primaryblue transition"
                >
                  Đăng nhập
                </Link>
                <span className="text-neutral-500 dark:text-neutral-400 select-none">/</span>
                <Link
                  to="/register"
                  className="text-neutral-900 dark:text-neutral-50 hover:text-primaryblue dark:hover:text-primaryblue transition"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? (
              <FaSun className="text-yellow-400 h-4 w-4" />
            ) : (
              <FaMoon className="text-gray-700 dark:text-neutral-50 h-4 w-4" />
            )}
          </button>
        </div>
      </div>
      {notificationModal.show && <NotificationModal />}
    </nav>
  );

  return isMobile ? MobileNavbar : DesktopNavbar;
};

export default Navbar;