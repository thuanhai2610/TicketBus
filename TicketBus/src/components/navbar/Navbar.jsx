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
    const [isCompact, setIsCompact] = useState(false);
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
                        setFirstName('');
                        setLastName('');
                        setAvatar('');
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
        // navigate("/");
        window.location.reload("/");
    };

    const handleGoToProfile = () => {
        navigate(`/user/profile`);
    };

    useEffect(() => {
        const handleScroll = () => {
            const currentScroll = window.scrollY;
            setIsVisible(currentScroll <= scrollPosition || currentScroll <= 50);
            setScrollPosition(currentScroll);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [scrollPosition]);

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
            setIsCompact(window.innerWidth < window.screen.width * 0.6);
        };
        handleResize(); // Initial check
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <nav className={`w-full h-[10ch] fixed top-0 left-0 lg:px-24 md:px-16 sm:px-7 px-4 backdrop:blur-lg transition-transform duration-300 z-50 
            ${isVisible ? "translate-y-0" : "-translate-y-full"} 
            ${scrollPosition > 50 ? "bg-neutral-100 shadow-sm shadow-black dark:bg-primary dark:text-white" : "bg-neutral-100/10 dark:bg-neutral-800 dark:text-white"}`}>
            <div className="w-full h-full flex items-center justify-between">
                {/* Logo Section */}
                <Link to="/" className='flex items-center text-4xl text-primary font-bold dark:text-primaryblue'>
                    <img src={Logo} alt="Logo" className="h-12 w-12 mr-2" />
                    Ticket<span className='text-neutral-800 dark:text-neutral-300'>Bus</span>
                </Link>

                {/* Navigation Links */}
                <div className="flex-1 flex justify-center">
                    {isCompact ? (
                        <Sheet>
                            <SheetTrigger asChild>
                                <button className="flex items-center text-center px-4 py-2 rounded-lg transition">
                                    <FaBars className="mr-2 h-6 w-6" />

                                </button>
                            </SheetTrigger>
                            <SheetContent side="right">
                                <SheetHeader>
                                    <SheetTitle> <Link to="/" className='flex items-center text-4xl text-primary dark:text-primaryblue font-bold justify-center'>
                                        <img src={Logo} alt="Logo" className="h-12 w-12 mr-2" />
                                        Ticket<span className='text-neutral-800 dark:text-neutral-300'>Bus</span>
                                    </Link></SheetTitle>
                                </SheetHeader>
                                <div className="flex flex-col space-y-4 mt-6 text-lg font-semibold text-center">
                                    <Link to="/">Trang Chủ</Link>
                                    <Link to="/offer">Chương trình khuyến mãi</Link>
                                    <Link to="/bus-tickets">Tra cứu vé</Link>
                                    <Link to="/blog">Tin tức</Link>
                                    <Link to="/chatbot">Hướng Dẫn Đặt Vé</Link>
                                </div>
                            </SheetContent>
                        </Sheet>
                    ) : (
                        <ul className="list-none flex items-center justify-center flex-wrap gap-8 text-lg text-neutral-900 dark:text-white font-semibold">
                            <li><Link to="/" className='hover:text-primary ease-in-out duration-300'>Trang Chủ</Link></li>
                            <li><Link to="/offer" className='hover:text-primary ease-in-out duration-300'>Chương trình khuyến mãi</Link></li>
                            <li><Link to="/bus-tickets" className='hover:text-primary ease-in-out duration-300'>Tra cứu vé</Link></li>
                            <li><Link to="/blog" className='hover:text-primary ease-in-out duration-300'>Tin tức</Link></li>
                            <li><Link to="/chatbot" className='hover:text-primary ease-in-out duration-300'>Hướng Dẫn Đặt Vé</Link></li>
                        </ul>
                    )}
                </div>

                {/* User Actions & Dark Mode Toggle */}
                <div className="flex items-center space-x-4">
                    {isLoggedIn ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger className="flex items-center space-x-3 cursor-pointer">
                                {avatar ? (
                                    <img
                                        src={avatar}
                                        alt="User Avatar"
                                        className="w-10 h-10 rounded-full border border-primary object-cover"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            const parent = e.target.parentNode;
                                            if (parent) {
                                                const icon = document.createElement('span');
                                                icon.innerHTML = '<svg class="w-10 h-10 text-gray-500 dark:text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path></svg>';
                                                parent.appendChild(icon);
                                            }
                                        }}
                                    />
                                ) : (
                                    <FaUserCircle className="w-10 h-10 text-gray-500 dark:text-white" />
                                )}
                                  <span className="text-black dark:text-white font-medium">
                                {firstName} {lastName}
                            </span>
                            </DropdownMenuTrigger>

                          

                            <DropdownMenuContent className="bg-slate-200 dark:bg-gray-800 text-black dark:text-white rounded-lg shadow-lg p-2 w-40 ">
                 
                                <DropdownMenuItem disabled className="opacity-100 font-semibold cursor-default">
                                    {username}
                                </DropdownMenuItem>

                
                                <DropdownMenuSeparator className="my-2 border-t border-gray-300 dark:border-gray-600" />

                                <DropdownMenuItem
                                    onClick={handleGoToProfile}
                                    className="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                >
                                    <span className="text-xs">👤</span> Tài Khoản
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => navigate('/user/profile/history')}
                                    className="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                >
                                    <span className="text-xs">🔄</span> Lịch sử mua vé
                                </DropdownMenuItem>
                                {/* <DropdownMenuItem
                                    onClick={() => navigate('/user/profile/support')}
                                    className="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                >
                                    <span className="text-xs">🔄</span> Hỗ trợ
                                </DropdownMenuItem>
                           */}
                                <DropdownMenuSeparator className="my-2 border-t border-gray-300 dark:border-gray-600" />

                          
                                <DropdownMenuItem
                                    onClick={handleLogout}
                                    className="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-red-600 dark:text-red-400"
                                >
                                     <MdOutlineLogout  className="h-6 w-6" />
                                    Đăng xuất
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>


                    ) : (
                        <>
                            <Link to="/login" className="text-neutral-950 text-base font-normal hover:text-primaryblue transition duration-300 dark:text-neutral-300">
                                Đăng nhập
                            </Link>
                            <Link to="/register" className="px-4 py-1 border border-neutral-50 text-neutral-950 text-base font-normal rounded-full hover:bg-primary hover:text-neutral-50 transition duration-300 dark:text-neutral-300">
                                Đăng ký
                            </Link>
                        </>
                    )}

                    {/* Dark Mode Toggle Button */}
                    <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition">
                        {darkMode ? <FaSun className="text-yellow-400" /> : <FaMoon className="text-gray-700 dark:text-white" />}
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
