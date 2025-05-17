/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { GiSteeringWheel } from 'react-icons/gi';
import { MdOutlineChair } from 'react-icons/md';
import { Link, useParams, useNavigate } from 'react-router-dom';
import ErrorMessage from '../../../../../components/alertmessage/errormsg/ErrorMessage';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import dayjs from 'dayjs';

const BusSeat = () => {
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  const [seatData, setSeatData] = useState([]);
  const [tripInfo, setTripInfo] = useState(null);
  const [tripId, setTripId] = useState('');
  const [seatsLoading, setSeatsLoading] = useState(false);
  const [seatsError, setSeatsError] = useState(null);
  const [tripError, setTripError] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [username, setUsername] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchUsername = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found. Please log in.');
      }

      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      if (decoded.exp < currentTime) {
        console.error('Token has expired');
        handleLogout();
        return;
      }
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const fetchedUsername = response.data.username;
      if (!fetchedUsername) {
        throw new Error('Username not found in user profile.');
      }

      setUsername(fetchedUsername);
    } catch (error) {
      if (error.response?.status === 401) {
        handleLogout();
      } else {
        setErrorMessage(error.message || 'Failed to fetch username. Please try again.');
        setShowError(true);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
    window.location.reload();
  };

  const fetchSeats = async (vehicleId) => {
    setSeatsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/seats?vehicleId=${vehicleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.data || response.data.length === 0) {
        setSeatsError('Không tìm thấy ghế cho chuyến xe này.');
        setSeatData([]);
        return;
      }

      const seats = response.data.map((seat) => ({
        id: seat.seatNumber,
        status: seat.availabilityStatus.charAt(0).toUpperCase() + seat.availabilityStatus.slice(1).toLowerCase(),
        price: seat.price,
      }));

      const expectedOrder = [
        'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9',
        'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9',
        'A10',
        'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9',
        'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9',
      ];

      const additionalSeats = seats.filter((seat) => !expectedOrder.includes(seat.id));
      const allSeatIds = [...expectedOrder, ...additionalSeats.map((seat) => seat.id)];

      const sortedSeats = allSeatIds.map((seatId) => {
        const seat = seats.find((s) => s.id === seatId);
        return seat || { id: seatId, status: 'Unavailable', price: 0 };
      });
      setSeatData(sortedSeats);
    } catch (error) {
      if (error.response?.status === 401) {
        handleLogout();
      } else {
        setSeatsError(error.response?.data?.message || 'Bạn cần đăng nhập để đặt ghế.');
        setSeatData([]);
      }
    } finally {
      setSeatsLoading(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} - ${hours}:${minutes}`;
  };

  const departureTime = tripInfo?.departureTime ? formatTime(tripInfo.departureTime) : 'Unknown Time';
  const arrivalTime = tripInfo?.arrivalTime ? formatTime(tripInfo.arrivalTime) : 'Unknown Time';

  const fetchTripInfo = async (vehicleId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/trip/all`, {
        params: { vehicleId, page: 1, limit: 10 },
        headers: { Authorization: `Bearer ${token}` },
      });
      const trips = Array.isArray(response.data) ? response.data : response.data?.trips || [];
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
        return matchingTrip.tripId;
      } else {
        setTripError('No trip found for this vehicle.');
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
      console.error('Error fetching trip info:', error);
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
      setErrorMessage('Username not available. Please try again.');
      setShowError(true);
      throw new Error('Username not available');
    }

    if (!tripId) {
      setErrorMessage('Trip ID not available. Please try again.');
      setShowError(true);
      throw new Error('Trip ID not available');
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found. Please log in.');
      }

      const payload = {
        tripId: tripId,
        seatNumber: selectedSeats,
        username: username,
        vehicleId: vehicleId,
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/tickets/hold-seat`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const ticketId = response.data.ticket.ticketId;
      setSeatData((prevSeatData) =>
        prevSeatData.map((seat) =>
          selectedSeats.includes(seat.id) ? { ...seat, status: 'Booked' } : seat
        )
      );

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
      console.error('Error holding seats:', error);
      let errorMsg = error.response?.data?.message || 'Lỗi khi đặt ghế, hãy đặt lại.';
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
      setErrorMessage('Please select at least one seat to proceed.');
      setShowError(true);
      return;
    }

    try {
      await holdSeats();
    } catch (error) {
      // Error handled in holdSeats
    }
  };

  const handleSeatClick = (seatId) => {
    const seat = seatData.find((seat) => seat.id === seatId);
    if (!seat || seat.status === 'Booked' || seat.status === 'Selected') return;

    setSelectedSeats((prevSelectedSeats) => {
      if (prevSelectedSeats.includes(seatId)) {
        return prevSelectedSeats.filter((seat) => seat !== seatId);
      } else {
        if (prevSelectedSeats.length >= 10) {
          setErrorMessage('Bạn không thể chọn nhiều hơn 10 chỗ ngồi.');
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

  const getSeatStyle = (seat) => {
    if (seat.status === 'Booked') {
      return 'bg-yellow-500 text-white dark:bg-yellow-400';
    }
    if (seat.status === 'Selected') {
      return 'bg-red-600 text-white dark:bg-red-400';
    }
    if (selectedSeats.includes(seat.id)) {
      return 'bg-emerald-600 text-white dark:bg-emerald-300';
    }
    return 'bg-white text-neutral-500 border border-neutral-300 dark:bg-neutral-700 dark:text-neutral-50';
  };

  const getChairStyle = (seat) => {
    if (seat.status === 'Booked') {
      return 'text-yellow-500 cursor-not-allowed dark:text-yellow-400';
    }
    if (seat.status === 'Selected') {
      return 'text-red-600 cursor-not-allowed dark:text-red-400';
    }
    if (selectedSeats.includes(seat.id)) {
      return 'text-emerald-600 cursor-pointer dark:text-emerald-300';
    }
    return 'text-neutral-500 cursor-pointer dark:text-neutral-500';
  };

  if (seatsLoading) {
    return <div>Loading seats...</div>;
  }

  if (seatsError) {
    return <div>Error: {seatsError}</div>;
  }

  if (tripError) {
    console.warn('Trip info error:', tripError);
  }

  // Desktop Layout
  const DesktopBusSeat = (
    <div className="w-full grid grid-cols-5 gap-10">
      {/* Seat Layout */}
      <div className="col-span-3 w-full flex items-center justify-center shadow-sm rounded-xl p-4 dark:bg-primary">
        <div className="w-full space-y-7">
          <p className="text-base text-neutral-600 font-medium text-center dark:text-neutral-50">
            Bấm vào những chỗ ghế trống để đặt chỗ.
          </p>

          <div className="w-full flex items-stretch gap-x-1.5 justify-center">
            <div className="w-10 h-full flex items-center justify-center border-r-2 border-dashed border-neutral-300">
              <GiSteeringWheel className="text-3xl mt-7 text-primary -rotate-90 dark:text-neutral-50" />
            </div>

            <div className="flex flex-col items-center dark:text-neutral-50">
              <div className="flex-1 space-y-5">
                {/* First row (A1, A3, ..., A9) */}
                <div className="w-full h-auto grid grid-cols-9 gap-x-5 justify-end">
                  {seatData.slice(0, 9).map((seat) => (
                    <div key={seat.id} className="flex items-center gap-x-0" onClick={() => handleSeatClick(seat.id)}>
                      <h6 className="text-base text-neutral-600 font-bold dark:text-neutral-50">{seat.id}</h6>
                      <MdOutlineChair className={`text-3xl -rotate-90 dark:text-neutral-50 ${getChairStyle(seat)}`} />
                    </div>
                  ))}
                </div>

                {/* Second row (B1, B3, ..., B9) */}
                <div className="w-full h-auto grid grid-cols-9 gap-x-5 justify-end">
                  {seatData.slice(9, 18).map((seat) => (
                    <div key={seat.id} className="flex items-center gap-x-0" onClick={() => handleSeatClick(seat.id)}>
                      <h6 className="text-base text-neutral-600 font-bold dark:text-neutral-50">{seat.id}</h6>
                      <MdOutlineChair className={`text-3xl -rotate-90 dark:text-neutral-50 ${getChairStyle(seat)}`} />
                    </div>
                  ))}
                </div>

                {/* Third row (A10) */}
                <div className="w-full h-auto grid grid-cols-10 gap-x-5 justify-end">
                  <div className="col-span-9"></div>
                  {seatData.slice(18, 19).map((seat) => (
                    <div key={seat.id} className="flex items-center gap-x-0" onClick={() => handleSeatClick(seat.id)}>
                      <h6 className="text-base text-neutral-600 font-bold dark:text-neutral-50">{seat.id}</h6>
                      <MdOutlineChair className={`text-3xl -rotate-90 dark:text-neutral-50 ${getChairStyle(seat)}`} />
                    </div>
                  ))}
                </div>

                {/* Fourth row (C1, C3, ..., C9) */}
                <div className="w-full h-auto grid grid-cols-9 gap-x-5 justify-end">
                  {seatData.slice(19, 28).map((seat) => (
                    <div key={seat.id} className="flex items-center gap-x-0" onClick={() => handleSeatClick(seat.id)}>
                      <h6 className="text-base text-neutral-600 font-bold dark:text-neutral-50">{seat.id}</h6>
                      <MdOutlineChair className={`text-3xl -rotate-90 dark:text-neutral-50 ${getChairStyle(seat)}`} />
                    </div>
                  ))}
                </div>

                {/* Fifth row (D1, D3, ..., D9) */}
                <div className="w-full h-auto grid grid-cols-9 gap-x-5 justify-end">
                  {seatData.slice(28, 37).map((seat) => (
                    <div key={seat.id} className="flex items-center gap-x-0" onClick={() => handleSeatClick(seat.id)}>
                      <h6 className="text-base text-neutral-600 font-bold dark:text-neutral-50">{seat.id}</h6>
                      <MdOutlineChair className={`text-3xl -rotate-90 dark:text-neutral-50 ${getChairStyle(seat)}`} />
                    </div>
                  ))}
                </div>

                {/* Additional seats */}
                {seatData.slice(37).length > 0 && (
                  <div className="w-full h-auto grid grid-cols-9 gap-x-5 justify-end">
                    {seatData.slice(37).map((seat) => (
                      <div key={seat.id} className="flex items-center gap-x-0" onClick={() => handleSeatClick(seat.id)}>
                        <h6 className="text-base text-neutral-600 font-bold dark:text-neutral-50">{seat.id}</h6>
                        <MdOutlineChair className={`text-3xl -rotate-90 dark:text-neutral-50 ${getChairStyle(seat)}`} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="w-full flex items-center justify-center gap-6 border-t border-neutral-200 pt-5">
            <div className="flex items-center gap-x-2">
              <MdOutlineChair className="text-3xl text-neutral-500 -rotate-90 dark:text-neutral-500" />
              <p className="text-sm text-neutral-500 font-medium dark:text-neutral-50">Ghế trống</p>
            </div>
            <div className="flex items-center gap-x-2">
              <MdOutlineChair className="text-3xl text-yellow-500 -rotate-90 dark:text-yellow-400" />
              <p className="text-sm text-neutral-500 font-medium dark:text-neutral-50">Đang đặt chỗ</p>
            </div>
            <div className="flex items-center gap-x-2">
              <MdOutlineChair className="text-3xl text-red-600 -rotate-90 dark:text-red-400" />
              <p className="text-sm text-neutral-500 font-medium dark:text-neutral-50">Đã đặt</p>
            </div>
            <div className="flex items-center gap-x-2">
              <MdOutlineChair className="text-3xl text-emerald-600 dark:text-emerald-400 -rotate-90" />
              <p className="text-sm text-neutral-500 font-medium dark:text-neutral-50">Chọn chỗ</p>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Info */}
      <div className="col-span-2 w-full space-y-5 bg-neutral-50 rounded-xl py-4 px-6 border border-neutral-200 shadow-sm dark:bg-transparent">
        <div className="w-full space-y-2">
          <div className="w-full flex items-center justify-between">
            <h1 className="text-lg text-neutral-600 font-bold uppercase dark:text-neutral-50">Thông tin đặt chỗ</h1>
            <Link to="/bus-tickets" className="text-sm text-primary font-bold underline uppercase dark:text-neutral-50">
              Đổi chuyến
            </Link>
          </div>

          <div className="space-y-0.5 w-full">
            <div className="w-full flex items-center justify-between gap-x-5">
              <p className="text-sm text-neutral-400 font-normal dark:text-neutral-300">Điểm đi</p>
              <p className="text-sm text-neutral-400 font-normal dark:text-neutral-300">Điểm đến</p>
            </div>
            <div className="w-full flex items-center justify-between gap-x-4">
              <h1 className="text-sm text-neutral-800 font-normal dark:text-neutral-50">
                {tripInfo?.departurePoint || 'Unknown Departure'}{' '}
                <span className="font-medium text-red-500">{departureTime}</span>
              </h1>
              <div className="flex-1 border-dashed border border-neutral-300" />
              <h1 className="text-sm text-neutral-600 font-normal dark:text-neutral-50">
                {tripInfo?.destinationPoint || 'Unknown Destination'}{' '}
                <span className="font-medium text-red-500">{arrivalTime}</span>
              </h1>
            </div>
          </div>
        </div>

        <div className="w-full space-y-2">
          <div className="w-full flex items-center justify-between">
            <h1 className="text-lg text-neutral-600 font-medium dark:text-neutral-50">Chỗ đã chọn</h1>
            <div className="bg-primary/20 rounded-lg py-0.5 px-1.5 text-neutral-600 font-normal uppercase dark:text-neutral-50">
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
              <p className="text-sm text-neutral-500 font-normal dark:text-neutral-300">Chưa chọn chỗ</p>
            </div>
          )}
        </div>

        <div className="w-full space-y-2">
          <div className="flex items-center justify-between gap-x-4">
            <div className="flex gap-y-0.5 flex-col">
              <h1 className="text-lg text-neutral-700 font-bold dark:text-neutral-50">Tổng tiền:</h1>
              <span className="text-xs text-neutral-500 font-normal dark:text-neutral-300">(Bao gồm VAT)</span>
            </div>
            <p className="text-base text-neutral-600 font-semibold dark:text-neutral-50">
              {selectedSeats
                .reduce((total, seatId) => {
                  const seat = seatData.find((seat) => seat.id === seatId);
                  return total + (seat ? seat.price : 0);
                }, 0)
                .toLocaleString('vi-VN')}{' '}
              VNĐ
            </p>
          </div>
        </div>

        <div className="w-full flex items-center justify-center">
          {selectedSeats.length > 0 ? (
            <button
              onClick={handleProceedToCheckout}
              className="w-full bg-primary hover:bg-primary/90 text-neutral-50 font-normal py-2.5 flex items-center justify-center uppercase rounded-lg transition dark:border-neutral-50 border"
            >
              Thanh toán
            </button>
          ) : (
            <div className="w-full space-y-0.5">
              <button
                disabled
                className="w-full bg-primary hover:bg-primary/90 text-neutral-50 font-normal py-2.5 flex items-center justify-center uppercase rounded-lg transition cursor-not-allowed"
              >
                Thanh toán
              </button>
              <small className="text-xs text-neutral-600 font-normal px-1 dark:text-neutral-50">
                Vui lòng chọn ít nhất một chỗ để đến trang thanh toán!
              </small>
            </div>
          )}
        </div>
      </div>

      {showError && <ErrorMessage message={errorMessage} />}
    </div>
  );

  // Mobile Layout
  const MobileBusSeat = (
    <div className="w-full flex flex-col gap-6 px-4 dark:bg-primary">
      {/* Seat Layout */}
      <div className="w-full flex items-center justify-center shadow-sm rounded-xl p-4 bg-white dark:bg-primary">
        <div className="w-full space-y-5">
          <p className="text-xs text-neutral-600 font-medium text-center dark:text-neutral-50">
            Bấm vào những chỗ ghế trống để đặt chỗ.
          </p>

          <div className="w-full flex flex-col items-center">
            {/* Steering Wheel at Top */}
            <div className="w-full flex justify-start mb-4 ml-8">
              <GiSteeringWheel className="text-3xl text-primary dark:text-neutral-50" />
            </div>

            {/* Bus Layout */}
            <div className="w-full flex justify-center gap-x-4">
              {/* Left Side Seats (A1, B1, C1, D1, ...) */}
              <div className="flex flex-col gap-y-2">
                {seatData.slice(0, 18).filter((_, index) => index % 2 === 0).map((seat, index) => (
                  <div key={seat.id} className="flex items-center gap-x-2">
                    <div
                      className={`w-10 h-10 flex items-center justify-center rounded-md ${getSeatStyle(seat)}`}
                      onClick={() => handleSeatClick(seat.id)}
                    >
                      <span className="text-xs font-bold">{seat.id}</span>
                    </div>
                    {/* Pair with right side seat */}
                    {seatData[2 * index + 1] && (
                      <div
                        className={`w-10 h-10 flex items-center justify-center rounded-md ${getSeatStyle(seatData[2 * index + 1])}`}
                        onClick={() => handleSeatClick(seatData[2 * index + 1].id)}
                      >
                        <span className="text-xs font-bold">{seatData[2 * index + 1].id}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Aisle (represented by spacing or dashed line) */}
              <div className="w-4 border-l-2 border-dashed border-neutral-300"></div>

              {/* Right Side Seats (C1, D1, ...) */}
              <div className="flex flex-col gap-y-2">
                {seatData.slice(19, 37).filter((_, index) => index % 2 === 0).map((seat, index) => (
                  <div key={seat.id} className="flex items-center gap-x-2">
                    <div
                      className={`w-10 h-10 flex items-center justify-center rounded-md ${getSeatStyle(seat)}`}
                      onClick={() => handleSeatClick(seat.id)}
                    >
                      <span className="text-xs font-bold">{seat.id}</span>
                    </div>
                    {/* Pair with right side seat */}
                    {seatData[19 + 2 * index + 1] && (
                      <div
                        className={`w-10 h-10 flex items-center justify-center rounded-md ${getSeatStyle(seatData[19 + 2 * index + 1])}`}
                        onClick={() => handleSeatClick(seatData[19 + 2 * index + 1].id)}
                      >
                        <span className="text-xs font-bold">{seatData[19 + 2 * index + 1].id}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Single Seat (A10) at Back */}
            {seatData.slice(18, 19).length > 0 && (
              <div className="w-full flex justify-center mt-4">
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-md ${getSeatStyle(seatData[18])}`}
                  onClick={() => handleSeatClick(seatData[18].id)}
                >
                  <span className="text-xs font-bold">{seatData[18].id}</span>
                </div>
              </div>
            )}

            {/* Additional Seats */}
            {seatData.slice(37).length > 0 && (
              <div className="w-full flex flex-col items-center gap-y-2 mt-4">
                {seatData.slice(37).map((seat) => (
                  <div
                    key={seat.id}
                    className={`w-10 h-10 flex items-center justify-center rounded-md ${getSeatStyle(seat)}`}
                    onClick={() => handleSeatClick(seat.id)}
                  >
                    <span className="text-xs font-bold">{seat.id}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="w-full flex flex-wrap items-center justify-center gap-4 border-t border-neutral-200 pt-4">
            <div className="flex items-center gap-x-2">
              <div className="w-6 h-6 bg-white border border-neutral-300 rounded-md flex items-center justify-center">
                <span className="text-xs text-neutral-500">A</span>
              </div>
              <p className="text-xs text-neutral-500 font-medium dark:text-neutral-50">Ghế trống</p>
            </div>
            <div className="flex items-center gap-x-2">
              <div className="w-6 h-6 bg-yellow-500 rounded-md flex items-center justify-center">
                <span className="text-xs text-white">A</span>
              </div>
              <p className="text-xs text-neutral-500 font-medium dark:text-neutral-50">Đang đặt chỗ</p>
            </div>
            <div className="flex items-center gap-x-2">
              <div className="w-6 h-6 bg-red-600 rounded-md flex items-center justify-center">
                <span className="text-xs text-white">A</span>
              </div>
              <p className="text-xs text-neutral-500 font-medium dark:text-neutral-50">Đã đặt</p>
            </div>
            <div className="flex items-center gap-x-2">
              <div className="w-6 h-6 bg-emerald-600 rounded-md flex items-center justify-center">
                <span className="text-xs text-white">A</span>
              </div>
              <p className="text-xs text-neutral-500 font-medium dark:text-neutral-50">Chọn chỗ</p>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Info */}
      <div className="w-full space-y-4 bg-neutral-50 rounded-xl py-4 px-4 border border-neutral-200 shadow-sm dark:bg-transparent">
        <div className="w-full space-y-2">
          <div className="w-full flex items-center justify-between">
            <h1 className="text-sm text-neutral-600 font-bold uppercase dark:text-neutral-50">Thông tin đặt chỗ</h1>
            <Link to="/bus-tickets" className="text-xs text-primary font-bold underline uppercase dark:text-neutral-50">
              Đổi chuyến
            </Link>
          </div>

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

        </div>

        <div className="w-full space-y-2">
          <div className="w-full flex items-center justify-between">
            <h1 className="text-base text-neutral-600 font-medium dark:text-neutral-50">Chỗ đã chọn</h1>
            <div className="bg-primary/20 rounded-lg py-0.5 px-1 text-neutral-600 font-normal uppercase text-xs dark:text-neutral-50">
              Không Hoàn Trả
            </div>
          </div>
          {selectedSeats.length > 0 ? (
            <div className="w-full flex items-center gap-x-2 flex-wrap">
              {selectedSeats.map((seatId) => (
                <div
                  key={seatId}
                  className="w-8 h-8 bg-neutral-200/80 rounded-md flex items-center justify-center text-xs text-neutral-700 font-semibold"
                >
                  {seatId}
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full flex items-center gap-x-2">
              <p className="text-xs text-neutral-500 font-normal dark:text-neutral-300">Chưa chọn chỗ</p>
            </div>
          )}
        </div>

        <div className="w-full space-y-2">
          <div className="flex items-center justify-between gap-x-3">
            <div className="flex gap-y-0.5 flex-col">
              <h1 className="text-base text-neutral-700 font-bold dark:text-neutral-50">Tổng tiền:</h1>
              <span className="text-xs text-neutral-500 font-normal dark:text-neutral-300">(Bao gồm VAT)</span>
            </div>
            <p className="text-sm text-neutral-600 font-semibold dark:text-neutral-50">
              {selectedSeats
                .reduce((total, seatId) => {
                  const seat = seatData.find((seat) => seat.id === seatId);
                  return total + (seat ? seat.price : 0);
                }, 0)
                .toLocaleString('vi-VN')}{' '}
              VNĐ
            </p>
          </div>
        </div>

        <div className="w-full flex items-center justify-center">
          {selectedSeats.length > 0 ? (
            <button
              onClick={handleProceedToCheckout}
              className="w-full bg-primary hover:bg-primary/90 text-neutral-50 font-normal py-2 flex items-center justify-center uppercase rounded-lg transition"
            >
              Thanh toán
            </button>
          ) : (
            <div className="w-full space-y-0.5">
              <button
                disabled
                className="w-full bg-primary hover:bg-primary/90 text-neutral-50 font-normal py-2 flex items-center justify-center uppercase rounded-lg transition cursor-not-allowed"
              >
                Thanh toán
              </button>
              <small className="text-xs text-neutral-600 font-normal px-1 dark:text-neutral-50">
                Vui lòng chọn ít nhất một chỗ để đến trang thanh toán!
              </small>
            </div>
          )}
        </div>
      </div>

      {showError && <ErrorMessage message={errorMessage} />}
    </div>
  );

  return isMobile ? MobileBusSeat : DesktopBusSeat;
};

export default BusSeat;