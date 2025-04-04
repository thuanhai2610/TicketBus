import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManageCustomers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token')  ; 

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);

      try {
        // Gọi API /user/all với Bearer Token trong header
        const response = await axios.get('http://localhost:3001/user/all', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Lưu danh sách users vào state
        setUsers(response.data);
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
  }, []);

  // Format ngày sinh (dob) để hiển thị
  const formatDate = (dob) => {
    if (!dob) return 'N/A';
    const date = new Date(dob);
    return date.toISOString().split('T')[0]; // Định dạng YYYY-MM-DD
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Danh sách khách hàng</h2>

      {loading && <p>Đang tải...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2">Username</th>
              <th className="border border-gray-300 px-4 py-2">Phone</th>
              <th className="border border-gray-300 px-4 py-2">Email</th>
              <th className="border border-gray-300 px-4 py-2">Date of Birth</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">{user.username}</td>
                  <td className="border border-gray-300 px-4 py-2">{user.phone || 'N/A'}</td>
                  <td className="border border-gray-300 px-4 py-2">{user.email || 'N/A'}</td>
                  <td className="border border-gray-300 px-4 py-2">{formatDate(user.dob)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="border border-gray-300 px-4 py-2 text-center">
                  Không có khách hàng nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ManageCustomers;