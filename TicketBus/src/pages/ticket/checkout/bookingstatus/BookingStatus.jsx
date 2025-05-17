/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowRightLong } from "react-icons/fa6";
import { QRCodeCanvas } from "qrcode.react";
import axios from "axios";

// Mock background image (replace with actual URL in production)
const bgBooking = "https://example.com/bgBooking.jpg";

// Shared hook for BookingStatus logic
const useBookingStatus = ({
  tripInfo,
  selectedSeats,
  vehicleId,
  seatData,
  passengerInfo,
  ticketId,
}) => {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentId, setPaymentId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [vehicle, setVehicle] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [discountInfo, setDiscountInfo] = useState(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const navigate = useNavigate();

  const totalPrice =
    selectedSeats?.reduce((total, seatId) => {
      const seat = seatData?.find((seat) => seat.id === seatId);
      return total + (seat ? seat.price : 0);
    }, 0) || 0;

  const finalAmount = discountInfo?.finalAmount != null ? discountInfo.finalAmount : totalPrice;

  const formatTime = (dateString) => {
    if (!dateString) return "Unknown Time";
    const date = new Date(dateString);
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} - ${hours}:${minutes}`;
  };

  const handlePayment = async () => {
    setError(null);
    setIsLoading(true);

    if (!ticketId) {
      setError("Ticket ID is missing. Please book seats first.");
      setIsLoading(false);
      return;
    }

    if (!paymentMethod) {
      setError("Please select a payment method.");
      setIsLoading(false);
      return;
    }

    if (
      !passengerInfo?.fullName ||
      !passengerInfo?.email ||
      !passengerInfo?.phone ||
      !passengerInfo?.address
    ) {
      setError("Vui lòng điền đầy đủ thông tin trước khi thanh toán.");
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found. Please log in.");
      }

      const tripId = tripInfo?.tripId;
      const companyId = tripInfo?.companyId;

      if (!tripId || !companyId) {
        throw new Error("Trip ID or Company ID is missing in trip information.");
      }

      const updateTicketData = {
        email: passengerInfo.email,
        phone: passengerInfo.phone,
        fullName: passengerInfo.fullName,
        address: passengerInfo.address,
        status: "Booked",
      };

      await axios.put(
        `${import.meta.env.VITE_API_URL}/tickets/${ticketId}`,
        updateTicketData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const paymentData = {
        ticketId,
        tripId,
        companyId,
        amount: finalAmount,
        paymentMethod,
        paymentStatus: "pending",
      };

      const paymentResponse = await axios.post(
        `${import.meta.env.VITE_API_URL}/payments`,
        paymentData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const paymentResult = paymentResponse.data;
      setPaymentId(paymentResult.paymentId);

      if (paymentMethod === "vn_pay") {
        const updateTicketPayload = { ...updateTicketData, status: "Booked" };
        await axios.put(
          `${import.meta.env.VITE_API_URL}/tickets/${ticketId}`,
          updateTicketPayload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (paymentResult.paymentUrl) {
          window.location.href = paymentResult.paymentUrl;
        } else {
          throw new Error("Payment URL not provided by the server.");
        }
      } else if (paymentMethod === "cash") {
        const updateTicketPayload = { ...updateTicketData, status: "Paid" };
        await axios.put(
          `${import.meta.env.VITE_API_URL}/tickets/${ticketId}`,
          updateTicketPayload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        await axios.put(
          `${import.meta.env.VITE_API_URL}/payments/${ticketId}`,
          { paymentStatus: "completed" },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const qrData = JSON.stringify({
          ticketId,
          status: "Paid",
          fullName: passengerInfo.fullName,
          departurePoint: tripInfo.departurePoint,
          destinationPoint: tripInfo.destinationPoint,
          departureTime: tripInfo.departureTime,
          seats: selectedSeats,
          lisencePlate: vehicle?.lisencePlate || "Unknown",
        });

        setQrCodeData(qrData);
        setSuccess(true);
        setError(null);

        setTimeout(() => {
          navigate("/bus-tickets/payment", {
            state: {
              ticketId,
              tripInfo,
              selectedSeats,
              totalPrice,
              passengerInfo,
              vehicleId,
              lisencePlate: vehicle?.lisencePlate,
              qrCodeData: qrData,
              finalAmount,
            },
          });
          setIsRedirecting(false);
        }, 3000);
      }
    } catch (error) {
      console.error("Error during payment or ticket update:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An error occurred. Please try again.";
      if (error.response?.status === 404) {
        setError("Ticket not found. Please ensure the ticket ID is correct.");
      } else if (error.response?.status === 400) {
        setError(errorMessage);
      } else if (error.response?.status === 401) {
        setError("Unauthorized. Please log in again.");
      } else {
        setError(errorMessage);
      }
      setSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadQRCode = () => {
    const qrCanvas = document.getElementById("ticket-qr-code");
    if (qrCanvas instanceof HTMLCanvasElement) {
      const qrImage = qrCanvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = qrImage;
      link.download = `ticket_${ticketId}.png`;
      link.click();
    } else {
      console.error("QR code canvas not found or not a canvas element");
    }
  };

  const handleCancel = async () => {
    setError(null);
    setIsLoading(true);

    const confirmCancel = window.confirm(
      "Bạn có chắc chắn muốn hủy đặt phòng của mình không? Hành động này không thể hoàn tác."
    );
    if (!confirmCancel) {
      setIsLoading(false);
      return;
    }

    if (!ticketId) {
      setError("Ticket ID is missing. Please book seats first.");
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found. Please log in.");
      }

      await axios.put(
        `${import.meta.env.VITE_API_URL}/tickets/${ticketId}`,
        { status: "Cancelled" },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPaymentId(null);
      navigate(`/bus-tickets/detail/${vehicleId}`, {
        state: { message: "Booking cancelled successfully." },
      });
    } catch (error) {
      console.error("Error during cancellation:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An error occurred. Please try again.";
      if (error.response?.status === 404) {
        setError("Ticket not found. Please ensure the ticket ID is correct.");
      } else if (error.response?.status === 400) {
        setError(errorMessage);
      } else if (error.response?.status === 401) {
        setError("Unauthorized. Please log in again.");
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setError("Vui lòng nhập mã giảm giá.");
      return;
    }

    setIsApplyingCoupon(true);
    setError(null);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/coupons/apply`,
        {
          code: couponCode,
          amount: totalPrice,
        }
      );

      if (response.data.success === false) {
        setError("Mã giảm giá không tồn tại.");
        setDiscountInfo(null);
      } else {
        setDiscountInfo(response.data);
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
      setDiscountInfo(null);
      const errorMessage =
        error.response?.status === 404
          ? "Mã giảm giá không tồn tại hoặc đã hết hạn."
          : error.response?.data?.message || "Không thể áp mã. Vui lòng thử lại.";
      setError(errorMessage);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  useEffect(() => {
    const fetchVehicle = async () => {
      if (!vehicleId) {
        setFetchError("Vehicle ID is missing. Unable to fetch vehicle details.");
        return;
      }

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No token found. Please log in.");
        }

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/vehicle/${vehicleId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setVehicle(response.data);
      } catch (error) {
        console.error("Error fetching vehicle:", error);
        setFetchError(
          error.response?.data?.message || "Failed to fetch vehicle details."
        );
      }
    };

    fetchVehicle();
  }, [vehicleId]);

  const departureTime = tripInfo?.departureTime
    ? formatTime(tripInfo.departureTime)
    : "Unknown Time";
  const arrivalTime = tripInfo?.arrivalTime
    ? formatTime(tripInfo.arrivalTime)
    : "Unknown Time";

  return {
    error,
    success,
    paymentMethod,
    setPaymentMethod,
    isLoading,
    isRedirecting,
    qrCodeData,
    totalPrice,
    finalAmount,
    couponCode,
    setCouponCode,
    discountInfo,
    isApplyingCoupon,
    vehicle,
    departureTime,
    arrivalTime,
    handlePayment,
    downloadQRCode,
    handleCancel,
    handleApplyCoupon,
  };
};

