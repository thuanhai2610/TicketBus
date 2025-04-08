import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowRightLong } from 'react-icons/fa6';

const BookingStatus = ({ tripInfo, selectedSeats, vehicleId, seatData, passengerInfo, ticketId }) => {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentId, setPaymentId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
    const [vehicle, setVehicleId] = useState(null); 
    const [fetchError, setFetchError] = useState(null); 
  const [isRedirecting, setIsRedirecting] = useState(false);
  // Calculate total price based on selectedSeats and seatData
  const totalPrice = selectedSeats?.reduce((total, seatId) => {
    const seat = seatData?.find((seat) => seat.id === seatId);
    return total + (seat ? seat.price : 0);
  }, 0) || 0;

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handlePayment = async () => {
    setError(null);
    setIsLoading(true);

    if (!ticketId) {
      setError('Ticket ID is missing. Please book seats first.');
      setIsLoading(false);
      return;
    }

    if (!paymentMethod) {
      setError('Please select a payment method.');
      setIsLoading(false);
      return;
    }

    if (!passengerInfo.fullName || !passengerInfo.email || !passengerInfo.phone || !passengerInfo.address) {
      setError('Please fill in all passenger information.');
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found. Please log in.');
      }

      const tripId = tripInfo?.tripId;
      const companyId = tripInfo?.companyId;

      if (!tripId || !companyId) {
        throw new Error('Trip ID or Company ID is missing in trip information.');
      }

      // Step 1: Create a payment with status "pending"
      const paymentData = {
        ticketId: ticketId,
        tripId: tripId,
        companyId: companyId,
        amount: totalPrice,
        paymentMethod: paymentMethod,
        paymentStatus: 'pending',
        
      };

      console.log("Sending payment data:", paymentData);

      const paymentResponse = await fetch('http://localhost:3001/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(paymentData),
      });

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json();
        throw new Error(errorData.message || 'Failed to create payment');
      }

      const paymentResult = await paymentResponse.json();
      console.log('Payment created:', paymentResult);
      setPaymentId(paymentResult.paymentId);

      // Step 2: Update payment status to "completed"
      const updatePaymentResponse = await axios.put(
        `http://localhost:3001/payments/${ticketId}`,
        { paymentStatus: 'completed' },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Payment status updated to completed:', updatePaymentResponse.data);

      // Step 3: Update ticket with passenger information and status "Paid"
      const updateTicketData = {
        email: passengerInfo.email,
        phone: passengerInfo.phone,
        fullName: passengerInfo.fullName,
        address: passengerInfo.address,
        status: 'Paid',
      };

      const updateResponse = await axios.put(
        `http://localhost:3001/tickets/${ticketId}`,
        updateTicketData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Ticket updated with passenger info and status "Paid":', updateResponse.data);

      setSuccess(true);
      setError(null);

      // Redirect to payment confirmation page
      setTimeout(() => {
        navigate('/bus-tickets/payment', {
          state: {
           ticketId: ticketId,
            tripInfo: tripInfo,
            selectedSeats: selectedSeats,
            totalPrice: totalPrice,
            passengerInfo: passengerInfo,
            vehicleId: vehicleId,
            lisencePlate: vehicle?.lisencePlate,
          },
        });
        setIsRedirecting(false); // Reset redirecting state after navigation
      }, 3000);
    } catch (error) {
      console.error('Error during payment or ticket update:', error);
      if (error.response) {
        if (error.response.status === 404) {
          setError('Ticket not found. Please ensure the ticket ID is correct.');
        } else if (error.response.status === 400) {
          setError(error.response.data.message || 'Failed to process payment. Please try again.');
        } else if (error.response.status === 401) {
          setError('Unauthorized. Please log in again.');
        } else {
          setError(error.response.data.message || 'An error occurred. Please try again.');
        }
      } else {
        setError(error.message || 'An error occurred. Please try again.');
      }
      setSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    setError(null);
    setIsLoading(true);

    const confirmCancel = window.confirm('Are you sure you want to cancel your booking? This action cannot be undone.');
    if (!confirmCancel) {
      setIsLoading(false);
      return;
    }

    if (!ticketId) {
      setError('Ticket ID is missing. Please book seats first.');
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found. Please log in.');
      }

      console.log('Selected seats to be set to Available:', selectedSeats);

      // Update the ticket status to "Cancelled"
      const updateTicketResponse = await axios.put(
        `http://localhost:3001/tickets/${ticketId}`,
        { status: 'Cancelled' },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Ticket status updated to Cancelled:', updateTicketResponse.data);

      // The backend (TicketService) will handle updating the seats to "Available" and incrementing the vehicle's availableSeats

      setPaymentId(null);

      navigate(`/bus-tickets/detail/${vehicleId}`, { state: { message: 'Booking cancelled successfully.' } });
    } catch (error) {
      console.error('Error during cancellation:', error.response?.data || error);
      if (error.response) {
        if (error.response.status === 404) {
          setError('Ticket not found. Please ensure the ticket ID is correct.');
        } else if (error.response.status === 400) {
          setError(error.response.data.message || 'Failed to cancel booking. Please try again.');
        } else if (error.response.status === 401) {
          setError('Unauthorized. Please log in again.');
        } else {
          setError(error   (error.response.data.message || 'An error occurred. Please try again.'));
        }
      } else {
        setError(error.message || 'An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };
useEffect(() => {
    const fetchVehicleId = async () => {
      if (!vehicleId) {
        setFetchError('VehicleId ID is missing. Unable to fetch VehicleId details.');
        return;
      }

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found. Please log in.');
        }

        const response = await axios.get(`http://localhost:3001/vehicle/${vehicleId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('Fetched VehicleId:', response.data);
        setVehicleId(response.data);
      } catch (error) {
        console.error('Error fetching VehicleId:', error);
        setFetchError(error.response?.data?.message || 'Failed to fetch VehicleId details.');
      }
    };

    fetchVehicleId();
  }, [vehicleId]);

  const departureTime = tripInfo?.departureTime ? formatTime(tripInfo.departureTime) : 'Unknown Time';
  const arrivalTime = tripInfo?.arrivalTime ? formatTime(tripInfo.arrivalTime) : 'Unknown Time';

  return (
    <div className="w-full col-span-3 sticky top-20 space-y-7">
      <div className="w-full bg-neutral-50 rounded-xl py-4 px-6 border border-neutral-200 shadow-sm space-y-5">
        <h1 className="text-lg text-neutral-700 font-bold text-center border-b border-neutral-200 pb-4">
          Your Ticket Report Status
        </h1>
        <div className="space-y-5">
          <div className="space-y-2 w-full">
            <h1 className="text-base text-neutral-700 font-medium">Your Destination</h1>
            <div className="space-y-0.5 w-full">
              <div className="w-full flex items-center justify-between gap-x-5">
                <p className="text-sm text-neutral-400 font-normal">From</p>
                <p className="text-sm text-neutral-400 font-normal">To</p>
              </div>
              <div className="w-full flex items-center justify-between gap-x-4">
                <h1 className="text-sm text-neutral-600 font-normal">
                  {tripInfo?.departurePoint || 'Unknown Departure'}{' '}
                  <span className="font-medium">{departureTime}</span>
                </h1>
                <div className="flex-1 border-dashed border border-neutral-300" />
                <h1 className="text-sm text-neutral-600 font-normal">
                  {tripInfo?.destinationPoint || 'Unknown Destination'}{' '}
                  <span className="font-medium">{arrivalTime}</span>
                </h1>
              </div>
              <div className="w-full flex items-center justify-between gap-x-4 !mt-1.5">
                <h1 className="text-sm text-neutral-600 font-normal">Bus No.:</h1>
                <h1 className="text-sm text-neutral-600 font-normal">{vehicle?.lisencePlate || 'Unknown Bus'}</h1>
              </div>
            </div>
          </div>
          <div className="space-y-2 w-full">
            <h1 className="text-base text-neutral-700 font-medium">Your Seats</h1>
            <div className="w-full flex items-center gap-x-3">
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
                <p className="text-sm text-neutral-500 font-normal">No seats selected</p>
              )}
            </div>
          </div>
          <div className="space-y-2 w-full">
            <h1 className="text-base text-neutral-700 font-medium">Total Fare Price</h1>
            <div className="flex items-center justify-between gap-x-4">
              <div className="flex gap-y-0.5 flex-col">
                <h3 className="text-base text-neutral-500 font-medium">Total Price:</h3>
                <span className="text-xs text-neutral-500 font-normal">(Including all taxes)</span>
              </div>
              <p className="text-base text-neutral-600 font-semibold">
                VND {totalPrice.toLocaleString()}
              </p>
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
          Payment successful! Your ticket has been updated.
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-base text-neutral-700 font-medium">Payment Method</h2>
        <div className="space-y-2">
          <div className="flex items-center gap-x-2 p-2 border rounded-lg">
            <input
              type="radio"
              name="paymentMethod"
              value="cash"
              checked={paymentMethod === 'cash'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-4 h-4"
            />
            <div className="h-6 w-20 bg-blue-500 text-white flex items-center justify-center rounded text-sm">Cash</div>
            <span className="text-sm text-neutral-600">Pay with cash</span>
          </div>
          <div className="flex items-center gap-x-2 p-2 border rounded-lg">
            <input
              type="radio"
              name="paymentMethod"
              value="bank_transfer"
              checked={paymentMethod === 'bank_transfer'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-4 h-4"
            />
            <div className="h-6 w-20 bg-blue-100 text-blue-800 flex items-center justify-center rounded text-sm">Bank Transfer</div>
            <span className="text-sm text-neutral-600">Pay via bank transfer</span>
          </div>
        </div>
      </div>

      <div className="w-full px-1.5 flex gap-4">
        <button
          onClick={handlePayment}
          disabled={isLoading}
          className={`w-full bg-primary hover:bg-primary/90 text-neutral-50 font-normal py-2.5 flex items-center justify-center uppercase rounded-lg transition gap-x-2 ${
           ( isLoading  || isRedirecting) ?'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? 'Processing...' : 'PROCEED TO PAYMENT'}
          <FaArrowRightLong />
        </button>
        <button
          onClick={handleCancel}
          disabled={isLoading}
          className={`w-full bg-red-500 hover:bg-red-600 text-neutral-50 font-normal py-2.5 flex items-center justify-center uppercase rounded-lg transition ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? 'Processing...' : 'CANCEL BOOKING'}
        </button>
      </div>
    </div>
  );
};

export default BookingStatus;