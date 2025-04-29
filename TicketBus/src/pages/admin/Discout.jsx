import React, { useState, useEffect } from "react";
import axios from "axios";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { BsCalendar2Date } from "react-icons/bs";

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
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/coupons`);
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
        await axios.put(`${import.meta.env.VITE_API_URL}/coupons/${editingId}`, payload);
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/coupons`, payload);
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
        await axios.delete(`${import.meta.env.VITE_API_URL}/coupons/${id}`);
        await fetchCoupons();
      } catch (error) {
        console.error("Lỗi khi xoá mã:", error);
      }
    }
  };

  return (
    <div className="w-full mx-auto px-4 py-6">
      <h2 className="text-3xl font-bold text-white uppercase mb-6">Quản lý mã giảm giá</h2>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="bg-slate-800 border border-gray-700 rounded-2xl p-6 shadow-lg mb-10 space-y-6"
      >
        <h3 className="text-xl font-semibold text-white mb-4">
          {editingId ? "Cập nhật mã giảm giá" : "Tạo mã giảm giá"}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-gray-300 mb-1 block">Mã code</label>
            <input
              name="code"
              placeholder="VD: SUMMER2024"
              value={form.code}
              onChange={handleChange}
              className="w-full bg-gray-900 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary uppercase"
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-300 mb-1 block">Loại giảm giá</label>
            <select
              name="discountType"
              value={form.discountType}
              onChange={handleChange}
              className="w-full bg-gray-900 text-white border border-gray-600 rounded-lg px-4 py-2"
            >
              <option value="percentage">Giảm theo %</option>
              <option value="fixed">Giảm số tiền</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-300 mb-1 block">Giá trị giảm</label>
            <input
              name="discountValue"
              type="text"
              placeholder="VD: 100000 hoặc 15"
              value={
                form.discountValue
                  ? Number(form.discountValue).toLocaleString("vi-VN")
                  : ""
              }
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, "");
                setForm({ ...form, discountValue: raw });
              }}
              className="w-full bg-gray-900 text-white border border-gray-600 rounded-lg px-4 py-2"
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-300 mb-1 block">Ngày hết hạn</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full h-12 justify-start bg-gray-900 border border-gray-600 text-white"
                >
                  <BsCalendar2Date className="mr-2" />
                  {form.expiresAt
                    ? format(new Date(form.expiresAt), "dd 'tháng' MM 'năm' yyyy", { locale: vi })
                    : "Chọn ngày"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2 bg-white shadow-xl rounded-xl">
                <Calendar
                  mode="single"
                  selected={form.expiresAt ? new Date(form.expiresAt) : undefined}
                  onSelect={(selectedDate) => {
                    if (selectedDate) {
                      const formattedDate = selectedDate.toISOString().split("T")[0];
                      handleChange({ target: { name: "expiresAt", value: formattedDate } });
                    }
                  }}
                  disabled={(date) =>
                    date < new Date(new Date().setHours(0, 0, 0, 0))
                  }
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="sm:col-span-2">
            <label className="text-sm text-gray-300 mb-1 block">Mô tả</label>
            <input
              name="description"
              placeholder="VD: Áp dụng cho khách hàng mới"
              value={form.description}
              onChange={handleChange}
              className="w-full bg-gray-900 text-white border border-gray-600 rounded-lg px-4 py-2"
            />
          </div>
        </div>

        <div className="flex justify-end items-center gap-4">
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-red-400 hover:underline font-semibold"
            >
              Huỷ
            </button>
          )}
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-500 transition text-white px-6 py-2 rounded-lg font-semibold"
          >
            {editingId ? "Cập nhật mã" : "Tạo mã"}
          </button>
        </div>
      </form>

      {/* DANH SÁCH */}
      <div className="bg-slate-800 border border-gray-700 rounded-2xl shadow-lg overflow-hidden">
        <h3 className="text-lg font-semibold text-white px-6 py-4 border-b border-gray-700 uppercase">
          Danh sách mã giảm giá
        </h3>
        <table className="w-full text-sm text-gray-300">
          <thead className="text-left bg-slate-800 border-b border-gray-700">
            <tr>
              <th className="px-6 py-3">Mã</th>
              <th className="px-6 py-3">Kiểu</th>
              <th className="px-6 py-3">Giá trị</th>
              <th className="px-6 py-3">Hết hạn</th>
              <th className="px-6 py-3">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => (
              <tr
                key={coupon._id}
                className="border-t border-gray-700 hover:bg-gray-700/50 transition"
              >
                <td className="px-6 py-4 font-semibold uppercase">{coupon.code}</td>
                <td className="px-6 py-4">{coupon.discountType === "percentage" ? "%" : "VNĐ"}</td>
                <td className="px-6 py-4">
                  {coupon.discountType === "percentage"
                    ? `${coupon.discountValue}%`
                    : `${coupon.discountValue.toLocaleString()} VNĐ`}
                </td>
                <td className="px-6 py-4">
                  {coupon.expiresAt
                    ? new Date(coupon.expiresAt).toLocaleDateString("vi-VN")
                    : "Không giới hạn"}
                </td>
                <td className="px-6 py-4 space-x-4">
                  <button
                    onClick={() => handleEdit(coupon)}
                    className="text-blue-400 hover:underline"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(coupon._id)}
                    className="text-red-400 hover:underline"
                  >
                    Xoá
                  </button>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-400">
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
