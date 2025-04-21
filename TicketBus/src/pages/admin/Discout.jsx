import React, { useState, useEffect } from "react";
import axios from "axios";

const Discount = () => {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    description: "",
    expiresAt: "",
  });
  const [editingId, setEditingId] = useState(null);

  const fetchCoupons = async () => {
    try {
      const res = await axios.get("http://localhost:3001/coupons");
      setCoupons(res.data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách mã:", error);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      discountValue: Number(form.discountValue),
      expiresAt: form.expiresAt || null,
    };

    try {
      if (editingId) {
        await axios.put(`http://localhost:3001/coupons/${editingId}`, payload);
      } else {
        await axios.post("http://localhost:3001/coupons", payload);
      }

      await fetchCoupons();
      resetForm();
    } catch (error) {
      console.error("Lỗi khi lưu mã giảm:", error);
    }
  };

  const resetForm = () => {
    setForm({
      code: "",
      discountType: "percentage",
      discountValue: "",
      description: "",
      expiresAt: "",
    });
    setEditingId(null);
  };

  const handleEdit = (coupon) => {
    setForm({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      description: coupon.description,
      expiresAt: coupon.expiresAt?.slice(0, 10) || "",
    });
    setEditingId(coupon._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xoá mã này không?")) {
      try {
        await axios.delete(`http://localhost:3001/coupons/${id}`);
        await fetchCoupons();
      } catch (error) {
        console.error("Lỗi khi xoá mã:", error);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 ">
      <h2 className="text-3xl font-bold text-primary mb-6">Quản lý mã giảm giá</h2>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow mb-10 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            name="code"
            placeholder="Mã code"
            value={form.code}
            onChange={handleChange}
            className="border px-4 py-2 rounded w-full"
            required
          />
          <select
            name="discountType"
            value={form.discountType}
            onChange={handleChange}
            className="border px-4 py-2 rounded w-full"
          >
            <option value="percentage">Giảm theo %</option>
            <option value="fixed">Giảm số tiền</option>
          </select>
          <input
            name="discountValue"
            type="number"
            placeholder="Giá trị giảm"
            value={form.discountValue}
            onChange={handleChange}
            className="border px-4 py-2 rounded w-full"
            required
          />
          <input
            name="expiresAt"
            type="date"
            value={form.expiresAt}
            onChange={handleChange}
            className="border px-4 py-2 rounded w-full"
          />
          <input
            name="description"
            type="string"
            placeholder="Mô tả"

            value={form.description}
            onChange={handleChange}
            className="border px-4 py-2 rounded w-full"
          />
        </div>
        <div className="flex justify-end gap-4">
          {editingId && (
            <button type="button" onClick={resetForm} className="text-gray-600">
              Huỷ
            </button>
          )}
          <button type="submit" className="bg-primary text-white px-4 py-2 rounded">
            {editingId ? "Cập nhật mã" : "Tạo mã"}
          </button>
        </div>
      </form>

      {/* LIST */}
      <div className="bg-white shadow rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Mã</th>
              <th className="p-3">Kiểu</th>
              <th className="p-3">Giá trị</th>
              <th className="p-3">Hết hạn</th>
              <th className="p-3">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => (
              <tr key={coupon._id} className="border-t">
                <td className="p-3 font-semibold">{coupon.code}</td>
                <td className="p-3">{coupon.discountType === 'percentage' ? '%' : 'VNĐ'}</td>
                <td className="p-3">{coupon.discountType === 'percentage'
                  ? `${coupon.discountValue}%`
                  : `${coupon.discountValue.toLocaleString()} đ`
                }</td>
                <td className="p-3">
                  {coupon.expiresAt
                    ? new Date(coupon.expiresAt).toLocaleDateString("vi-VN")
                    : "Không giới hạn"}
                </td>
                <td className="p-3 space-x-2">
                  <button
                    onClick={() => handleEdit(coupon)}
                    className="text-blue-600 hover:underline"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(coupon._id)}
                    className="text-red-600 hover:underline"
                  >
                    Xoá
                  </button>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  Không có mã giảm giá nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Discount;
