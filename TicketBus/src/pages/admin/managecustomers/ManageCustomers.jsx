import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUserCircle } from 'react-icons/fa';

const ManageCustomers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/user/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const usersWithAvatars = response.data.map(user => {
        if (user.avatar) {
          if (user.avatar.startsWith('http')) {
            return { ...user, avatarUrl: user.avatar };
          } else {
            return { ...user, avatarUrl: `${import.meta.env.VITE_API_URL}${user.avatar}` };
          }
        } else {
          return { ...user, avatarUrl: '' };
        }
      });

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

  const handleDelete = async (userId, username) => {
    if (window.confirm(`Bạn có chắc muốn xóa người dùng ${username}?`)) {
      try {
        
        const response = await axios.delete(`${import.meta.env.VITE_API_URL}/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(users.filter(user => user._id !== userId));
        if (response.data.success) {
          setUsers(users.filter(user => user.userId !== userId));
          alert('Xóa người dùng thành công!');
        }
      } catch (err) {
        console.error('Full error object:', err);
        console.error('Error response:', err.response);
        setError('Không thể xóa người dùng: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return "Invalid Date";
    return parsedDate.toISOString().split("T")[0];
  };

  return (
    <div className="">
      <h2 className="text-3xl font-bold mb-4 uppercase">Danh sách khách hàng</h2>

      {loading && <p>Đang tải...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto mt-10">
          <table className="min-w-full border-collapse border border-gray-700">
            <thead>
              <tr className="bg-gray-700 hover:bg-primary">
                <th className="px-4 py-2">Avatar</th>
                <th className="px-4 py-2">Username</th>
                <th className="px-4 py-2">Phone</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Date of Birth</th>
                <th className="px-4 py-2">First name</th>
                <th className="px-4 py-2">Last name</th>
                <th className="px-4 py-2">Role</th>
                <th className="px-4 py-2">Gender</th>
                <th className="px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-700'>
              {users.length > 0 ? (
                users.map((user, index) => (
                  <tr key={index} className="hover:bg-gray-500">
                    <td className="px-4 py-2 text-center">
                      {user.avatarUrl ? (
                        <div className="flex justify-center">
                          <img
                            src={user.avatarUrl}
                            alt={`${user.username}'s avatar`}
                            className="w-10 h-10 rounded-full border border-primary object-cover"
                            onError={(e) => {
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
                    <td className="text-center px-4 py-2">{user.username}</td>
                    <td className="text-center px-4 py-2">{user.phone || 'N/A'}</td>
                    <td className="text-center px-4 py-2">{user.email || 'N/A'}</td>
                    <td className="text-center px-4 py-2">{formatDate(user.dob)}</td>
                    <td className="text-center px-4 py-2">{user.firstName || 'N/A'}</td>
                    <td className="text-center px-4 py-2">{user.lastName || 'N/A'}</td>
                    <td className="text-center px-4 py-2">{user.role || 'N/A'}</td>
                    <td className="text-center px-4 py-2">{user.gender || 'N/A'}</td>
                    <td className="text-center px-4 py-2">
                      <button
                        onClick={() => handleDelete(user.userId, user.username)}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="px-4 py-2 text-center">
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