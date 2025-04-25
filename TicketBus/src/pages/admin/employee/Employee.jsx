/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const Employees = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingDriver, setEditingDriver] = useState(null);
  const [formData, setFormData] = useState({
    driverName: "",
    phone: "",
    address: "",
    driverId: "",
    companyId: "",
  });
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);

  const token = localStorage.getItem("token");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/drivers`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data === null || response.data.success === false) {
        toast.warning(response.data?.message || "DriverId đã tồn tại!");
        return;
      }

      toast.success("Tài xế đã được thêm thành công!");

      setFormData({
        driverName: "",
        phone: "",
        address: "",
        driverId: "",
        companyId: "",
      });
      setShowForm(false);
      fetchDrivers();
    } catch (error) {
      if (error.response?.status === 400) {
        toast.warning(error.response?.data?.message || "Dữ liệu không hợp lệ");
      } else {
        toast.error("Đã xảy ra lỗi khi thêm tài xế.");
      }
    }
  };


  const fetchDrivers = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/drivers/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDrivers(res.data);
    } catch (err) {
      console.error("Lỗi khi fetch tài xế:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleEdit = (driver) => {
    setEditingDriver(driver.driverId);
    setFormData({ ...driver });
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setEditingDriver(null);
    setFormData({
      driverName: "",
      phone: "",
      address: "",
      driverId: "",
      companyId: "",
    });
    setShowForm(false);
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/drivers/${editingDriver}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchDrivers();
      handleCancelEdit();
    } catch (err) {
      console.error("Lỗi khi cập nhật:", err);
    }
  };

  const handleDelete = async (driverId) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa tài xế này?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/drivers/${driverId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchDrivers();
    } catch (err) {
      console.error("Lỗi khi xóa:", err);
    }
  };

  return (
    <div className="w-full mx-auto text-white">

      <h2 className="text-3xl font-bold mb-4 uppercase">quản lí danh sách tài xế</h2>
      {showForm && (
        <form
          onSubmit={editingDriver ? handleUpdate : handleSubmit}
          className="bg-gray-800 p-6 rounded-xl mt-4 space-y-4"
        >
          <h2 className="text-lg font-semibold">{editingDriver ? "Chỉnh sửa Tài xế" : "Thêm Tài xế mới"}</h2>

          <input
            type="text"
            name="driverName"
            placeholder="Tên tài xế"
            value={formData.driverName}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 text-white"
            required
          />

          <input
            type="text"
            name="phone"
            placeholder="Số điện thoại"
            value={formData.phone}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 text-white"
            required
          />

          <input
            type="text"
            name="address"
            placeholder="Địa chỉ"
            value={formData.address}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 text-white"
          />

          <input
            type="text"
            name="driverId"
            placeholder="Mã tài xế"
            value={formData.driverId}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 text-white"
          />

          <input
            type="text"
            name="companyId"
            placeholder="Mã công ty"
            value={formData.companyId}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 text-white"
          />

          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              {editingDriver ? "Lưu thay đổi" : "Lưu"}
            </button>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
            >
              Hủy
            </button>
          </div>
        </form>
      )}

      {message && <p className="mt-4 text-sm text-center text-green-400">{message}</p>}

      <div className="p-4">

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-emerald-500 hover:bg-emerald-700 text-white px-4 py-2 mb-6 rounded flex justify-end text-end"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              ></path>
            </svg>
            Thêm tài xế
          </button>
        )}
        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <table className="min-w-full table-auto border-collapse border border-gray-700 shadow-lg shadow-neutral-400 text-white">
            <thead className="bg-gray-800">
              <tr>
                <th className="  px-4 py-2">Tên tài xế</th>
                <th className="  px-4 py-2">SĐT</th>
                <th className="  px-4 py-2">Địa chỉ</th>
                <th className="  px-4 py-2">Mã tài xế</th>
                <th className="  px-4 py-2">Mã công ty</th>
                <th className="  px-4 py-2">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-500">
              {drivers.map((driver) => (
                <tr key={driver.driverId} className="text-center">
                  <td className=" px-4 py-2">{driver.driverName}</td>
                  <td className=" px-4 py-2">{driver.phone}</td>
                  <td className="  px-4 py-2">{driver.address}</td>
                  <td className="  px-4 py-2">{driver.driverId}</td>
                  <td className="  px-4 py-2">{driver.companyId}</td>
                  <td className="px-2 py-4 text-sm flex space-x-2 justify-center ">
                    <button
                      onClick={() => handleDelete(driver.driverId)}
                      className="border border-red-500 text-red-500 px-3 py-1 rounded flex items-center hover:bg-red-500 hover:text-white"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        ></path>
                      </svg>
                      Xóa
                    </button>
                    <button
                      onClick={() => handleEdit(driver)}
                      className="border border-blue-500 text-blue-500 px-3 py-1 rounded flex items-center hover:bg-blue-500 hover:text-white"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        ></path>
                      </svg>
                      Sửa
                    </button>

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Employees;
