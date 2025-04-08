import React, { useState, useEffect } from "react";
import axios from "axios";

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
      await axios.post("http://localhost:3001/drivers", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Tài xế đã được thêm thành công!");
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
      console.error("Lỗi khi thêm tài xế:", error);
      setMessage("Đã xảy ra lỗi khi thêm tài xế.");
    }
  };

  const fetchDrivers = async () => {
    try {
      const res = await axios.get("http://localhost:3001/drivers/all", {
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
      await axios.put(`http://localhost:3001/drivers/${editingDriver}`, formData, {
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
      await axios.delete(`http://localhost:3001/drivers/${driverId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchDrivers();
    } catch (err) {
      console.error("Lỗi khi xóa:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-6 text-white">
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Thêm tài xế
        </button>
      )}

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
        <h2 className="text-2xl font-bold mb-4">Danh sách Tài xế</h2>
        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <table className="min-w-full table-auto border-collapse border border-gray-700 text-white">
            <thead className="bg-gray-800">
              <tr>
                <th className="border border-gray-700 px-4 py-2">Tên tài xế</th>
                <th className="border border-gray-700 px-4 py-2">SĐT</th>
                <th className="border border-gray-700 px-4 py-2">Địa chỉ</th>
                <th className="border border-gray-700 px-4 py-2">Mã tài xế</th>
                <th className="border border-gray-700 px-4 py-2">Mã công ty</th>
                <th className="border border-gray-700 px-4 py-2">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((driver) => (
                <tr key={driver.driverId} className="text-center">
                  <td className="border border-gray-700 px-4 py-2">{driver.driverName}</td>
                  <td className="border border-gray-700 px-4 py-2">{driver.phone}</td>
                  <td className="border border-gray-700 px-4 py-2">{driver.address}</td>
                  <td className="border border-gray-700 px-4 py-2">{driver.driverId}</td>
                  <td className="border border-gray-700 px-4 py-2">{driver.companyId}</td>
                  <td className="border border-gray-700 px-4 py-2 space-x-2">
                    <button
                      onClick={() => handleEdit(driver)}
                      className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(driver.driverId)}
                      className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded"
                    >
                      Xóa
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
