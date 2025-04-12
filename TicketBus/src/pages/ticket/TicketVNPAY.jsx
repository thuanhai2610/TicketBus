import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { QRCodeCanvas } from 'qrcode.react';

const TicketVNPAY = () => {
  const [paymentData, setPaymentData] = useState(null);
  const [ticketData, setTicketData] = useState(null); // New state for ticket data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ticketDetails, setTicketDetails] = useState(null);
  const [tripDetails, setTripDetails] = useState(null);
  const [vehicleDetails, setVehicleDetails] = useState(null);
    const [qrCodeData, setQrCodeData] = useState(null);
  
  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        // Step 1: Get query parameters from URL and fetch payment data
        const urlParams = new URLSearchParams(window.location.search);
        const queryString = urlParams.toString();

        const paymentResponse = await axios.get(
          `http://localhost:3001/payments/vnpay/return?${queryString}`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        setPaymentData(paymentResponse.data);

        // Step 2: If paymentId exists, fetch ticket data
        if (paymentResponse.data.paymentId) {
          const ticketResponse = await axios.get(
            `http://localhost:3001/payments/tickets/ticketvnpay`, // Adjust endpoint as needed
            {
              params: { paymentId: paymentResponse.data.paymentId }, // Pass paymentId as query param
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );

          setTicketData(ticketResponse.data);
          if (ticketResponse.data.ticketId) {
            // Step 3: Fetch ticket details using ticketId
            console.log('Fetching ticket details with ticketId:', ticketResponse.data.ticketId);
            const ticketDetailsResponse = await axios.get(
              `http://localhost:3001/tickets/vn-pay/details?ticketId=${ticketResponse.data.ticketId}`,
              {
                headers: { 'Content-Type': 'application/json' },
              }
            );
            console.log('Ticket details response:', ticketDetailsResponse.data);
            setTicketDetails(ticketDetailsResponse.data);
            if (ticketDetailsResponse.data.tripId) {
                // Step 4: Fetch trip details using tripId
          
                const tripDetailsResponse = await axios.get(
                  `http://localhost:3001/trip/tripdetails?tripId=${ticketDetailsResponse.data.tripId}`,
                  {
                    headers: { 'Content-Type': 'application/json' },
                  }
                );
                console.log('Trip details response:', tripDetailsResponse.data);
                setTripDetails(tripDetailsResponse.data);
                if (tripDetailsResponse.data.vehicleId) {
                    // Step 5: Fetch vehicle details using vehicleId
                    console.log('Fetching vehicle details with vehicleId:', tripDetailsResponse.data.vehicleId);
                    const vehicleDetailsResponse = await axios.get(
                      `http://localhost:3001/vehicle/get/details?vehicleId=${tripDetailsResponse.data.vehicleId}`,
                      {
                        headers: { 'Content-Type': 'application/json' },
                      }
                    );
                    console.log('Vehicle details response:', vehicleDetailsResponse.data);
                    setVehicleDetails(vehicleDetailsResponse.data);
                    const qrData = JSON.stringify({
                      ticketId: ticketDetailsResponse.data.ticketId,
                      status: 'Paid',
                      fullName: ticketDetailsResponse.data.fullName,
                      departurePoint: tripDetailsResponse.data.departurePoint,
                      destinationPoint: tripDetailsResponse.data.destinationPoint,
                      departureTime: tripDetailsResponse.data.departureTime,
                      // seats: selectedSeats,
                      seats: ticketDetailsResponse.data.seatNumber,
                      seatsLength: ticketDetailsResponse.data.seatNumber.length,

                      lisencePlate: vehicleDetailsResponse.data.lisencePlate || 'Unknown',
                    });
                    setQrCodeData(qrData);
                  }
              }
          } 
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentData();
  }, []);

  if (loading) return <div><h1>Processing Payment...</h1></div>;
  if (error) return <div><h1>Payment Error</h1><p>{error}</p></div>;

  return (
    <div>
      <h1>Payment Result</h1>
     
      {ticketData && (
        <div>
          <h2>Ticket Information</h2>
          <p>Ticket ID: {ticketData.ticketId}</p>
          <p>Ticket ID: {ticketDetails.seatNumber}</p>
          <p>Ticket ID: {ticketDetails.seatNumber.length}</p>
          <p>Ticket ID: {ticketDetails.address}</p>
          <p>Ticket ID: {ticketDetails.email}</p>
          <p>Ticket ID: {ticketDetails.fullName}</p>
          <p>Ticket ID: {ticketDetails.phone}</p>
          <p>Tổng tiền: {ticketDetails.ticketPrice}</p>
          <p>Ngày đặt: {ticketDetails.bookedAt}</p>
        </div>
      )} {tripDetails ? (
        <div>
          <h2>Trip Information</h2>
          <p>Route: {tripDetails.departurePoint}----{tripDetails.destinationPoint}</p>
          {tripDetails.departureTime && <p>Departure Time: {new Date(tripDetails.departureTime).toLocaleString()}</p>}
          {tripDetails.arrivalTime && <p>Arrival Time: {new Date(tripDetails.arrivalTime).toLocaleString()}</p>}
          {tripDetails.price && <p>Price: {tripDetails.price}/ghế</p>}
        </div>
      ) : (
        <div>
          <h2>Trip Information</h2>
          <p>No trip details found.</p>
        </div>
      )} {vehicleDetails && (
        <div>
          <h2>Vehicle Information</h2>
          {vehicleDetails.lisencePlate && <p>License Plate: {vehicleDetails.lisencePlate}</p>}
        </div>
      )}{qrCodeData && (
  <div>
    <h2>QR Code</h2>
    <QRCodeCanvas value={qrCodeData} size={200} />
  </div>

   )};
      </div>
      )
};

export default TicketVNPAY;