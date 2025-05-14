import React, { useState, useEffect } from 'react';
import { FaMoon, FaSun, FaUserCircle, FaBars } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
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
    const [username, setUsername] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [avatar, setAvatar] = useState('');
    const [isCompact, setIsCompact] = useState(window.innerWidth < 1270);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUsername(decoded.username || 'User');
                setIsLoggedIn(true);

                const fetchUserData = async () => {
                    try {
                        const response = await axios.get(`${import.meta.env.VITE_API_URL}/user/profile`, {
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        setFirstName(response.data.firstName || '');
                        setLastName(response.data.lastName || '');
                        if (response.data.avatar) {
                            if (response.data.avatar.startsWith('http')) {
                                setAvatar(response.data.avatar);
                            } else {
                                setAvatar(`${import.meta.env.VITE_API_URL}${response.data.avatar}`);
                            }
                        } else {
                            setAvatar('');
                        }
                    } catch (error) {
                        console.error("Lỗi lấy dữ liệu người dùng", error);
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
        setUsername('');
        setFirstName('');
        setLastName('');
        setAvatar('');
        navigate("/");
        window.location.reload();
    };

    const handleGoToProfile = () => {
        navigate(`/user/profile`);
    };

    useEffect(() => {
        if (isCompact) {
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

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isCompact]);

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [darkMode]);

    useEffect(() => {
        const handleResize = () => {
            setIsCompact(window.innerWidth < 1270);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <nav className={`w-screen fixed top-0 left-0 overflow-x-hidden transition-transform duration-300 ease-in-out z-50
            ${isVisible ? "translate-y-0" : "-translate-y-full"}
            ${scrollPosition > 50 ? "bg-neutral-100 shadow-md shadow-black dark:bg-primary dark:text-white" : "bg-transparent dark:bg-neutral-800 dark:text-white"}`}
            style={{ 
                height: 'calc(96px + env(safe-area-inset-top, 0px))',
                paddingLeft: 'env(safe-area-inset-left, 0px)',
                paddingRight: 'env(safe-area-inset-right, 0px)',
            }}
        >
            <div className="w-full h-full flex items-center justify-between mx-auto px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
                {/* Logo */}
                <Link to="/" className="flex items-center font-bold text-primary dark:text-primaryblue text-xl sm:text-2xl md:text-4xl">
                    <img
                        src={Logo}
                        alt="Logo"
                        className="h-7 w-7 md:h-12 md:w-12 mr-2 transition-all duration-200"
                    />
                    Ticket<span className="text-neutral-800 dark:text-neutral-300">Bus</span>
                </Link>

                {/* Center Navigation */}
                <div className="flex-1 flex justify-center">
                    {!isCompact && (
                        <ul className="list-none flex items-center justify-center flex-wrap gap-6 text-lg font-semibold text-neutral-900 dark:text-white">
                            <li><Link to="/" className="hover:text-primary transition">Trang Chủ</Link></li>
                            <li><Link to="/offer" className="hover:text-primary transition">Khuyến Mãi</Link></li>
                            <li><Link to="/bus-tickets" className="hover:text-primary transition">Tra cứu vé</Link></li>
                            <li><Link to="/blog" className="hover:text-primary transition">Tin tức</Link></li>
                            <li><Link to="/chatbot" className="hover:text-primary transition">Hướng Dẫn Đặt Vé</Link></li>
                        </ul>
                    )}
                </div>

                {/* Right Section */}
                <div className="flex items-center space-x-1 sm:space-x-2">
                    {isCompact && (
                        <Sheet>
                            <SheetTrigger asChild>
                                <button
                                    className="flex items-center justify-center p-2 rounded-lg transition hover:bg-gray-200 dark:hover:bg-gray-700 z-50"
                                    aria-label="Open menu"
                                >
                                    <FaBars className="h-5 w-5 text-neutral-900 dark:text-white" />
                                </button>
                            </SheetTrigger>
                            <SheetContent
                                side="right"
                                className="w-[80vw] max-w-[320px] bg-white dark:bg-gray-800 p-5 flex flex-col overflow-y-auto"
                                style={{
                                    paddingTop: 'calc(1rem + env(safe-area-inset-top, 0px))',
                                    paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))',
                                    paddingLeft: 'env(safe-area-inset-left, 0px)',
                                    paddingRight: 'env(safe-area-inset-right, 0px)',
                                }}
                            >
                                <SheetHeader>
                                    <SheetTitle>
                                        <Link to="/" className="flex items-center text-2xl font-bold justify-center text-primary dark:text-primaryblue">
                                            <img src={Logo} alt="Logo" className="h-8 w-8 mr-2" />
                                            Ticket<span className="text-neutral-800 dark:text-neutral-300">Bus</span>
                                        </Link>
                                    </SheetTitle>
                                </SheetHeader>
                                <div className="flex flex-col space-y-5 mt-6 text-base font-semibold text-center">
                                    <Link
                                        to="/"
                                        className="py-3 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition touch-manipulation"
                                    >
                                        Trang Chủ
                                    </Link>
                                    <Link
                                        to="/offer"
                                        className="py-3 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition touch-manipulation"
                                    >
                                        Khuyến Mãi
                                    </Link>
                                    <Link
                                        to="/bus-tickets"
                                        className="py-3 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition touch-manipulation"
                                    >
                                        Tra cứu vé
                                    </Link>
                                    <Link
                                        to="/blog"
                                        className="py-3 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition touch-manipulation"
                                    >
                                        Tin tức
                                    </Link>
                                    <Link
                                        to="/chatbot"
                                        className="py-3 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition touch-manipulation"
                                    >
                                        Hướng Dẫn Đặt Vé
                                    </Link>
                                </div>
                            </SheetContent>
                        </Sheet>
                    )}
                    {isLoggedIn ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger className="flex items-center space-x-1 cursor-pointer">
                                {avatar ? (
                                    <img
                                        src={avatar}
                                        alt="User Avatar"
                                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-primary object-cover"
                                        onError={(e) => (e.target.style.display = 'none')}
                                    />
                                ) : (
                                    <FaUserCircle className="w-8 h-8 sm:w-9 sm:h-9 text-gray-500 dark:text-white" />
                                )}
                                <span className="hidden sm:inline text-base text-black dark:text-white font-medium">
                                    {firstName} {lastName}
                                </span>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-slate-200 dark:bg-gray-800 text-black dark:text-white rounded-lg shadow-lg p-2 w-44">
                                <DropdownMenuItem disabled className="opacity-100 font-semibold cursor-default">
                                    {username}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={handleGoToProfile}
                                    className="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                >
                                    👤 Tài Khoản
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => navigate('/user/profile/history')}
                                    className="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                >
                                    🔄 Lịch sử mua vé
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={handleLogout}
                                    className="hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400 cursor-pointer"
                                >
                                    <MdOutlineLogout className="h-5 w-5 mr-1" /> Đăng xuất
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="text-sm text-neutral-950 dark:text-neutral-300 hover:text-primaryblue transition"
                            >
                                Đăng nhập
                            </Link>
                            <Link
                                to="/register"
                                className="px-2 py-1 border border-neutral-50 text-sm text-neutral-950 dark:text-neutral-300 rounded-full hover:bg-primary hover:text-white transition"
                            >
                                Đăng ký
                            </Link>
                        </>
                    )}
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                        aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                    >
                        {darkMode ? <FaSun className="text-yellow-400 h-4 w-4" /> : <FaMoon className="text-gray-700 dark:text-white h-4 w-4" />}
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;