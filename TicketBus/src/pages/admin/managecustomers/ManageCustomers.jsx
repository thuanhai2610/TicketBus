import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUserCircle } from 'react-icons/fa';

const ManageCustomers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');
  const API_BASE_URL = 'http://localhost:3001';

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);

      try {
        // Gọi API /user/all với Bearer Token trong header
        const response = await axios.get(`${API_BASE_URL}/user/all`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Xử lý avatar URLs cho tất cả users
        const usersWithAvatars = response.data.map(user => {
          if (user.avatar) {
            if (user.avatar.startsWith('http')) {
              // Nếu avatar là URL đầy đủ, sử dụng trực tiếp
              return { ...user, avatarUrl: user.avatar };
            } else {
              // Nếu avatar là đường dẫn tương đối, thêm base URL
              return { ...user, avatarUrl: `${API_BASE_URL}${user.avatar}` };
            }
          } else {
            // Nếu không có avatar, đặt avatarUrl thành rỗng
            return { ...user, avatarUrl: '' };
          }
        });

        // Lưu danh sách users vào state
        setUsers(usersWithAvatars);
      } catch (err) {
        if (err.response?.status === 401) {
          setError('Bạn không có quyền truy cập. Chỉ admin mới có thể xem danh sách khách hàng.');
        } else if (err.response?.status === 400) {
          setError('Yêu cầu không hợp lệ: ' + err.response.data.message);
        } else {
          setError('Không thể lấy danh sách khách hàng.');
        }
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token]);


  const formatDate = (date) => {
    if (!date) return "N/A"; // Nếu không có ngày, trả về giá trị mặc định
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return "Invalid Date"; // Kiểm tra nếu ngày hợp lệ
    return parsedDate.toISOString().split("T")[0];
  }
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Danh sách khách hàng</h2>

      {loading && <p>Đang tải...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2">Avatar</th>
                <th className="border border-gray-300 px-4 py-2">Username</th>
                <th className="border border-gray-300 px-4 py-2">Phone</th>
                <th className="border border-gray-300 px-4 py-2">Email</th>
                <th className="border border-gray-300 px-4 py-2">Date of Birth</th>
                <th className="border border-gray-300 px-4 py-2">First name</th>
                <th className="border border-gray-300 px-4 py-2">Last name</th>
                <th className="border border-gray-300 px-4 py-2">Role</th>
                <th className="border border-gray-300 px-4 py-2">Gender</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      {user.avatarUrl ? (
                        <div className="flex justify-center">
                          <img
                            src={user.avatarUrl}
                            alt={`${user.username}'s avatar`}
                            className="w-10 h-10 rounded-full border border-primary object-cover"
                            onError={(e) => {
                              console.error("Avatar load error, using default icon");
                              e.target.style.display = 'none';
                              const parent = e.target.parentNode;
                              if (parent) {
                                const icon = document.createElement('span');
                                icon.innerHTML = '<svg class="w-10 h-10 text-gray-500 dark:text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path></svg>';
                                parent.appendChild(icon);
                              }
                            }}
                          />
                        </div>
                      ) : (
                        <div className="flex justify-center">
                          <FaUserCircle className="w-10 h-10 text-gray-500 dark:text-white" />
                        </div>
                      )}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">{user.username}</td>
                    <td className="border border-gray-300 px-4 py-2">{user.phone || 'N/A'}</td>
                    <td className="border border-gray-300 px-4 py-2">{user.email || 'N/A'}</td>
                    <td className="border border-gray-300 px-4 py-2">{formatDate(user.dob)}</td>
                    <td className="border border-gray-300 px-4 py-2">{user.firstName || 'N/A'}</td>
                    <td className="border border-gray-300 px-4 py-2">{user.lastName || 'N/A'}</td>
                    <td className="border border-gray-300 px-4 py-2">{user.role || 'N/A'}</td>
                    <td className="border border-gray-300 px-4 py-2">{user.gender || 'N/A'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="border border-gray-300 px-4 py-2 text-center">
                    Không có khách hàng nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

};

export default ManageCustomers;