/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { GiSteeringWheel } from 'react-icons/gi';
import { MdOutlineChair } from 'react-icons/md';
import { Link, useParams, useNavigate } from 'react-router-dom';
import ErrorMessage from '../../../../../components/alertmessage/errormsg/ErrorMessage';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const BusSeat = () => {
  const { vehicleId } = useParams(); // Lấy vehicleId từ URL
  const navigate = useNavigate();
  const [seatData, setSeatData] = useState([]); // Dữ liệu ghế động
  const [tripInfo, setTripInfo] = useState(null); // Thông tin chuyến (để hiển thị Your Destination)
  const [tripId, setTripId] = useState(''); // Store the tripId
  const [seatsLoading, setSeatsLoading] = useState(false);
  const [seatsError, setSeatsError] = useState(null);
  const [tripError, setTripError] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [username, setUsername] = useState('');

  const fetchUsername = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found. Please log in.");
      }

      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      if (decoded.exp < currentTime) {
        console.error("Token has expired");
        handleLogout();
        return;
      }
      const response = await axios.get(`http://localhost:3001/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const fetchedUsername = response.data.username;
      if (!fetchedUsername) {
        throw new Error("Username not found in user profile.");
      }

      setUsername(fetchedUsername);
    } catch (error) {
      console.error("Error fetching username:", error);
      if (error.response?.status === 401) {
        handleLogout();
      } else {
        setErrorMessage(error.message || "Failed to fetch username. Please try again.");
        setShowError(true);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
    window.location.reload();
  };

  const fetchSeats = async (vehicleId) => {
    setSeatsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:3001/seats?vehicleId=${vehicleId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.data || response.data.length === 0) {
        setSeatsError("Không tìm thấy ghế cho chuyến xe này.");
        setSeatData([]);
        return;
      }

      const seats = response.data.map((seat) => ({
        id: seat.seatNumber,
        status: seat.availabilityStatus.charAt(0).toUpperCase() + seat.availabilityStatus.slice(1).toLowerCase(),
        price: seat.price ,
      }));

      // Define the expected order of seat IDs
      const expectedOrder = [
        'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9',
        'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9',
        'A10',
        'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9',
        'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9',
      ];

      // Thêm các ghế không có trong expectedOrder vào danh sách
      const additionalSeats = seats.filter((seat) => !expectedOrder.includes(seat.id));
      const allSeatIds = [...expectedOrder, ...additionalSeats.map((seat) => seat.id)];

      const sortedSeats = allSeatIds.map((seatId) => {
        const seat = seats.find((s) => s.id === seatId);
        return seat || { id: seatId, status: 'Unavailable', price: 0 };
      });
      setSeatData(sortedSeats);
    } catch (error) {
      console.error("Error fetching seats:", error);
      if (error.response?.status === 401) {
        handleLogout();
      } else {
        setSeatsError(error.response?.data?.message || 'Failed to fetch seats. Please try again.');
        setSeatData([]);
      }
    } finally {
      setSeatsLoading(false);
    }
  };
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const departureTime = tripInfo?.departureTime ? formatTime(tripInfo.departureTime) : 'Unknown Time';
  const arrivalTime = tripInfo?.arrivalTime ? formatTime(tripInfo.arrivalTime) : 'Unknown Time';

  const fetchTripInfo = async (vehicleId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:3001/trip/all`, {
        params: { vehicleId, page: 1, limit: 10 },

        headers: { Authorization: `Bearer ${token}` },
      });
