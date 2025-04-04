import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaUserCircle } from "react-icons/fa";

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [avatarError, setAvatarError] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const BACKEND_URL = "http://localhost:3001";

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const queryParams = new URLSearchParams(location.search);
                const username = queryParams.get("username");
                if (!username) throw new Error("Username is required");

                const response = await axios.get(`${BACKEND_URL}/user/profile?username=${username}`);
                const avatar = response.data.avatar ? `${BACKEND_URL}${response.data.avatar}` : null;
                const dobDate = response.data.dob ? new Date(response.data.dob) : null;

                const formattedDob = dobDate && !isNaN(dobDate.getTime())
                    ? `${dobDate.getDate().toString().padStart(2, '0')}/${(dobDate.getMonth() + 1).toString().padStart(2, '0')}/${dobDate.getFullYear()}`
                    : "Chưa cập nhật";

                setProfile({
                    ...response.data,
                    avatar,
                    dob: formattedDob
                });

                setLoading(false);
            } catch (err) {
                console.error("Error fetching profile:", err);
                setError("Không tìm thấy người dùng hoặc lỗi server!");
                setLoading(false);
            }
        };

        fetchProfile();
    }, [location]);useEffect(() => {
        const fetchProfile = async () => {
            try {
                const queryParams = new URLSearchParams(location.search);
                const username = queryParams.get("username");
                if (!username) throw new Error("Username is required");
    
                const response = await axios.get(`${BACKEND_URL}/user/profile?username=${username}`);
                const avatar = response.data.avatar ? `${BACKEND_URL}${response.data.avatar}` : null;
                const dobDate = response.data.dob ? new Date(response.data.dob) : null;
    
                const formattedDob = dobDate && !isNaN(dobDate.getTime())
                    ? `${dobDate.getDate().toString().padStart(2, '0')}/${(dobDate.getMonth() + 1).toString().padStart(2, '0')}/${dobDate.getFullYear()}`
                    : "Chưa cập nhật";
    
                setProfile({
                    ...response.data,
                    avatar,
                    dob: formattedDob
                });
    
                setLoading(false);
            } catch (err) {
                console.error("Error fetching profile:", err);
                setError("Không tìm thấy người dùng hoặc lỗi server!");
                setLoading(false);
            }
        };
    
        fetchProfile();
    

        if (location.state?.updated) {
            window.history.replaceState({}, document.title); 
        }
    }, [location]);
    

    const handleEditProfile = () => {
        if (profile?.username) {
            navigate(`/update-profile?username=${profile.username}`);
        }
    };

    const handleAvatarError = () => {
        setAvatarError(true);
    };

    if (loading) {
        return <div className="text-center mt-20 text-blue-600 text-lg">Đang tải...</div>;
    }

    if (error || !profile) {
        return <div className="text-center mt-20 text-red-600 text-lg">{error || "Không tìm thấy thông tin người dùng"}</div>;
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-primaryblue p-4">
            <div className="flex flex-col lg:flex-row w-full max-w-6xl">
                {/* Sidebar */}
                <div className="lg:w-1/3 bg-white rounded-2xl shadow-lg p-6 mb-6 lg:mb-0 text-center flex flex-col items-center justify-center">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary mb-4">
                        {profile.avatar && !avatarError ? (
                            <img
                                src={profile.avatar}
                                alt="Avatar"
                                className="w-full h-full object-cover"
                                onError={handleAvatarError}
                            />
                        ) : (
                            <FaUserCircle className="w-full h-full text-gray-400" />
                        )}
                    </div>
                    <h3 className="text-xl font-semibold text-primary mb-1">{profile.username}</h3>
                    <p className="text-sm text-gray-500">Thông tin tài khoản</p>
                </div>

                {/* Main Content */}
                <div className="lg:w-2/3 bg-white rounded-2xl shadow-lg p-6 lg:ml-6">
                    <h2 className="text-2xl font-bold text-primary mb-6">Thông tin cá nhân</h2>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Họ" value={profile.firstName} />
                            <InputField label="Tên" value={profile.lastName} />
                        </div>
                        <InputField label="Email" value={profile.email} />
                        <InputField label="Số điện thoại" value={profile.phone} />
                        <InputField label="Ngày sinh" value={profile.dob} />
                        <InputField label="Giới tính" value={profile.gender} />

                        <div className="mt-6 text-center">
                            <button
                                onClick={handleEditProfile}
                                className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg shadow transition duration-200 text-center justify-center"
                            >
                                Chỉnh sửa thông tin
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

};

// Reusable Input Field Component
const InputField = ({ label, value }) => (
    <div>
        <label className="block text-gray-600 mb-1 font-medium">{label}:</label>
        <input
            type="text"
            value={value || "Chưa cập nhật"}
            disabled
            className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
        />
    </div>
);

export default Profile;
