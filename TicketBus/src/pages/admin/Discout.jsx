import React, { useState, useEffect } from "react";
import axios from "axios";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { BsCalendar2Date } from "react-icons/bs";
import gif from "../../assets/gif.png";

const Discount = () => {
  const [coupons, setCoupons] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
      setIsModalOpen(false);
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
    setIsModalOpen(true);
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

  const gradientColors = [
    "from-emerald-500 to-teal-500",
    "from-sky-500 to-blue-500",
    "from-amber-500 to-yellow-500",
    "from-teal-500 to-emerald-500",
    "from-sky-400 to-sky-500",
    "from-amber-400 to-amber-500",
  ];

  const getRandomGradient = (index) => {
    return gradientColors[index % gradientColors.length];
  };

  return (
    <div className="w-full text-neutral-950">
        <h2 className="text-3xl font-bold uppercase mb-6">Quản lý mã giảm giá</h2>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-teal-800 rounded-lg p-6 w-full max-w-md shadow-neutral-200 shadow-lg">
            <h3 className="text-2xl font-semibold text-white mb-4 text-center uppercase">
              {editingId ? "Cập nhật mã giảm giá" : "Tạo mã giảm giá"}
            </h3>
            <form
              onSubmit={handleSubmit}
              className=" rounded-2xl p-6 mb-10 space-y-6"
            >
          <div className="grid grid-cols-1 gap-6">
  <div>
    <label className="text-sm text-gray-200 mb-1 block">Mã code</label>
    <input
      name="code"
      placeholder="VD: SUMMER2024"
      value={form.code}
      onChange={handleChange}
      className="w-full bg-transparent text-white border border-gray-400 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary uppercase"
      required
    />
  </div>

  <div>
    <label className="text-sm text-gray-200 mb-1 block">Loại giảm giá</label>
    <select
      name="discountType"
      value={form.discountType}
      onChange={handleChange}
      className="w-full bg-transparent text-white border border-gray-400 rounded-lg px-4 py-2"
    >
      <option value="percentage" className="text-neutral-950">Giảm theo %</option>
      <option value="fixed" className="text-neutral-950">Giảm số tiền</option>
    </select>
  </div>

  <div>
    <label className="text-sm text-gray-200 mb-1 block">Giá trị giảm</label>
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
      className="w-full bg-transparent text-white border border-gray-400 rounded-lg px-4 py-2"
      required
    />
  </div>

  <div>
    <label className="text-sm text-gray-200 mb-1 block">Ngày hết hạn</label>
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full h-12 justify-start bg-transparent border border-gray-400 text-white"
        >
          <BsCalendar2Date className="mr-2" />
          {form.expiresAt
            ? format(new Date(form.expiresAt), "dd 'tháng' MM 'năm' yyyy", {
                locale: vi,
              })
            : "Chọn ngày"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2 bg-white shadow-xl rounded-xl">
        <Calendar
          mode="single"
          selected={form.expiresAt ? new Date(form.expiresAt) : undefined}
          onSelect={(selectedDate) => {
            if (selectedDate) {
              const formattedDate =
                selectedDate.toISOString().split("T")[0];
              handleChange({
                target: { name: "expiresAt", value: formattedDate },
              });
            }
          }}
          disabled={(date) =>
            date < new Date(new Date().setHours(0, 0, 0, 0))
          }
        />
      </PopoverContent>
    </Popover>
  </div>

  <div>
    <label className="text-sm text-gray-200 mb-1 block">Mô tả</label>
    <input
      name="description"
      placeholder="VD: Áp dụng cho khách hàng mới"
      value={form.description}
      onChange={handleChange}
      className="w-full bg-transparent text-white border border-gray-400 rounded-lg px-4 py-2"
    />
  </div>
</div>

              <div className="flex justify-end items-center gap-4">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setIsModalOpen(false);
                  }}
                  className="text-red-400 hover:underline font-semibold"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-500 transition text-white px-6 py-2 rounded-lg font-semibold"
                >
                  {editingId ? "Cập nhật mã" : "Tạo mã"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Danh sách */}
      <div className="rounded-xl text-neutral-950">
      <div className="flex justify-between items-center mb-6">
          <div>
          <h2 className=" text-xl font-bold uppercase"></h2>
          </div>
         
          <button
          onClick={() => setIsModalOpen(true)}
          className="bg-green-600 hover:bg-green-500 transition text-white px-6 py-2 rounded-lg font-semibold"
        >
          Tạo mã giảm giá
        </button>
        </div>

        {coupons.length === 0 ? (
          <p className="text-gray-400 text-center py-10">Không có mã giảm giá nào.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {coupons.map((coupon, index) => (
              <div
                key={coupon._id}
                className={`relative rounded-2xl p-5 shadow-md text-white overflow-hidden bg-gradient-to-br ${getRandomGradient(index)} hover:scale-[1.02] transition-transform`}
              >
                <img
                  src={gif}
                  alt="Gift Icon"
                  className="absolute top-3 right-3 w-56 h-48 opacity-50"
                />

                <div className="mb-4">
                  <h3 className="text-4xl mt-8 font-extralight uppercase tracking-widest text-white/80">Gift Card</h3>
                  <h2 className="text-3xl font-extrabold mt-8">
                    {coupon.discountType === "percentage"
                      ? `${coupon.discountValue}% OFF`
                      : `${coupon.discountValue.toLocaleString()} VNĐ`}
                  </h2>
                </div>
                <p className="text-white/70 text-sm italic mb-4">
                  {coupon.description || "Áp dụng mã để nhận ưu đãi"}
                </p>

                <div className="flex gap-20 text-white/90 text-sm mb-2">
                  <div>ID: {coupon._id.slice(-6)}</div>
                  <div className="font-semibold text-sm">
                    Mã: <span className="underline font-bold">{coupon.code}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center border-t border-white/30 pt-3 mt-2">
                  <div className="text-sm text-white/80 mb-1">
                    Hết hạn:{" "}
                    {coupon.expiresAt
                      ? new Date(coupon.expiresAt).toLocaleDateString("vi-VN")
                      : "Không giới hạn"}
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleEdit(coupon)}
                      className="text-sm underline hover:text-white"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(coupon._id)}
                      className="text-sm text-red-50 font-semibold underline hover:text-red-300"
                    >
                      Xoá
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Discount;