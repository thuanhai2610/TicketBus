/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link, Outlet } from "react-router-dom";
import axios from "axios";
import { FaUserCircle } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import Logo from "../../assets/logo.png";

// Separate component for profile info
function ProfileInfo({ profile, avatarError, handleAvatarError, isMobile }) {
  return (
    <>
      <h2 className="text-xl sm:text-2xl font-bold text-primary dark:text-neutral-50 mb-1 sm:mb-1">
        Thông Tin Cá Nhân
      </h2>
      <p className="text-sm text-gray-600 dark:text-neutral-300 mb-4 sm:mb-6">
        Quản lý thông tin hồ sơ để bảo mật tài khoản
      </p>
      <div
        className={`flex ${isMobile ? "flex-col items-center" : "justify-center items-center flex-1"
          } gap-4 sm:gap-8`}
      >
        {/* Avatar Block */}
        <div className={`flex flex-col items-center ${isMobile ? "w-full" : "w-56"}`}>
          <div
            className={`${isMobile ? "w-24 h-24" : "w-32 h-32"
              } rounded-full overflow-hidden border-4 border-primary`}
          >
            {profile.avatar && !avatarError ? (
              <img
                src={profile.avatar}
                alt="Avatar"
                className="w-full h-full object-cover"
                onError={handleAvatarError}
              />
            ) : (
              <FaUserCircle className="w-full h-full text-gray-400 dark:text-gray-500" />
            )}
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-neutral-400 text-center">
            Dung lượng file tối đa 1 MB
            <br />
            Định dạng: .JPEG, .PNG
          </p>
        </div>
        {/* Info Block */}
        <div className={`flex flex-col gap-3 text-sm ${isMobile ? "w-full" : "space-y-4"}`}>
          <InfoRow label="Họ và tên" value={`${profile.firstName || ""} ${profile.lastName || ""}`} />
          <InfoRow label="Số điện thoại" value={profile.phone} />
          <InfoRow label="Giới tính" value={profile.gender || "Chưa cập nhật"} />
          <InfoRow label="Email" value={profile.email} />
          <InfoRow label="Ngày sinh" value={profile.dob} />
          <div className="pt-2">
            <Link
              to="edit"
              className="bg-primary hover:bg-primaryblue hover:text-neutral-950 text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-full transition text-sm sm:text-base"
            >
              Chỉnh Sửa Thông Tin
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

// Separate component for sidebar/navigation
function ProfileNav({ isMainProfilePage, location, handleLogout, isMobile }) {
  return (
    <div
      className={`${isMobile
          ? "w-full border-b sticky top-0 z-10"
          : "w-1/4 border-r"
        } bg-white dark:bg-primary border-gray-200 dark:border-gray-700 p-2 sm:p-4 flex ${isMobile ? "flex-row gap-2 items-center" : "flex-col justify-between"
        }`}
    >
      {isMobile ? (
        // Mobile: Horizontal button row
        <div className="flex w-full justify-around items-center mt-24">
          <Link
            to="/user/profile"
            className={`flex items-center px-1 py-1 rounded-lg text-sm ${isMainProfilePage
                ? "bg-orange-100 text-orange-600 font-semibold"
                : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-neutral-200"
              }`}
            title="Thông Tin Tài Khoản"
          >
            <span className="text-xs">👤Thông tin cá nhân </span>
          </Link>
          <Link
            to="/user/profile/history"
            className={`flex items-center px-1 py-1 rounded-lg text-sm ${location.pathname.includes("history")
                ? "bg-blue-100 text-blue-600 font-semibold"
                : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-neutral-200"
              }`}
            title="Lịch Sử Mua Vé"
          >
            <span className="text-xs">🔄Lịch Sử Mua Vé</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center px-1 py-1 rounded-lg text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-red-400"
            title="Đăng Xuất"
          >
            <span className="text-xs">🚪Đăng Xuất</span>
          </button>
        </div>
      ) : (
        // Desktop: Original sidebar layout
        <>
          <div>
            <div className="mb-8 flex justify-center">
              <Link
                to="/"
                className="flex items-center text-4xl text-primary font-bold dark:text-primaryblue"
              >
                <img src={Logo} alt="Logo" className="h-12 w-12 mr-2" />
                Ticket<span className="text-neutral-950 dark:text-neutral-300">Bus</span>
              </Link>
            </div>
            <div className="w-full flex flex-col gap-3 text-sm">
              <Link
                to="/user/profile"
                className={`flex items-center gap-2 px-4 py-2 rounded ${isMainProfilePage
                    ? "bg-orange-100 text-orange-600 font-semibold"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-neutral-200"
                  }`}
              >
                <span className="text-xl">👤</span> Thông Tin Cá Nhân
              </Link>
              <Link
                to="/user/profile/history"
                className={`flex items-center gap-2 px-4 py-2 rounded ${location.pathname.includes("history")
                    ? "bg-blue-100 text-blue-600 font-semibold"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-neutral-200"
                  }`}
              >
                <span className="text-xl">🔄</span> Lịch Sử Mua Vé
              </Link>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-red-400 rounded text-sm"
          >
            <span className="text-xl">🚪</span> Đăng Xuất
          </button>
        </>
      )}
    </div>
  );
}
const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [avatarError, setAvatarError] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  const location = useLocation();
  const navigate = useNavigate();

  const isMainProfilePage = location.pathname === "/user/profile";

  // Handle resize for mobile/desktop toggle
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
          localStorage.setItem("username", response.data.username);
          const avatar = response.data.avatar
            ? response.data.avatar.startsWith("http")
              ? response.data.avatar
              : `${import.meta.env.VITE_API_URL}${response.data.avatar}`
            : null;

          const dobDate = response.data.dob ? new Date(response.data.dob) : null;
          const formattedDob = dobDate && !isNaN(dobDate.getTime())
            ? `${dobDate.getDate().toString().padStart(2, "0")}/${(dobDate.getMonth() + 1)
              .toString()
              .padStart(2, "0")}/${dobDate.getFullYear()}`
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

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAvatarFile(file);
    }
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return;

    const formData = new FormData();
    formData.append("avatar", avatarFile);

    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/user/update-avatar`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (data.success) {
        setProfile((prev) => ({
          ...prev,
          avatar: data.avatar,
        }));
      } else {
        setError("Upload thất bại");
      }
    } catch (err) {
      setError("Lỗi khi tải ảnh lên.");
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-20 text-primary text-lg dark:text-neutral-50">
        Đang tải...
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="text-center mt-20 text-red-500 text-lg dark:text-red-400">
        {error || "Không tìm thấy thông tin người dùng"}
      </div>
    );
  }

  // Desktop layout (unchanged from original)
  const DesktopProfile = (
    <div className="flex items-center justify-center min-h-screen px-4 bg-gray-50 dark:bg-gray-900">
      <div className="w-[1200px] h-[600px] bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 flex overflow-hidden">
        <ProfileNav
          isMainProfilePage={isMainProfilePage}
          location={location}
          handleLogout={handleLogout}
          isMobile={false}
        />
        <div className="w-3/4 p-6 overflow-y-auto flex flex-col h-full">
          {isMainProfilePage ? (
            <ProfileInfo
              profile={profile}
              avatarError={avatarError}
              handleAvatarError={handleAvatarError}
              isMobile={false}
            />
          ) : (
            <Outlet />
          )}
        </div>
      </div>
    </div>
  );

  // Mobile layout
  const MobileProfile = (
    <div className="sm:hidden flex flex-col min-h-screen bg-white dark:bg-primary p-4">
      <ProfileNav
        isMainProfilePage={isMainProfilePage}
        location={location}
        handleLogout={handleLogout}
        isMobile={true}
      />
      <div className="flex-1 p-4 overflow-y-auto">
        {isMainProfilePage ? (
          <ProfileInfo
            profile={profile}
            avatarError={avatarError}
            handleAvatarError={handleAvatarError}
            isMobile={true}
          />
        ) : (
          <Outlet />
        )}
      </div>
    </div>
  );

  return isMobile ? MobileProfile : DesktopProfile;
};

const InfoRow = ({ label, value }) => (
  <div className="flex items-start">
    <div className="w-24 sm:w-32 font-medium text-gray-600 dark:text-neutral-300 text-sm sm:text-base">
      {label}
    </div>
    <div className="mx-1">:</div>
    <div className="flex-1 text-gray-800 dark:text-neutral-50 text-sm sm:text-base">
      {value || "Chưa cập nhật"}
    </div>
  </div>
);

export default Profile;