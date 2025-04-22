/* eslint-disable no-unused-vars */
import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowRightLong } from "react-icons/fa6";
import { QRCodeCanvas } from "qrcode.react";

const BookingStatus = ({
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
  const navigate = useNavigate();
  const [vehicle, setVehicleId] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);
  const totalPrice =
    selectedSeats?.reduce((total, seatId) => {
      const seat = seatData?.find((seat) => seat.id === seatId);
      return total + (seat ? seat.price : 0);
    }, 0) || 0;
  const [couponCode, setCouponCode] = useState("");
  const [discountInfo, setDiscountInfo] = useState(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const finalAmount = discountInfo?.finalAmount != null ? discountInfo.finalAmount : totalPrice;
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const handlePayment = async () => {
    setError(null);
    setIsLoading(true);

    // Validate inputs
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
      !passengerInfo.fullName ||
      !passengerInfo.email ||
      !passengerInfo.phone ||
      !passengerInfo.address
    ) {
      setError("Vui Lòng! Điền đầy đủ thông tin trước khi thanh toán");
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
        throw new Error(
          "Trip ID or Company ID is missing in trip information."
        );
      }

      const updateTicketData = {
        email: passengerInfo.email,
        phone: passengerInfo.phone,
        fullName: passengerInfo.fullName,
        address: passengerInfo.address,
        status: "Booked",
      };
      await axios.put(
        `http://localhost:3001/tickets/${ticketId}`,
        updateTicketData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const paymentData = {
        ticketId: ticketId,
        tripId: tripId,
        companyId: companyId,
        amount: finalAmount,
        paymentMethod: paymentMethod,
        paymentStatus: "pending",
      };
      const paymentResponse = await fetch("http://localhost:3001/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(paymentData),
      });

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json();
        throw new Error(errorData.message || "Failed to create payment");
      }

      const paymentResult = await paymentResponse.json();
      setPaymentId(paymentResult.paymentId);
      if (paymentMethod === "vn_pay") {
        const updateTicketPayload = {
          ...updateTicketData,
          status: "Booked",
        };

        await axios.put(
          `http://localhost:3001/tickets/${ticketId}`,
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
        const updateTicketPayload = {
          ...updateTicketData,
          status: "Paid",
        };
        const updateTicketStatusResponse = await axios.put(
          `http://localhost:3001/tickets/${ticketId}`,
          updateTicketPayload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const updatePaymentResponse = await axios.put(
          `http://localhost:3001/payments/${ticketId}`,
          { paymentStatus: "completed" },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const qrData = JSON.stringify({
          ticketId: ticketId,
          status: "Paid",
          fullName: passengerInfo.fullName,
          departurePoint: tripInfo.departurePoint,
          destinationPoint: tripInfo.destinationPoint,
          departureTime: tripInfo.departureTime,
          seats: selectedSeats,
          lisencePlate: vehicle?.lisencePlate || "Unknown",
        });
        setQrCodeData(qrData);
        // Set success and navigate to confirmation page
        setSuccess(true);
        setError(null);

        setTimeout(() => {
          navigate("/bus-tickets/payment", {
            state: {
              ticketId: ticketId,
              tripInfo: tripInfo,
              selectedSeats: selectedSeats,
              totalPrice: totalPrice,
              passengerInfo: passengerInfo,
              vehicleId: vehicleId,
              lisencePlate: vehicle?.lisencePlate,
              qrCodeData: qrData,
              finalAmount: finalAmount,
            },
          });
          setIsRedirecting(false); // Reset redirecting state after navigation
        }, 3000);
      }
    } catch (error) {
      console.error("Error during payment or ticket update:", error);
      if (error.response) {
        if (error.response.status === 404) {
          setError("Ticket not found. Please ensure the ticket ID is correct.");
        } else if (error.response.status === 400) {
          setError(
            error.response.data.message ||
              "Failed to process payment. Please try again."
          );
        } else if (error.response.status === 401) {
          setError("Unauthorized. Please log in again.");
        } else {
          setError(
            error.response.data.message ||
              "An error occurred. Please try again."
          );
        }
      } else {
        setError(error.message || "An error occurred. Please try again.");
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

      // Update the ticket status to "Cancelled"
      const updateTicketResponse = await axios.put(
        `http://localhost:3001/tickets/${ticketId}`,
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
      console.error(
        "Error during cancellation:",
        error.response?.data || error
      );
      if (error.response) {
        if (error.response.status === 404) {
          setError("Ticket not found. Please ensure the ticket ID is correct.");
        } else if (error.response.status === 400) {
          setError(
            error.response.data.message ||
              "Failed to cancel booking. Please try again."
          );
        } else if (error.response.status === 401) {
          setError("Unauthorized. Please log in again.");
        } else {
          setError(
            error(
              error.response.data.message ||
                "An error occurred. Please try again."
            )
          );
        }
      } else {
        setError(error.message || "An error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    const fetchVehicleId = async () => {
      if (!vehicleId) {
        setFetchError(
          "VehicleId ID is missing. Unable to fetch VehicleId details."
        );
        return;
      }

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No token found. Please log in.");
        }

        const response = await axios.get(
          `http://localhost:3001/vehicle/${vehicleId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setVehicleId(response.data);
      } catch (error) {
        console.error("Error fetching VehicleId:", error);
        setFetchError(
          error.response?.data?.message || "Failed to fetch VehicleId details."
        );
      }
    };

    fetchVehicleId();
  }, [vehicleId]);
  const departureTime = tripInfo?.departureTime
    ? formatTime(tripInfo.departureTime)
    : "Unknown Time";
  const arrivalTime = tripInfo?.arrivalTime
    ? formatTime(tripInfo.arrivalTime)
    : "Unknown Time";
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setError("Vui lòng nhập mã giảm giá");
      return;
    }

    setIsApplyingCoupon(true);
    setError(null);

    try {
      const response = await axios.post("http://localhost:3001/coupons/apply", {
        code: couponCode,
        amount: totalPrice,
      });
      const { success } = response.data;
      if (success === false) {
        setError("Mã giảm giá không tồn tại ");
      }
      setDiscountInfo(response.data);
    } catch (err) {
      console.error("Error applying coupon:", err);
      setDiscountInfo(null);
      if (err.response?.status === 404) {
        setError("Mã giảm giá không tồn tại hoặc đã hết hạn.");
      } else {
        setError(
          err.response?.data?.message || "Không thể áp mã. Vui lòng thử lại."
        );
      }
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  return (
    <div className="w-full col-span-3 sticky top-20 space-y-7 ">
      <div className="w-full bg-neutral-50 rounded-xl py-4 px-6 border border-neutral-200 shadow-sm space-y-5 dark:bg-transparent">
        <h1 className="text-lg text-neutral-700 font-bold text-center border-b border-neutral-200 pb-4 uppercase  dark:text-neutral-50">
          Trạng thái vé
        </h1>
        <div className="space-y-5">
          <div className="space-y-2 w-full">
            <h1 className="text-base text-neutral-700 font-medium uppercase  dark:text-neutral-50">
              Thông tin đặt chỗ
            </h1>
            <div className="space-y-0.5 w-full">
              <div className="w-full flex items-center justify-between gap-x-5">
                <p className="text-sm text-neutral-400 font-normal dark:text-neutral-300">
                  Điểm đi
                </p>
                <p className="text-sm text-neutral-400 font-normal dark:text-neutral-300">
                  Điểm đến
                </p>
              </div>
              <div className="w-full flex items-center justify-between gap-x-4">
                <h1 className="text-sm text-neutral-600 font-normal  dark:text-neutral-50">
                  {tripInfo?.departurePoint || "Unknown Departure"}{" "}
                  <span className="font-medium text-red-500">
                    {departureTime}
                  </span>
                </h1>
                <div className="flex-1 border-dashed border border-neutral-300" />
                <h1 className="text-sm text-neutral-600 font-normal  dark:text-neutral-50">
                  {tripInfo?.destinationPoint || "Unknown Destination"}{" "}
                  <span className="font-medium text-red-500">
                    {arrivalTime}
                  </span>
                </h1>
              </div>
              <div className="w-full flex items-center justify-between gap-x-4 !mt-1.5">
                <h1 className="text-sm text-neutral-600 font-normal  dark:text-neutral-50">
                  Biển số xe:
                </h1>
                <h1 className="text-sm text-neutral-600 font-normal  dark:text-neutral-50">
                  {vehicle?.lisencePlate || "Unknown Bus"}
                </h1>
              </div>
            </div>
          </div>
          <div className="space-y-2 w-full">
            <h1 className="text-base text-neutral-700 font-medium  dark:text-neutral-50">
              Chỗ đặt
            </h1>
            <div className="w-full flex items-center gap-x-3 ">
              {selectedSeats && selectedSeats.length > 0 ? (
                selectedSeats.map((seatId) => (
                  <div
                    key={seatId}
                    className="w-9 h-9 bg-neutral-200/80 rounded-lg flex items-center justify-center text-base text-neutral-700 font-semibold"
                  >
                    {seatId}
                  </div>
                ))
              ) : (
                <p className="text-sm text-neutral-500 font-normal  dark:text-neutral-300">
                  Không có chỗ đặt
                </p>
              )}
            </div>
          </div>
          <div className="space-y-2 w-full">
            <label className="text-base font-medium text-neutral-700 dark:text-neutral-50">
              Mã giảm giá
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Nhập mã..."
                className="flex-1 p-2 border rounded-md text-sm"
              />
              <button
                onClick={handleApplyCoupon}
                disabled={isApplyingCoupon}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm"
              >
                {isApplyingCoupon ? "Đang áp dụng..." : "Áp dụng"}
              </button>
            </div>
            {discountInfo && (
              <div className="text-sm text-green-700 font-medium">
                Mã <strong>{discountInfo.code}</strong> đã được áp dụng: Giảm{" "}
                <strong>
                  {discountInfo.discount != null
                    ? `${discountInfo.discount.toLocaleString()} VND`
                    : "Không xác định"}
                </strong>
              </div>
            )}
          </div>

          <div className="space-y-2 w-full">
            <div className="flex items-center justify-between gap-x-4">
              <div className="flex gap-y-0.5 flex-col">
                <h1 className="text-base text-neutral-800 font-bold  dark:text-neutral-50">
                  Tổng tiền:
                </h1>
                <span className="text-xs text-neutral-500 font-normal dark:text-neutral-300">
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
            <div className="flex flex-col items-center space-y-2">
              <h3 className="text-sm font-medium">Mã QR vé xe của bạn</h3>
              <QRCodeCanvas id="ticket-qr-code" value={qrCodeData} size={128} />
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

      <div className="space-y-4">
        <h2 className="text-base text-neutral-700 font-medium uppercase  dark:text-neutral-50">
          Phương thức thanh toán
        </h2>
        <div className="flex gap-x-4 ">
          {[
            {
              value: "cash",
              label: "Thanh toán  tiền mặt",
              badge: "Cash",
              badgeColor: "bg-blue-500 text-white  dark:text-neutral-50 ",
            },
            {
              value: "vn_pay",
              label: "  ví điện tử VNPay",
              badge: "VNPay",
              badgeColor: "bg-blue-100 text-blue-800",
            },
          ].map((method) => (
            <label
              key={method.value}
              className={`flex items-center gap-x-2 p-2 border rounded-lg cursor-pointer transition w-full max-w-xs ${
                paymentMethod === method.value
                  ? "bg-primaryblue dark:bg-primary/50 border-blue-700 text-neutral-800"
                  : "hover:bg-primaryblue/50"
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
                className={`h-6 w-20 ${method.badgeColor} flex items-center justify-center rounded text-sm `}
              >
                {method.badge}
              </div>
              <span className="text-sm text-neutral-600 uppercase  dark:text-neutral-50 ">
                {method.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="w-full px-1.5 flex gap-4">
        <button
          onClick={handlePayment}
          disabled={isLoading}
          className={`w-full bg-primary hover:bg-primary/90 text-neutral-50 font-normal py-2.5 flex items-center justify-center uppercase rounded-lg transition gap-x-2 ${
            isLoading || isRedirecting ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? "Processing..." : "THANH TOÁN"}
          <FaArrowRightLong />
        </button>
        <button
          onClick={handleCancel}
          disabled={isLoading}
          className={`w-full bg-red-500 hover:bg-red-600 text-neutral-50 font-normal py-2.5 flex items-center justify-center uppercase rounded-lg transition ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? "Processing..." : "HỦY ĐẶT CHỖ"}
        </button>
      </div>
    </div>
  );
};

export default BookingStatus;
