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
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const BACKEND_URL = "http://localhost:3001";

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
            const response = await axios.get(`${BACKEND_URL}/user/profile`, {
              headers: { Authorization: `Bearer ${token}` },
            });

            const dobDate = response.data.dob ? new Date(response.data.dob) : null;
            const formattedDob = dobDate && !isNaN(dobDate.getTime())
              ? dobDate.toISOString().split('T')[0]
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
              setError("Không tìm thấy người dùng hoặc lỗi server!");
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
      navigate('/login');
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

  const handleImageChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Vui lòng chọn một file ảnh hợp lệ!");
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


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!formData.firstName || !formData.lastName || !formData.email) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    setLoading(true);
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

      if (selectedFile) {
        formDataToSend.append("avatar", selectedFile);
      }

      const response = await axios.post(
        `${BACKEND_URL}/user/update-profile`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccessMsg("Cập nhật thông tin thành công!");

      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Error updating profile:", error);
      if (error.response?.status === 401) {
        handleLogout();
      } else {
        setError(error.response?.data?.message || "Lỗi khi cập nhật thông tin! Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (avatarPath) => {
    if (!avatarPath) return null;
    return avatarPath.startsWith('data:image/') || avatarPath.startsWith('http')
      ? avatarPath
      : `${BACKEND_URL}${avatarPath}`;
  };

  if (loading && !profile) {
    return <div className="text-center text-primary">Đang tải...</div>;
  }

  if (error && !profile) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (!profile) {
    return <div className="text-center text-red-500">Không tìm thấy thông tin người dùng</div>;
  }

  return (
    <div className="p-2">
      <h2 className="text-xl font-semibold mb-2">Thông tin tài khoản</h2>
      <p className="text-sm text-gray-500 mb-4 dark:text-neutral-300">Quản lý thông tin hồ sơ để bảo mật tài khoản</p>

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
            <label className="mt-3 cursor-pointer bg-gray-100 px-4 py-1 rounded-full hover:bg-gray-200 dark:bg-transparent dark:hover:bg-primaryblue border dark:border-neutral-500 dark:hover:text-neutral-950 ">
              Chọn ảnh
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
            <p className="text-xs text-gray-400 mt-1 text-center">
              Dung lượng file tối đa 1 MB<br />
              Định dạng:.JPEG, .PNG
            </p>
          </div>

          {/* Form fields */}
          <div className="w-96 space-y-2 ">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1  dark:text-neutral-50 ">
                  Họ
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName || ""}
                  onChange={handleInputChange}
                  className="border rounded px-3 py-2 w-full  dark:text-neutral-50 dark:bg-transparent dark:border-neutral-800"
                  required
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Tên
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName || ""}
                  onChange={handleInputChange}
                  className="border rounded px-3 py-2 w-full  dark:text-neutral-50 dark:bg-transparent dark:border-neutral-800"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại
              </label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={formData.phone || ""}
                onChange={handleInputChange}
                className="border rounded px-3 py-2 w-full  dark:text-neutral-50 dark:bg-transparent dark:border-neutral-800"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email || ""}
                onChange={handleInputChange}
                className="border rounded px-3 py-2 w-full  dark:text-neutral-50 dark:bg-transparent dark:border-neutral-800"
                required
              />
            </div>

            <div>
              <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">
                Ngày sinh
              </label>
              <input
                type="date"
                id="dob"
                name="dob"
                value={formData.dob || ""}
                onChange={handleInputChange}
                className="border rounded px-3 py-2 w-full  dark:text-neutral-50 dark:bg-transparent dark:border-neutral-800"
              />
            </div>


            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                Giới tính
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender || ""}
                onChange={handleInputChange}
                className="border rounded px-3 py-2 w-full  dark:text-neutral-50 dark:bg-transparent dark:border-neutral-800"
              >
                <option value="Nam" className="dark:bg-primary">Nam</option>
                <option value="Nữ" className="dark:bg-primary">Nữ</option>
                <option value="Khác" className="dark:bg-primary">Khác</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit button and messages */}
        <div className="flex justify-end space-x-4">
          <button
            type="submit"
            className="bg-primary text-white px-6 py-2 rounded-full hover:bg-primaryblue dark:hover:text-neutral-950 hover:text-neutral-950"
            disabled={loading}
          >
            {loading ? "Đang cập nhật..." : "Cập nhật"}
          </button>
{/* 
          <button
            type="button"
            onClick={handleCancel}
            className="bg-red-500 text-white px-6 py-2 rounded-full hover:bg-red-600 dark:hover:text-neutral-950 hover:text-neutral-950"
          >
            Hủy
          </button> */}
        </div>

        {successMsg && (
          <div className="text-green-600 text-sm mt-2">{successMsg}</div>
        )}

        {error && (
          <div className="text-red-600 text-sm mt-2">{error}</div>
        )}

      </form>


    </div>
  );
};

export default UpdateProfile;