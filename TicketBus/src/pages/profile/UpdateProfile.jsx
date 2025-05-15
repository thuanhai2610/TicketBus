/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaUserCircle } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";

const UpdateProfile = () => {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notificationModal, setNotificationModal] = useState({
    show: false,
    message: "",
    type: "success", // "success" or "error"
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const location = useLocation();
  const navigate = useNavigate();

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
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp < currentTime) {
          console.error("Token has expired");
          handleLogout();
          return;
        }

        const fetchProfile = async () => {
          try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/user/profile`, {
              headers: { Authorization: `Bearer ${token}` },
            });

            const dobDate = response.data.dob ? new Date(response.data.dob) : null;
            const formattedDob = dobDate && !isNaN(dobDate.getTime())
              ? dobDate.toISOString().split("T")[0]
              : "";

            const profileData = {
              ...response.data,
              dob: formattedDob,
            };
            setProfile(profileData);
            setFormData(profileData);
            setLoading(false);
          } catch (error) {
            console.error("Error fetching profile:", error);
            if (error.response?.status === 401) {
              handleLogout();
            } else {
              setNotificationModal({
                show: true,
                message: "Không tìm thấy người dùng hoặc lỗi server!",
                type: "error",
              });
              setLoading(false);
            }
          }
        };
        fetchProfile();
      } catch (error) {
        console.error("Invalid token:", error);
        handleLogout();
      }
    } else {
      navigate("/login");
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
    window.location.reload();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      if (!file.type.startsWith("image/")) {
        setNotificationModal({
          show: true,
          message: "Vui lòng chọn một file ảnh hợp lệ!",
          type: "error",
        });
        return;
      }

      setSelectedFile(file);

      const reader = new FileReader();
      reader.onload = () => {
        setProfile((prev) => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCancel = () => {
    navigate("/user/profile");
  };

  const uploadAvatar = async () => {
    if (!selectedFile) return null;

    const formData = new FormData();
    formData.append("avatar", selectedFile);

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
        const fullAvatarUrl = data.avatar.startsWith("http")
          ? data.avatar
          : `${import.meta.env.VITE_API_URL}${data.avatar}`;

        setProfile((prev) => ({
          ...prev,
          avatar: fullAvatarUrl,
        }));

        localStorage.setItem("avatar", fullAvatarUrl);
        return fullAvatarUrl;
      } else {
        setNotificationModal({
          show: true,
          message: "Upload ảnh đại diện thất bại.",
          type: "error",
        });
        return null;
      }
    } catch (err) {
      setNotificationModal({
        show: true,
        message: "Lỗi khi tải ảnh lên.",
        type: "error",
      });
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.email) {
      setNotificationModal({
        show: true,
        message: "Vui lòng điền đầy đủ thông tin bắt buộc!",
        type: "error",
      });
      return;
    }

    setLoading(true);

    let avatarUrl = null;
    if (selectedFile) {
      avatarUrl = await uploadAvatar();
      if (!avatarUrl) {
        setLoading(false);
        return;
      }
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found. Please log in.");

      const formDataToSend = new FormData();
      formDataToSend.append("firstName", formData.firstName || "");
      formDataToSend.append("lastName", formData.lastName || "");
      formDataToSend.append("email", formData.email || "");
      formDataToSend.append("phone", formData.phone || "");
      if (formData.dob?.trim()) {
        formDataToSend.append("dob", formData.dob);
      }
      formDataToSend.append("gender", formData.gender || "");
      formDataToSend.append("username", formData.username);

      await axios.post(
        `${import.meta.env.VITE_API_URL}/user/update-profile`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!avatarUrl && profile.avatar) {
        localStorage.setItem("avatar", profile.avatar);
      }

      setNotificationModal({
        show: true,
        message: "Cập nhật thông tin thành công!",
        type: "success",
      });

      setTimeout(() => {
        navigate("/user/profile");
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Error updating profile:", error);
      if (error.response?.status === 401) {
        handleLogout();
      } else {
        setNotificationModal({
          show: true,
          message: error.response?.data?.message || "Lỗi khi cập nhật thông tin! Vui lòng thử lại.",
          type: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (avatarPath) => {
    if (!avatarPath) return null;
    return avatarPath.startsWith("data:image/") || avatarPath.startsWith("http")
      ? avatarPath
      : `${import.meta.env.VITE_API_URL}${avatarPath}`;
  };

  const closeNotificationModal = () => {
    setNotificationModal({ show: false, message: "", type: "success" });
  };

  // Modal for success/error notifications
  const NotificationModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={`bg-white dark:bg-primary rounded-lg shadow-xl p-4 sm:p-6 w-11/12 max-w-sm ${
          isMobile ? "mx-4" : ""
        }`}
      >
        <h3
          className={`text-lg font-semibold mb-4 ${
            notificationModal.type === "success"
              ? "text-green-600 dark:text-green-400"
              : "text-red-500 dark:text-red-400"
          }`}
        >
          {notificationModal.type === "success" ? "Thành Công" : "Lỗi"}
        </h3>
        <p className="text-sm text-gray-600 dark:text-neutral-300 mb-6">
          {notificationModal.message}
        </p>
        <div className="flex justify-end">
          <button
            onClick={closeNotificationModal}
            className="px-4 py-1.5 bg-primary hover:bg-primaryblue text-white rounded-lg text-sm"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );

  if (loading && !profile) {
    return (
      <div className="text-center text-primary dark:text-neutral-50">
        Đang tải...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center text-red-500 dark:text-red-400">
        {notificationModal.message}
      </div>
    );
  }

  // Desktop layout (unchanged from original)
  const DesktopUpdateProfile = (
    <div className="p-2">
      <h2 className="text-xl font-semibold mb-2">Thông tin tài khoản</h2>
      <p className="text-sm text-gray-500 mb-4 dark:text-neutral-300">
        Quản lý thông tin hồ sơ để bảo mật tài khoản
      </p>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4 dark:bg-transparent">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Avatar section */}
          <div className="flex flex-col items-center w-60">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-300">
              {profile.avatar ? (
                <img
                  src={getImageUrl(profile.avatar)}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <FaUserCircle className="w-full h-full text-gray-300" />
              )}
            </div>
            <label className="mt-3 cursor-pointer bg-gray-100 px-4 py-1 rounded-full hover:bg-gray-200 dark:bg-transparent dark:hover:bg-primaryblue border dark:border-neutral-500 dark:hover:text-neutral-950">
              Chọn ảnh
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
            <p className="text-xs text-gray-400 mt-1 text-center">
              Dung lượng file tối đa 1 MB
              <br />
              Định dạng: .JPEG, .PNG
            </p>
          </div>

          {/* Form fields */}
          <div className="w-96 space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700 mb-1 dark:text-neutral-50"
                >
                  Họ
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName || ""}
                  onChange={handleInputChange}
                  className="border rounded px-3 py-2 w-full dark:text-neutral-50 dark:bg-transparent dark:border-neutral-800"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Tên
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName || ""}
                  onChange={handleInputChange}
                  className="border rounded px-3 py-2 w-full dark:text-neutral-50 dark:bg-transparent dark:border-neutral-800"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Số điện thoại
              </label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={formData.phone || ""}
                onChange={handleInputChange}
                className="border rounded px-3 py-2 w-full dark:text-neutral-50 dark:bg-transparent dark:border-neutral-800"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email || ""}
                onChange={handleInputChange}
                className="border rounded px-3 py-2 w-full dark:text-neutral-50 dark:bg-transparent dark:border-neutral-800"
                required
              />
            </div>

            <div>
              <label
                htmlFor="dob"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Ngày sinh
              </label>
              <input
                type="date"
                id="dob"
                name="dob"
                value={formData.dob || ""}
                onChange={handleInputChange}
                className="border rounded px-3 py-2 w-full dark:text-neutral-50 dark:bg-transparent dark:border-neutral-800"
              />
            </div>

            <div>
              <label
                htmlFor="gender"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Giới tính
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender || ""}
                onChange={handleInputChange}
                className="border rounded px-3 py-2 w-full dark:text-neutral-50 dark:bg-transparent dark:border-neutral-800"
              >
                <option value="Nam" className="dark:bg-primary">
                  Nam
                </option>
                <option value="Nữ" className="dark:bg-primary">
                  Nữ
                </option>
                <option value="Khác" className="dark:bg-primary">
                  Khác
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit button */}
        <div className="flex justify-end space-x-4">
          <button
            type="submit"
            className="bg-primary text-white px-6 py-2 rounded-full hover:bg-primaryblue dark:hover:text-neutral-950 hover:text-neutral-950"
            disabled={loading}
          >
            {loading ? "Đang cập nhật..." : "Cập nhật"}
          </button>

          <button
            type="button"
            onClick={handleCancel}
            className="bg-red-500 text-white px-6 py-2 rounded-full hover:bg-red-600 dark:hover:text-neutral-950 hover:text-neutral-950"
          >
            Hủy
          </button>
        </div>
      </form>
      {notificationModal.show && <NotificationModal />}
    </div>
  );

  // Mobile layout
  const MobileUpdateProfile = (
    <div className="sm:hidden flex flex-col min-h-screen bg-white dark:bg-primary p-4">
      <h2 className="text-xl font-bold text-gray-800 dark:text-neutral-50 mb-2">
        Chỉnh Sửa Thông Tin
      </h2>
      <p className="text-sm text-gray-500 dark:text-neutral-300 mb-4">
        Quản lý thông tin hồ sơ
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Avatar section */}
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-300 dark:border-gray-700">
            {profile.avatar ? (
              <img
                src={getImageUrl(profile.avatar)}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <FaUserCircle className="w-full h-full text-gray-300 dark:text-gray-500" />
            )}
          </div>
          <label className="mt-3 cursor-pointer bg-gray-100 px-4 py-1.5 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-sm text-gray-800 dark:text-neutral-50">
            Chọn ảnh
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </label>
          <p className="text-xs text-gray-400 dark:text-neutral-400 mt-2 text-center">
            Dung lượng file tối đa 1 MB
            <br />
            Định dạng: .JPEG, .PNG
          </p>
        </div>
        {/* Form fields */}
        <div className="space-y-4">
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1"
            >
              Họ
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-900 dark:text-neutral-50 text-sm"
              required
            />
          </div>
          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1"
            >
              Tên
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-900 dark:text-neutral-50 text-sm"
              required
            />
          </div>
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1"
            >
              Số điện thoại
            </label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={formData.phone || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-900 dark:text-neutral-50 text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-900 dark:text-neutral-50 text-sm"
              required
            />
          </div>
          <div>
            <label
              htmlFor="dob"
              className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1"
            >
              Ngày sinh
            </label>
            <input
              type="date"
              id="dob"
              name="dob"
              value={formData.dob || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-900 dark:text-neutral-50 text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="gender"
              className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1"
            >
              Giới tính
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-900 dark:text-neutral-50 text-sm"
            >
              <option value="Nam" className="dark:bg-gray-900">
                Nam
              </option>
              <option value="Nữ" className="dark:bg-gray-900">
                Nữ
              </option>
              <option value="Khác" className="dark:bg-gray-900">
                Khác
              </option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm"
            disabled={loading}
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-4 py-1.5 bg-primary hover:bg-primaryblue text-white rounded-lg text-sm"
            disabled={loading}
          >
            {loading ? "Đang cập nhật..." : "Cập nhật"}
          </button>
        </div>
      </form>
      {notificationModal.show && <NotificationModal />}
    </div>
  );

  return isMobile ? MobileUpdateProfile : DesktopUpdateProfile;
};

export default UpdateProfile;