// Desktop BookingStatusForm Component
const BookingStatusFormDesktop = ({
  selectedSeats,
  tripInfo,
  vehicle,
  departureTime,
  arrivalTime,
  couponCode,
  setCouponCode,
  isApplyingCoupon,
  handleApplyCoupon,
  discountInfo,
  totalPrice,
  finalAmount,
  paymentMethod,
  setPaymentMethod,
  handlePayment,
  handleCancel,
  isLoading,
  error,
  success,
  qrCodeData,
  downloadQRCode,
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h1 className="text-base text-neutral-700 font-medium uppercase dark:text-neutral-50">
          Thông tin đặt chỗ
        </h1>
        <div className="space-y-1.5 w-full">
          <div className="w-full flex items-center justify-between gap-x-5">
            <p className="text-sm text-neutral-400 font-normal dark:text-neutral-300">Điểm đi</p>
            <p className="text-sm text-neutral-400 font-normal dark:text-neutral-300">Điểm đến</p>
          </div>
          <div className="w-full flex items-center justify-between gap-x-4">
            <h1 className="text-sm text-neutral-800 font-normal dark:text-neutral-50 text-start">
              {tripInfo?.departurePoint || "Unknown Departure"}
            </h1>
            <div className="flex-1 border-dashed border border-neutral-300" />
            <h1 className="text-sm text-neutral-600 font-normal dark:text-neutral-50 text-end">
              {tripInfo?.destinationPoint || "Unknown Destination"}
            </h1>
          </div>
          <div className="w-full flex items-center justify-between mt-2">
            <p className="text-sm font-medium text-red-500">{departureTime}</p>
            <p className="text-sm font-medium text-red-500">{arrivalTime}</p>
          </div>
          <div className="flex justify-between text-sm text-neutral-600 dark:text-neutral-50">
            <span>Biển số xe:</span>
            <span>{vehicle?.lisencePlate || "Unknown Bus"}</span>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <h1 className="text-base text-neutral-700 font-medium dark:text-neutral-50">
          Chỗ đặt
        </h1>
        <div className="flex flex-wrap gap-3">
          {selectedSeats && selectedSeats.length > 0 ? (
            selectedSeats.map((seatId) => (
              <div
                key={seatId}
                className="w-9 h-9	bg-neutral-200/80 rounded-lg flex items-center justify-center text-base text-neutral-700 font-semibold"
              >
                {seatId}
              </div>
            ))
          ) : (
            <p className="text-sm text-neutral-500 dark:text-neutral-300">
              Không có chỗ đặt
            </p>
          )}
        </div>
      </div>
      <div className="space-y-3">
        <label className="text-base font-medium text-neutral-700 dark:text-neutral-50">
          Mã giảm giá
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            placeholder="Nhập mã..."
            className="flex-1 p-2 border rounded-md text-sm uppercase focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-transparent dark:focus:ring-slate-300"
          />
          <button
            onClick={handleApplyCoupon}
            disabled={isApplyingCoupon}
            className={`px-4 py-2 rounded-md text-sm text-white ${
              isApplyingCoupon ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {isApplyingCoupon ? "Đang áp dụng..." : "Áp dụng"}
          </button>
        </div>
        {discountInfo && (
          <div className="text-sm text-green-700 font-medium uppercase">
            Mã <strong>{discountInfo.code}</strong> đã được áp dụng: Giảm{" "}
            <strong>
              {discountInfo.discount != null
                ? `${discountInfo.discount.toLocaleString()} VND`
                : "Không xác định"}
            </strong>
          </div>
        )}
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-x-6">
          <div className="flex gap-y-0.5 flex-col">
            <h1 className="text-base text-neutral-800 font-bold dark:text-neutral-50">
              Tổng tiền:
            </h1>
            <span className="text-sm text-neutral-500 font-normal dark:text-neutral-300">
              (Bao gồm VAT)
            </span>
          </div>
          <div className="text-right space-y-1">
            {discountInfo && (
              <p className="text-sm text-neutral-500 line-through">
                {totalPrice.toLocaleString()} VND
              </p>
            )}
            <p className="text-base text-neutral-700 font-semibold dark:text-neutral-50">
              {finalAmount.toLocaleString()} VND
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          Thanh toán thành công! Vé của bạn đã được cập nhật.
          {qrCodeData && (
            <div className="flex flex-col items-center space-y-3 mt-3">
              <h3 className="text-sm font-medium">Mã QR vé xe của bạn</h3>
              <QRCodeCanvas id="ticket-qr-code" value={qrCodeData} size={150} />
              <button
                onClick={downloadQRCode}
                className="bg-blue-500 hover:bg-blue-600 text-white font-normal py-2 px-5 rounded-lg transition"
              >
                Tải mã QR
              </button>
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-base text-neutral-700 font-medium uppercase dark:text-neutral-50">
          Phương thức thanh toán
        </h2>
        <div className="flex gap-x-4">
          {[
            {
              value: "cash",
              label: "Thanh toán tiền mặt",
              badge: "Cash",
              badgeColor: "bg-blue-500 text-white dark:text-neutral-50",
            },
            {
              value: "vn_pay",
              label: "Ví điện tử VNPay",
              badge: "VNPay",
              badgeColor: "bg-blue-100 text-blue-800",
            },
          ].map((method) => (
            <label
              key={method.value}
              className={`flex items-center gap-x-2 p-2 border rounded-lg cursor-pointer transition w-full max-w-xs ${
                paymentMethod === method.value
                  ? "bg-blue-300 dark:bg-blue-500/50 border-blue-700 text-white"
                  : "hover:bg-blue-500/10"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method.value}
                checked={paymentMethod === method.value}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-4 h-4"
              />
              <div
                className={`h-6 w-20 ${method.badgeColor} flex items-center justify-center rounded text-sm`}
              >
                {method.badge}
              </div>
              <span className="text-sm text-neutral-600 uppercase dark:text-neutral-50">
                {method.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={handlePayment}
          disabled={isLoading}
          className={`w-full ${
            isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
          } text-white py-3 rounded-lg transition duration-300 flex items-center justify-center uppercase gap-x-2 dark:bg-slate-500`}
        >
          {isLoading ? "Processing..." : "THANH TOÁN"}
          <FaArrowRightLong />
        </button>
        <button
          onClick={handleCancel}
          disabled={isLoading}
          className={`w-full ${
            isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"
          } text-white py-3 rounded-lg transition duration-300 uppercase dark:bg-red-600`}
        >
          {isLoading ? "Processing..." : "HỦY ĐẶT CHỖ"}
        </button>
      </div>
    </div>
  );
};

// Mobile BookingStatusForm Component
const BookingStatusFormMobile = ({
  selectedSeats,
  tripInfo,
  vehicle,
  departureTime,
  arrivalTime,
  couponCode,
  setCouponCode,
  isApplyingCoupon,
  handleApplyCoupon,
  discountInfo,
  totalPrice,
  finalAmount,
  paymentMethod,
  setPaymentMethod,
  handlePayment,
  handleCancel,
  isLoading,
  error,
  success,
  qrCodeData,
  downloadQRCode,
}) => {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <h1 className="text-sm text-neutral-700 font-medium uppercase dark:text-neutral-50">
          Thông tin đặt chỗ
        </h1>
        <div className="space-y-1 w-full">
        <div className="space-y-1 w-full">
            {/* Điểm đi / Điểm đến */}
            <div className="w-full flex items-center justify-between gap-x-3">
              <p className="text-xs text-neutral-400 font-normal dark:text-neutral-300">Điểm đi</p>
              <p className="text-xs text-neutral-400 font-normal dark:text-neutral-300">Điểm đến</p>
            </div>
            <div className="w-full flex items-center justify-between gap-x-2">
              <h1 className="text-xs text-neutral-800 font-normal dark:text-neutral-50 text-start">
                {tripInfo?.departurePoint || 'Unknown Departure'}
              </h1>
              <div className="flex-1 border-dashed border border-neutral-300" />
              <h1 className="text-xs text-neutral-600 font-normal dark:text-neutral-50 text-end">
                {tripInfo?.destinationPoint || 'Unknown Destination'}
              </h1>
            </div>

            {/* Giờ đi / Giờ đến */}
            <div className="w-full flex items-center justify-between mt-1">
              <p className="text-xs font-medium text-red-500">{departureTime}</p>
              <p className="text-xs font-medium text-red-500">{arrivalTime}</p>
            </div>
          </div>

          <div className="flex justify-between text-xs text-neutral-600 dark:text-neutral-50">
            <span>Biển số xe:</span>
            <span>{vehicle?.lisencePlate || "Unknown Bus"}</span>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <h1 className="text-sm text-neutral-700 font-medium dark:text-neutral-50">
          Chỗ đặt
        </h1>
        <div className="flex flex-wrap gap-2">
          {selectedSeats && selectedSeats.length > 0 ? (
            selectedSeats.map((seatId) => (
              <div
                key={seatId}
                className="w-8 h-8 bg-neutral-200/80 rounded-lg flex items-center justify-center text-sm text-neutral-700 font-semibold"
              >
                {seatId}
              </div>
            ))
          ) : (
            <p className="text-xs text-neutral-500 dark:text-neutral-300">
              Không có chỗ đặt
            </p>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-50">
          Mã giảm giá
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            placeholder="Nhập mã..."
            className="flex-1 p-2 border rounded-md text-xs uppercase focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-transparent dark:focus:ring-slate-300"
          />
          <button
            onClick={handleApplyCoupon}
            disabled={isApplyingCoupon}
            className={`px-2 py-2 rounded-md text-xs text-white ${
              isApplyingCoupon ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {isApplyingCoupon ? "Đang áp dụng..." : "Áp dụng"}
          </button>
        </div>
        {discountInfo && (
          <div className="text-xs text-green-700 font-medium uppercase">
            Mã <strong>{discountInfo.code}</strong> đã được áp dụng: Giảm{" "}
            <strong>
              {discountInfo.discount != null
                ? `${discountInfo.discount.toLocaleString()} VND`
                : "Không xác định"}
            </strong>
          </div>
        )}
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-x-4">
          <div className="flex gap-y-0.5 flex-col">
            <h1 className="text-sm text-neutral-800 font-bold dark:text-neutral-50">
              Tổng tiền:
            </h1>
            <span className="text-xs text-neutral-500 font-normal dark:text-neutral-300">
              (Bao gồm VAT)
            </span>
          </div>
          <div className="text-right space-y-1">
            {discountInfo && (
              <p className="text-xs text-neutral-500 line-through">
                {totalPrice.toLocaleString()} VND
              </p>
            )}
            <p className="text-sm text-neutral-700 font-semibold dark:text-neutral-50">
              {finalAmount.toLocaleString()} VND
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          Thanh toán thành công! Vé của bạn đã được cập nhật.
          {qrCodeData && (
            <div className="flex flex-col items-center space-y-2 mt-2">
              <h3 className="text-xs font-medium">Mã QR vé xe của bạn</h3>
              <QRCodeCanvas id="ticket-qr-code" value={qrCodeData} size={100} />
              <button
                onClick={downloadQRCode}
                className="bg-blue-500 hover:bg-blue-600 text-white font-normal py-2 px-4 rounded-lg transition"
              >
                Tải mã QR
              </button>
            </div>
          )}
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-sm text-neutral-700 font-medium uppercase dark:text-neutral-50">
          Phương thức thanh toán
        </h2>
        <div className="flex flex-col gap-y-3">
          {[
            {
              value: "cash",
              label: "Thanh toán tiền mặt",
              badge: "Cash",
              badgeColor: "bg-blue-500 text-white dark:text-neutral-50",
            },
            {
              value: "vn_pay",
              label: "Ví điện tử VNPay",
              badge: "VNPay",
              badgeColor: "bg-blue-100 text-blue-800",
            },
          ].map((method) => (
            <label
              key={method.value}
              className={`flex items-center gap-x-2 p-2 border rounded-lg cursor-pointer transition w-full ${
                paymentMethod === method.value
                  ? "bg-blue-300 dark:bg-blue-500/50 border-blue-700 text-white"
                  : "hover:bg-blue-500/10 hover:text-neutral-50"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method.value}
                checked={paymentMethod === method.value}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-4 h-4"
              />
              <div
                className={`h-6 w-20 ${method.badgeColor} flex items-center justify-center rounded text-xs`}
              >
                {method.badge}
              </div>
              <span className="text-xs text-neutral-600 uppercase dark:text-neutral-50">
                {method.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={handlePayment}
          disabled={isLoading}
          className={`w-full ${
            isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
          } text-white py-2 rounded-lg transition duration-300 flex items-center justify-center uppercase gap-x-2 dark:bg-slate-500`}
        >
          {isLoading ? "Processing..." : "THANH TOÁN"}
          <FaArrowRightLong />
        </button>
        <button
          onClick={handleCancel}
          disabled={isLoading}
          className={`w-full ${
            isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"
          } text-white py-2 rounded-lg transition duration-300 uppercase dark:bg-red-600`}
        >
          {isLoading ? "Processing..." : "HỦY ĐẶT CHỖ"}
        </button>
      </div>
    </div>
  );
};

// Main BookingStatus Component
const BookingStatus = ({
  tripInfo,
  selectedSeats,
  vehicleId,
  seatData,
  passengerInfo,
  ticketId,
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const {
    error,
    success,
    paymentMethod,
    setPaymentMethod,
    isLoading,
    isRedirecting,
    qrCodeData,
    totalPrice,
    finalAmount,
    couponCode,
    setCouponCode,
    discountInfo,
    isApplyingCoupon,
    vehicle,
    departureTime,
    arrivalTime,
    handlePayment,
    downloadQRCode,
    handleCancel,
    handleApplyCoupon,
  } = useBookingStatus({
    tripInfo,
    selectedSeats,
    vehicleId,
    seatData,
    passengerInfo,
    ticketId,
  });

  // Desktop Layout
  const DesktopBookingStatus = (
    <div
      className="hidden sm:flex items-center justify-center min-h-screen dark:bg-transparen"
      style={{ backgroundImage: `url(${bgBooking})`, backgroundSize: 'cover' }}
    >
      <div className="bg-white dark:bg-gray-800 p-10 rounded-2xl dark:shadow-xl dark:shadow-slate-200 w-full  border border-gray-300">
        <h2 className="text-blue-500 text-3xl font-semibold text-center mb-6 uppercase dark:text-neutral-50">
          Trạng thái vé
        </h2>
        <BookingStatusFormDesktop
          selectedSeats={selectedSeats}
          tripInfo={tripInfo}
          vehicle={vehicle}
          departureTime={departureTime}
          arrivalTime={arrivalTime}
          couponCode={couponCode}
          setCouponCode={setCouponCode}
          isApplyingCoupon={isApplyingCoupon}
          handleApplyCoupon={handleApplyCoupon}
          discountInfo={discountInfo}
          totalPrice={totalPrice}
          finalAmount={finalAmount}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          handlePayment={handlePayment}
          handleCancel={handleCancel}
          isLoading={isLoading}
          error={error}
          success={success}
          qrCodeData={qrCodeData}
          downloadQRCode={downloadQRCode}
        />
      </div>
    </div>
  );

  // Mobile Layout
  const MobileBookingStatus = (
    <div className="sm:hidden flex items-center justify-center  p-6 ">
      <div className="w-full max-w-md">
        <h2 className="text-blue-500 text-2xl font-semibold text-center mb-3 uppercase dark:text-neutral-50">
          Trạng thái vé
        </h2>
        <BookingStatusFormMobile
          selectedSeats={selectedSeats}
          tripInfo={tripInfo}
          vehicle={vehicle}
          departureTime={departureTime}
          arrivalTime={arrivalTime}
          couponCode={couponCode}
          setCouponCode={setCouponCode}
          isApplyingCoupon={isApplyingCoupon}
          handleApplyCoupon={handleApplyCoupon}
          discountInfo={discountInfo}
          totalPrice={totalPrice}
          finalAmount={finalAmount}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          handlePayment={handlePayment}
          handleCancel={handleCancel}
          isLoading={isLoading}
          error={error}
          success={success}
          qrCodeData={qrCodeData}
          downloadQRCode={downloadQRCode}
        />
      </div>
    </div>
  );

  return isMobile ? MobileBookingStatus : DesktopBookingStatus;
};

export default BookingStatus;