/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link, Outlet } from "react-router-dom";
import axios from "axios";
import { FaUserCircle } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import Logo from "../../assets/logo.png";

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [avatarError, setAvatarError] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();

    const isMainProfilePage = location.pathname === "/user/profile";

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return navigate("/login");

        try {
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;

            if (decoded.exp < currentTime) {
                handleLogout();
                return;
            }
            const fetchProfile = async () => {
                try {
                    const response = await axios.get(`${import.meta.env.VITE_API_URL}/user/profile`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    localStorage.setItem("userId", response.data.userId);
                    localStorage.setItem("avatar", response.data.avatar);
                    const avatar = response.data.avatar
                        ? response.data.avatar.startsWith("http")
                            ? response.data.avatar
                            : `${import.meta.env.VITE_API_URL}${response.data.avatar}`
                        : null;

                    const dobDate = response.data.dob ? new Date(response.data.dob) : null;
                    const formattedDob = dobDate && !isNaN(dobDate.getTime())
                        ? `${dobDate.getDate().toString().padStart(2, "0")}/${(dobDate.getMonth() + 1).toString().padStart(2, "0")}/${dobDate.getFullYear()}`
                        : "Chưa cập nhật";

                    setProfile({
                        ...response.data,
                        avatar,
                        dob: formattedDob,
                    });
                    setLoading(false);
                } catch (err) {
                    if (err.response?.status === 401) handleLogout();
                    else setError("Không tìm thấy người dùng hoặc lỗi server!");
                    setLoading(false);
                }
            };

            fetchProfile();
            if (location.state?.updated) {
                window.history.replaceState({}, document.title);
            }
        } catch {
            handleLogout();
        }
    }, [location]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
        window.location.reload();
    };

    const handleAvatarError = () => setAvatarError(true);

    if (loading) {
        return <div className="text-center mt-20 text-primary text-lg dark:text-white">Đang tải...</div>;
    }

    if (error || !profile) {
        return <div className="text-center mt-20 text-red-600 text-lg dark:text-red-400">{error || "Không tìm thấy thông tin người dùng"}</div>;
    }

    return (
        <div className="flex items-center justify-center min-h-screen px-4 bg-gray-50 dark:bg-gray-900">
            <div className="w-[1200px] h-[600px] bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 flex overflow-hidden">

                {/* Sidebar */}
                <div className="w-1/4 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-4 flex flex-col justify-between">
                    <div>
                        <div className="mb-8 flex justify-center">
                            <Link to="/" className='flex items-center text-4xl text-primary font-bold dark:text-primaryblue'>
                                <img src={Logo} alt="Logo" className="h-12 w-12 mr-2" />
                                Ticket<span className='text-neutral-950 dark:text-neutral-300'>Bus</span>
                            </Link>
                        </div>
                        <div className="w-full flex flex-col gap-3">
                            <Link to="/user/profile" className={`flex items-center gap-2 px-4 py-2 rounded ${isMainProfilePage ? 'bg-orange-100 text-orange-600 font-semibold' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200'}`}>
                                <span className="text-xl">👤</span> Thông tin tài khoản
                            </Link>
                            <Link to="/user/profile/history" className={`flex items-center gap-2 px-4 py-2 rounded ${location.pathname.includes("history") ? 'bg-blue-100 text-blue-600 font-semibold' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200'}`}>
                                <span className="text-xl">🔄</span> Lịch sử mua vé
                            </Link>
                            <Link to="/user/profile/support" className={`flex items-center gap-2 px-4 py-2 rounded ${location.pathname.includes("support") ? 'bg-blue-100 text-blue-600 font-semibold' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200'}`}>
                                <span className="text-xl">🔄</span> Hỗ trợ
                            </Link>
                        </div>
                    </div>
                    {/* Logout button at bottom */}
                    <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-red-400 rounded">
                        <span className="text-xl">🚪</span> Đăng xuất
                    </button>
                </div>

                {/* Main Content */}
                {/* Main Content */}
                <div className="w-3/4 p-6 overflow-y-auto flex flex-col h-full">
                    {isMainProfilePage ? (
                        <>
                            {/* Heading OUTSIDE content block */}
                            <h2 className="text-2xl font-bold text-primary dark:text-white mb-1">Thông tin tài khoản</h2>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">Quản lý thông tin hồ sơ để bảo mật tài khoản</p>

                            {/* Centered content */}
                            <div className="flex justify-center items-center flex-1">
                                <div className="flex gap-8 items-start">
                                    {/* Avatar Block */}
                                    <div className="flex flex-col items-center w-56">
                                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary">
                                            {profile.avatar && !avatarError ? (
                                                <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" onError={handleAvatarError} />
                                            ) : (
                                                <FaUserCircle className="w-full h-full text-gray-400 dark:text-gray-500" />
                                            )}
                                        </div>
                                        <button className="mt-4 px-4 py-2 border rounded-full text-sm text-gray-700 dark:text-gray-200">Chọn ảnh</button>
                                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">Dung lượng file tối đa 1 MB<br />Định dạng: .JPEG, .PNG</p>
                                    </div>

                                    {/* Info Block */}
                                    <div className="flex flex-col justify-center gap-4 text-sm space-y-4">
                                        <InfoRow label="Họ và tên" value={`${profile.firstName || ""} ${profile.lastName || ""}`} />
                                        <InfoRow label="Số điện thoại" value={profile.phone} />
                                        <InfoRow label="Giới tính" value={profile.gender || "Chưa cập nhật"} />
                                        <InfoRow label="Email" value={profile.email} />
                                        <InfoRow label="Ngày sinh" value={profile.dob} />

                                        <div className="pt-2">
                                            <button onClick={() => navigate("edit")} className="bg-primary hover:bg-primaryblue hover:text-neutral-950 text-white px-6 py-2 rounded-full transition">
                                                Chỉnh sửa thông tin
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <Outlet />
                    )}
                </div>

            </div>
        </div>
    );

};

const InfoRow = ({ label, value }) => (
    <div className="flex items-start">
        <div className="w-32 font-medium text-gray-600 dark:text-gray-300">{label}</div>
        <div className="mx-1">:</div>
        <div className="flex-1 text-gray-800 dark:text-white">{value || "Chưa cập nhật"}</div>
    </div>
);



export default Profile;
