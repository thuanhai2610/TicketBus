/* eslint-disable no-undef */
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaUserCircle, FaTimes } from 'react-icons/fa';
import { ClipLoader } from 'react-spinners';


const ManageCustomers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const usersPerPage = 12;

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchUsers();
  }, [token]);


  const modalRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setSelectedUser(null);
      }
    };

    if (selectedUser) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedUser]);



  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/user/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const usersWithAvatars = response.data
        .filter(user => user.role && user.role.toLowerCase() === 'user') // Case-insensitive role filter
        .map(user => ({
          ...user,
          avatarUrl: user.avatar
            ? user.avatar.startsWith('http')
              ? user.avatar
              : `${import.meta.env.VITE_API_URL}${user.avatar}`
            : '',
        }));
      setUsers(usersWithAvatars);
      setFilteredUsers(usersWithAvatars);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleError = (err) => {
    const errorMessage = err.response?.status === 401
      ? 'Bạn không có quyền truy cập. Vui lòng kiểm tra token.'
      : err.response?.status === 400
        ? 'Yêu cầu không hợp lệ: ' + err.response.data.message
        : 'Không thể lấy danh sách khách hàng. Vui lòng thử lại.';
    setError(errorMessage);
    console.error('Error fetching users:', err.response || err.message); // Detailed error logging
  };

  const handleDelete = async (userId, username) => {
    if (window.confirm(`Bạn có chắc muốn xóa người dùng ${username}?`)) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(users.filter(user => user.userId !== userId));
        setFilteredUsers(filteredUsers.filter(user => user.userId !== userId));
        setSelectedUser(null);
        alert('Xóa người dùng thành công!');
      } catch (err) {
        setError('Không thể xóa người dùng: ' + (err.response?.data?.message || err.message));
        console.error('Error deleting user:', err.response || err.message);
      }
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const parsedDate = new Date(date);
    return isNaN(parsedDate.getTime()) ? 'Invalid Date' : parsedDate.toISOString().split('T')[0];
  };

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container mx-auto p-6 bg-gray-900 min-h-screen text-white">
      <h2 className="text-4xl font-extrabold mb-6 uppercase text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
        Quản Lý Khách Hàng
      </h2>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <ClipLoader color="#36A2EB" size={50} />
        </div>
      )}

      {error && (
        <div className="bg-red-600 text-white p-4 rounded-lg mb-6 shadow-lg">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-6">


          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {currentUsers.length > 0 ? (
              currentUsers.map((user, index) => (
                <div
                  key={index}
                  className="bg-gray-800 rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow cursor-pointer"
                  onClick={() => setSelectedUser(user)}
                >
                  <div className="flex flex-col items-center">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={`${user.username}'s avatar`}
                        className="w-16 h-16 rounded-full border border-blue-500 object-cover mb-2"
                      />
                    ) : (
                      <FaUserCircle className="w-16 h-16 text-gray-400 mb-2" />
                    )}
                    <h3 className="text-lg font-semibold text-white">{user.username || 'N/A'}</h3>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-400">
                Không có khách hàng nào phù hợp.
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center py-4">
              <nav className="flex space-x-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => paginate(i + 1)}
                    className={`px-3 py-1 rounded-lg ${currentPage === i + 1
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </nav>
            </div>
          )}

          {selectedUser && (
            <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center backdrop-blur-sm transition-opacity duration-300 animate-fadeIn">
              <div
                ref={modalRef}
                className="bg-gray-900 rounded-2xl p-8 w-full max-w-2xl relative shadow-2xl border border-gray-700 transform transition-all scale-100 animate-slideIn"
              >
                {/* Nút đóng */}
                <button
                  onClick={() => setSelectedUser(null)}
                  className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors"
                >
                  <FaTimes size={24} />
                </button>

                <button
                  onClick={() => setSelectedUser(null)}
                  className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors"
                >
                  <FaTimes size={24} />
                </button>

                {/* Header */}
                <h3 className="text-3xl font-bold mb-6 text-center text-white uppercase">Thông tin chi tiết khách hàng</h3>

                {/* Avatar and name */}
                <div className="flex flex-col items-center mb-6">
                  {selectedUser.avatarUrl ? (
                    <img
                      src={selectedUser.avatarUrl}
                      alt={`${selectedUser.username}'s avatar`}
                      className="w-28 h-28 rounded-full border-4 border-blue-500 object-cover shadow-lg"
                      onError={(e) => (e.target.src = 'https://via.placeholder.com/100')}
                    />
                  ) : (
                    <FaUserCircle className="w-28 h-28 text-gray-500 mb-2" />
                  )}
                  <h4 className="text-2xl font-semibold text-white mt-3">{selectedUser.username || 'N/A'}</h4>
                </div>

                {/* User Info in two columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-300 mb-6">
                  <p><span className="font-medium text-white">📱 Số điện thoại:</span> {selectedUser.phone || 'N/A'}</p>
                  <p><span className="font-medium text-white">📧 Email:</span> {selectedUser.email || 'N/A'}</p>
                  <p><span className="font-medium text-white">🎂 Ngày sinh:</span> {formatDate(selectedUser.dob)}</p>
                  <p><span className="font-medium text-white">🧑 Họ Tên:</span> {selectedUser.firstName || 'N/A'} {selectedUser.lastName || ''}</p>
                  <p><span className="font-medium text-white">🛡️ Vai trò:</span> {selectedUser.role || 'N/A'}</p>
                  <p><span className="font-medium text-white">⚧️ Giới tính:</span> {selectedUser.gender || 'N/A'}</p>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(selectedUser.userId, selectedUser.username)}
                  className="mt-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg w-full flex items-center justify-center gap-2 transition-all"
                >
                  <FaTimes /> Xoá người dùng
                </button>
              </div>
            </div>
          )}


        </div>
      )}
    </div>
  );
};

export default ManageCustomers;