console.log(response.data)
      const trips = Array.isArray(response.data) ? response.data : response.data?.trips || [];

      // Lọc chuyến theo vehicleId
      const matchingTrip = trips.find((trip) => trip.vehicleId === vehicleId);

      if (matchingTrip) {
        setTripId(matchingTrip.tripId);
        setTripInfo({
          companyId: matchingTrip.companyId || null,
          tripId: matchingTrip.tripId,
          departurePoint: matchingTrip.departurePoint || 'Unknown Departure',
          destinationPoint: matchingTrip.destinationPoint || 'Unknown Destination',
          departureTime: matchingTrip.departureTime,
          arrivalTime: matchingTrip.arrivalTime,
        });
        return matchingTrip.tripId; // Trả về tripId để sử dụng trong fetchSeats
      } else {
        setTripError("No trip found for this vehicle.");
        setTripInfo({
          companyId: null,
          departurePoint: 'Unknown Departure',
          destinationPoint: 'Unknown Destination',
          departureTime: null,
          arrivalTime: null,
        });
        return null;
      }
    } catch (error) {
      console.error("Error fetching trip info:", error);
      if (error.response?.status === 401) handleLogout();
      else {
        setTripError(error.response?.data?.message || 'Failed to fetch trip info.');
        setTripInfo({
          companyId: null,
          departurePoint: 'Unknown Departure',
          destinationPoint: 'Unknown Destination',
          departureTime: null,
          arrivalTime: null,
        });
      }
      return null;
    }
  };

  useEffect(() => {
    if (vehicleId) {
      fetchUsername();
      fetchSeats(vehicleId);
      fetchTripInfo(vehicleId);
    }
  }, [vehicleId]);

  const holdSeats = async () => {
    if (!username) {
      setErrorMessage("Username not available. Please try again.");
      setShowError(true);
      throw new Error("Username not available");
    }

    if (!tripId) {
      setErrorMessage("Trip ID not available. Please try again.");
      setShowError(true);
      throw new Error("Trip ID not available");
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found. Please log in.");
      }

      const payload = {
        tripId: tripId,
        seatNumber: selectedSeats,
        username: username,
        vehicleId: vehicleId, // Include vehicleId in the payload
      };



      const response = await axios.post(
        'http://localhost:3001/tickets/hold-seat',
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );


      const ticketId = response.data.ticket.ticketId;
      setSeatData((prevSeatData) =>
        prevSeatData.map((seat) =>
          selectedSeats.includes(seat.id)
            ? { ...seat, status: 'Booked' }
            : seat
        )
      );

      // Navigate to checkout
      navigate('/bus-tickets/checkout', {
        state: {
          ticketId: ticketId,
          selectedSeats,
          tripId,
          tripInfo,
          username,
          vehicleId,
          seatData,
        },
      });
    } catch (error) {
      console.error("Error holding seats:", error);
      let errorMsg = error.response?.data?.message || "Failed to hold seats. Please try again.";
      if (error.response?.status === 401) {
        handleLogout();
        return;
      }
      setErrorMessage(errorMsg);
      setShowError(true);
      throw error;
    }
  };
  const handleProceedToCheckout = async () => {
    if (selectedSeats.length === 0) {
      setErrorMessage("Please select at least one seat to proceed.");
      setShowError(true);
      return;
    }

    try {
      await holdSeats();
    } catch (error) {
      // Error is already handled in holdSeats
    }
  };

  const handleSeatClick = (seatId) => {
    const seat = seatData.find((seat) => seat.id === seatId);
    // Không cho phép chọn ghế đã "Booked" hoặc "Selected"
    if (!seat || seat.status === 'Booked' || seat.status === 'Selected') return;

    setSelectedSeats((prevSelectedSeats) => {
      if (prevSelectedSeats.includes(seatId)) {
        return prevSelectedSeats.filter((seat) => seat !== seatId);
      } else {
        if (prevSelectedSeats.length >= 10) {
          setErrorMessage("Bạn không thể chọn nhiều hơn 10 chỗ ngồi.");
          setShowError(true);
          return prevSelectedSeats;
        } else {
          return [...prevSelectedSeats, seatId];
        }
      }
    });
  };

  useEffect(() => {
    if (showError) {
      const timer = setTimeout(() => {
        setShowError(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [showError]);

  const getSeatName = (seat) => {
    if (seat.status === 'Booked') {
      return 'text-yellow-500 cursor-not-allowed  dark:text-yellow-400'; // Ghế đã đặt
    }
    if (seat.status === 'Selected') {
      return 'text-red-600 cursor-not-allowed  dark:text-red-400'; // Ghế đã chọn (sau thanh toán)
    }
    if (selectedSeats.includes(seat.id)) {
      return 'text-emerald-600 cursor-pointer dark:text-emerald-300'; // Ghế đang được chọn tạm thời
    }
    return 'text-neutral-500 cursor-pointer dark:text-neutral-500'; // Ghế còn trống
  };

  if (seatsLoading) {
    return <div>Loading seats...</div>;
  }

  if (seatsError) {
    return <div>Error: {seatsError}</div>;
  }

  if (tripError) {
    console.warn("Trip info error:", tripError);
    // Không chặn giao diện nếu không lấy được trip info, chỉ hiển thị dữ liệu mặc định
  }

  return (
    <div className="w-full grid grid-cols-5 gap-10">
      {/* Seat Layout */}
      <div className="col-span-3 w-full flex items-center justify-center shadow-sm rounded-xl p-4">
        <div className="w-full space-y-7">
          <p className="text-base text-neutral-600 font-medium text-center dark:text-neutral-50">
            Bấm vào những chỗ ghế trống để đặt chỗ.
          </p>

          <div className="w-full flex items-stretch gap-x-1.5 justify-center">
            <div className="w-10 h-full flex items-center justify-center border-r-2 border-dashed border-neutral-300">
              <GiSteeringWheel className="text-3xl mt-7 text-primary -rotate-90  dark:text-neutral-50" />
            </div>

            <div className="flex flex-col items-center  dark:text-neutral-50">
              <div className="flex-1 space-y-5 ">
                {/* First row (A1, A3, ..., A17) */}
                <div className="w-full h-auto grid grid-cols-9 gap-x-5 justify-end ">
                  {seatData.slice(0, 9).map((seat) => (
                    <div
                      key={seat.id}
                      className="flex items-center gap-x-0  "
                      onClick={() => handleSeatClick(seat.id)}
                    >
                      <h6 className="text-base text-neutral-600 font-bold  dark:text-neutral-50">{seat.id}</h6>
                      <MdOutlineChair className={`text-3xl -rotate-90  dark:text-neutral-50 ${getSeatName(seat)}`} />
                    </div>
                  ))}
                </div>

                {/* Second row (A2, A4, ..., A18) */}
                <div className="w-full h-auto grid grid-cols-9 gap-x-5 justify-end">
                  {seatData.slice(9, 18).map((seat) => (
                    <div
                      key={seat.id}
                      className="flex items-center gap-x-0 "
                      onClick={() => handleSeatClick(seat.id)}
                    >
                      <h6 className="text-base text-neutral-600 font-bold  dark:text-neutral-50">{seat.id}</h6>
                      <MdOutlineChair className={`text-3xl -rotate-90  dark:text-neutral-50 ${getSeatName(seat)}`} />
                    </div>
                  ))}
                </div>

                {/* Third row (19) */}
                <div className="w-full h-auto grid grid-cols-10 gap-x-5 justify-end">
                  <div className="col-span-9"></div>
                  {seatData.slice(18, 19).map((seat) => (
                    <div
                      key={seat.id}
                      className="flex items-center gap-x-0"
                      onClick={() => handleSeatClick(seat.id)}
                    >
                      <h6 className="text-base text-neutral-600 font-bold  dark:text-neutral-50">{seat.id}</h6>
                      <MdOutlineChair className={`text-3xl -rotate-90  dark:text-neutral-50 ${getSeatName(seat)}`} />
                    </div>
                  ))}
                </div>

                {/* Fourth row (B1, B3, ..., B17) */}
                <div className="w-full h-auto grid grid-cols-9 gap-x-5 justify-end">
                  {seatData.slice(19, 28).map((seat) => (
                    <div
                      key={seat.id}
                      className="flex items-center gap-x-0"
                      onClick={() => handleSeatClick(seat.id)}
                    >
                      <h6 className="text-base text-neutral-600 font-bold  dark:text-neutral-50">{seat.id}</h6>
                      <MdOutlineChair className={`text-3xl -rotate-90  dark:text-neutral-50 ${getSeatName(seat)}`} />
                    </div>
                  ))}
                </div>

                {/* Fifth row (B2, B4, ..., B18) */}
                <div className="w-full h-auto grid grid-cols-9 gap-x-5 justify-end">
                  {seatData.slice(28, 37).map((seat) => (
                    <div
                      key={seat.id}
                      className="flex items-center gap-x-0"
                      onClick={() => handleSeatClick(seat.id)}
                    >
                      <h6 className="text-base text-neutral-600 font-bold  dark:text-neutral-50">{seat.id}</h6>
                      <MdOutlineChair className={`text-3xl -rotate-90  dark:text-neutral-50 ${getSeatName(seat)}`} />
                    </div>
                  ))}
                </div>

                {/* Additional seats (e.g., C2) */}
                {seatData.slice(37).length > 0 && (
                  <div className="w-full h-auto grid grid-cols-9 gap-x-5 justify-end">
                    {seatData.slice(37).map((seat) => (
                      <div
                        key={seat.id}
                        className="flex items-center gap-x-0"
                        onClick={() => handleSeatClick(seat.id)}
                      >
                        <h6 className="text-base text-neutral-600 font-bold  dark:text-neutral-50">{seat.id}</h6>
                        <MdOutlineChair className={`text-3xl -rotate-90  dark:text-neutral-50 ${getSeatName(seat)}`} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="w-full flex items-center justify-center gap-6 border-t border-neutral-200 pt-5">
            <div className="flex items-center gap-x-2">
              <MdOutlineChair className="text-3xl text-neutral-500 -rotate-90  dark:text-neutral-500" />
              <p className="text-sm text-neutral-500 font-medium  dark:text-neutral-50">Ghế trống</p>
            </div>
            <div className="flex items-center gap-x-2">
              <MdOutlineChair className="text-3xl text-yellow-500 -rotate-90  dark:text-yellow-400" />
              <p className="text-sm text-neutral-500 font-medium  dark:text-neutral-50">Đang đặt chỗ</p>
            </div>
            <div className="flex items-center gap-x-2">
              <MdOutlineChair className="text-3xl text-red-600 -rotate-90  dark:text-red-400" />
              <p className="text-sm text-neutral-500 font-medium  dark:text-neutral-50">Đã đặt</p>
            </div>
            <div className="flex items-center gap-x-2">
              <MdOutlineChair className="text-3xl text-emerald-600 dark:text-emerald-400 -rotate-90" />
              <p className="text-sm text-neutral-500 font-medium  dark:text-neutral-50">Chọn chỗ</p>
            </div>
          </div>
        </div>
      </div>

      <div className="col-span-2 w-full space-y-5 bg-neutral-50 rounded-xl py-4 px-6 border border-neutral-200 shadow-sm dark:bg-transparent">
        <div className="w-full space-y-2">
          <div className="w-full flex items-center justify-between">
            <h1 className="text-lg text-neutral-600 font-bold uppercase  dark:text-neutral-50">Thông tin đặt chỗ</h1>
            <Link to="/bus-tickets" className="text-sm text-primary font-bold underline uppercase  dark:text-neutral-50 ">
              Đổi chuyến
            </Link>
          </div>

          <div className="space-y-0.5 w-full">
            <div className="w-full flex items-center justify-between gap-x-5">
              <p className="text-sm text-neutral-400 font-normal  dark:text-neutral-300">Điểm đi</p>
              <p className="text-sm text-neutral-400 font-normal  dark:text-neutral-300">Điểm đến</p>
            </div>
            <div className="w-full flex items-center justify-between gap-x-4">
              <h1 className="text-sm text-neutral-800 font-normal  dark:text-neutral-50">
                {tripInfo?.departurePoint || 'Unknown Departure'}{' '}
                <span className="font-medium text-red-500">

                  {departureTime}

                  {/* ({tripInfo?.departureTime ? new Date(tripInfo.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Unknown Time'}) */}
                </span>
              </h1>
              <div className="flex-1 border-dashed border border-neutral-300 " />
              <h1 className="text-sm text-neutral-600 font-normal  dark:text-neutral-50">
                {tripInfo?.destinationPoint || 'Unknown Destination'}{' '}
                <span className="font-medium text-red-500">

                  {arrivalTime}

                  {/* ({tripInfo?.arrivalTime ? new Date(tripInfo.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Unknown Time'}) */}
                </span>
              </h1>
            </div>
          </div>
        </div>

        <div className="w-full space-y-2">
          <div className="w-full flex items-center justify-between">
            <h1 className="text-lg text-neutral-600 font-medium  dark:text-neutral-50">Chỗ đã chọn</h1>
            <div className="bg-primary/20 rounded-lg py-0.5 px-1.5 text-neutral-600 font-normal uppercase  dark:text-neutral-50">
              Không Hoàn Trả
            </div>
          </div>
          {selectedSeats.length > 0 ? (
            <div className="w-full flex items-center gap-x-3">
              {selectedSeats.map((seatId) => (
                <div
                  key={seatId}
                  className="w-9 h-9 bg-neutral-200/80 rounded-lg flex items-center justify-center text-base text-neutral-700 font-semibold"
                >
                  {seatId}
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full flex items-center gap-x-3">
              <p className="text-sm text-neutral-500 font-norma  dark:text-neutral-300">Chưa chọn chỗ</p>
            </div>
          )}
        </div>

        <div className="w-full space-y-2">

          <div className="flex items-center justify-between gap-x-4">
            <div className="flex gap-y-0.5 flex-col">
              <h1 className="text-lg text-neutral-700 font-bold  dark:text-neutral-50">Tổng tiền:</h1>
              <span className="text-xs text-neutral-500 font-normal  dark:text-neutral-300">(Bao gồm VAT)</span>
            </div>
            <p className="text-base text-neutral-600 font-semibold dark:text-neutral-50">
              {selectedSeats.reduce((total, seatId) => {
                const seat = seatData.find((seat) => seat.id === seatId);
                return total + (seat ? seat.price : 0);
              }, 0).toLocaleString('vi-VN')} VNĐ
            </p>

          </div>
        </div>

        <div className="w-full flex items-center justify-center">
          {selectedSeats.length > 0 ? (
            <button
              onClick={handleProceedToCheckout}
              className="w-full bg-primary hover:bg-primary/90 text-neutral-50 font-normal py-2.5 flex items-center justify-center uppercase rounded-lg transition"
            >
              thanh toán
            </button>
          ) : (
            <div className="w-full space-y-0.5">
              <button
                disabled
                className="w-full bg-primary hover:bg-primary/90 text-neutral-50 font-normal py-2.5 flex items-center justify-center uppercase rounded-lg transition cursor-not-allowed"
              >
                thanh toán
              </button>
              <small className="text-xs text-neutral-600 font-normal px-1  dark:text-neutral-50">
                Vui lòng chọn ít nhất một chỗ để đến trang thanh toán!
              </small>
            </div>
          )}
        </div>
      </div>

      {showError && <ErrorMessage message={errorMessage} />}
    </div>
  );
};

export default BusSeat;