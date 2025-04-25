import React, { useState, useEffect } from "react";
import axios from "axios";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { BsCalendar2Date } from "react-icons/bs"

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
    <div className="w-full mx-auto px-4  ">
      <h2 className="text-3xl font-bold text-neutral-50 uppercase mb-6">Quản lý mã giảm giá</h2>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="bg-slate-700 p-6 rounded-2xl shadow-lg mb-10 space-y-6">
        <h2 className="text-xl font-bold text-gray-50">Tạo / Cập nhật mã giảm giá</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <input
            name="code"
            placeholder="Mã code"
            value={form.code}
            onChange={handleChange}
            className="text-neutral-100 bg-transparent uppercase border border-gray-300 px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-primary focus:outline-none"
            required
          />
          <select
            name="discountType"
            value={form.discountType}
            onChange={handleChange}
            className="text-neutral-100 focus:text-neutral-950 bg-transparent border border-gray-300 px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-primary focus:outline-none"
          >
            <option value="percentage">Giảm theo %</option>
            <option value="fixed">Giảm số tiền</option>
          </select>
          <input
            name="discountValue"
            type="text"
            placeholder="Giá trị giảm"
            value={
              form.discountValue
                ? Number(form.discountValue).toLocaleString("vi-VN")
                : ""
            }
            onChange={(e) => {
              // Bỏ tất cả ký tự không phải số 
              const raw = e.target.value.replace(/\D/g, "");
              // Lưu lại dạng số 
              setForm({ ...form, discountValue: raw });
            }}
            className="text-neutral-100 bg-transparent border border-gray-300 px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-primary focus:outline-none"
            required
          />

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="h-12 w-full  border border-gray-300 bg-transparent dark:bg-transparent dark:text-neutral-100 text-neutral-300 px-4 py-3 rounded-lg flex items-center justify-start"
              >
                <BsCalendar2Date className="text-gray-50 mr-2 dark:text-neutral-50 " />
                {form.expiresAt
                  ? format(new Date(form.expiresAt), "dd 'tháng' MM 'năm' yyyy", { locale: vi })
                  : "Chọn ngày"}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              side="top"
              className="absolute z-50 w-auto left-0 top-12 bg-white shadow-md rounded-lg p-2 min-h-[300px] h-auto"
            >
              <Calendar
                mode="single"
                selected={form.expiresAt ? new Date(form.expiresAt) : undefined}
                onSelect={(selectedDate) => {
                  if (selectedDate) {
                    const formattedDate = selectedDate.toISOString().split("T")[0] // yyyy-MM-dd
                    handleChange({
                      target: {
                        name: "expiresAt",
                        value: formattedDate
                      }
                    })
                  }
                }}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              />
            </PopoverContent>
          </Popover>

          <input
            name="description"
            placeholder="Mô tả"
            value={form.description}
            onChange={handleChange}
            className="text-neutral-100 bg-transparent sm:col-span-2 border border-gray-300 px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>
        <div className="flex justify-end gap-4">
          {editingId && (
            <button type="button" onClick={resetForm} className="text-red-500 hover:text-red-300 font-bold">
              Huỷ
            </button>
          )}
          <button type="submit" className="bg-slate-500 text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-all duration-200">
            {editingId ? "Cập nhật mã" : "Tạo mã"}
          </button>
        </div>
      </form>

      {/* LIST */}
      <div className="bg-gray-800 border border-gray-700 shadow-lg rounded-2xl overflow-hidden">
        <h2 className="text-lg font-semibold text-neutral-100 px-6 py-4 border-b border-gray-700 uppercase">
          Danh sách mã giảm giá
        </h2>
        <table className="w-full text-sm text-neutral-200">
          <thead className="bg-transparent text-left uppercase font-bold">
            <tr className="border-b border-gray-700 ">
              <th className="p-4 font-medium">Mã</th>
              <th className="p-4 font-medium">Kiểu</th>
              <th className="p-4 font-medium">Giá trị</th>
              <th className="p-4 font-medium">Hết hạn</th>
              <th className="p-4 font-medium">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => (
              <tr key={coupon._id} className="border-t border-gray-700 hover:bg-gray-700/40 transition">
                <td className="p-4 font-semibold uppercase">{coupon.code}</td>
                <td className="p-4">{coupon.discountType === 'percentage' ? '%' : 'VNĐ'}</td>
                <td className="p-4">
                  {coupon.discountType === 'percentage'
                    ? `${coupon.discountValue}%`
                    : `${coupon.discountValue.toLocaleString()} VNĐ`}
                </td>
                <td className="p-4">
                  {coupon.expiresAt
                    ? new Date(coupon.expiresAt).toLocaleDateString("vi-VN")
                    : "Không giới hạn"}
                </td>
                <td className="p-4 space-x-3">
                  <button
                    onClick={() => handleEdit(coupon)}
                    className="text-blue-400 hover:underline font-medium"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(coupon._id)}
                    className="text-red-400 hover:underline font-medium"
                  >
                    Xoá
                  </button>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-400">
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
