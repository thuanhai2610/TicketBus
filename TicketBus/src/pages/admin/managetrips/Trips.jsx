/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";

const Trips = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState({
        open: false,
        message: "",
        severity: "success",
    });
    const [selectedCompanyId, setSelectedCompanyId] = useState("");
    const [trips, setTrips] = useState([]);
    const [tripsLoading, setTripsLoading] = useState(false);
    const [tripsError, setTripsError] = useState(null);
    const [newTrip, setNewTrip] = useState({
        tripId: "",
        vehicleId: "",
        companyId: "",
        driverId: "",
        departurePoint: "",
        departureLatitude: "",
        departureLongtitude: "",
        destinationPoint: "",
        destinationLatitude: "",
        destinationLongtitude: "",
        departureDate: "",
        departureHour: "",
        arrivalDate: "",
        arrivalHour: "",
        price: "",
        status: "",
    });
    const [editTrip, setEditTrip] = useState(null);
    const [openCreateTripDialog, setOpenCreateTripDialog] = useState(false);
    const [openEditTripDialog, setOpenEditTripDialog] = useState(false);
    const locationCoordinates = {
        "Đà Nẵng": { lat: 16.05676, lng: 108.17257 },
        Huế: { lat: 16.45266, lng: 107.60618 },
        "Quảng Ngãi": { lat: 15.10798, lng: 108.82012 },
        "Bình Định": { lat: 13.75342, lng: 109.20895 },
        "Phú Yên": { lat: 13.10562, lng: 109.29385 },
        "Nha Trang": { lat: 12.24406, lng: 109.09787 },
    };

    const fetchCompanies = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/companies`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            const data = Array.isArray(response.data) ? response.data : [];
            setCompanies(data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching companies:", error);
            setError("Không thể tải danh sách công ty. Vui lòng thử lại sau.");
            setCompanies([]);
            setLoading(false);
        }
    };

    const fetchTrips = async (companyId) => {
        try {
            setTripsLoading(true);
            setTripsError(null);
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/trip?companyId=${companyId}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            setTrips(response.data);
            setTripsLoading(false);
        } catch (error) {
            console.error("Error fetching trips:", error);
            setTripsError("Không thể tải danh sách chuyến đi. Vui lòng thử lại sau.");
            setTripsLoading(false);
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, []);

    const handleTripInputChange = (e) => {
        const { name, value } = e.target;

        if (name === "departurePoint" || name === "destinationPoint") {
            const coords = locationCoordinates[value];
            if (!coords) return;

            setNewTrip((prev) => ({
                ...prev,
                [name]: value,
                ...(name === "departurePoint"
                    ? {
                        departureLatitude: coords.lat,
                        departureLongtitude: coords.lng,
                    }
                    : {
                        destinationLatitude: coords.lat,
                        destinationLongtitude: coords.lng,
                    }),
            }));
        } else {
            setNewTrip((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleCreateTrip = async () => {
        try {
            setIsSubmitting(true);
            const [depDay, depMonth, depYear] = newTrip.departureDate.split("-");
            const [depHour, depMinute] = newTrip.departureHour.split(":");
            const localDepartureDate = new Date(
                depYear,
                depMonth - 1,
                depDay,
                depHour,
                depMinute,
                0
            );
            const departureTime = localDepartureDate.toISOString();

            const [arrDay, arrMonth, arrYear] = newTrip.arrivalDate.split("-");
            const [arrHour, arrMinute] = newTrip.arrivalHour.split(":");
            const localArrivalDate = new Date(
                arrYear,
                arrMonth - 1,
                arrDay,
                arrHour,
                arrMinute,
                0
            );
            const arrivalTime = localArrivalDate.toISOString();

            const tripToSend = {
                ...newTrip,
                departureTime,
                arrivalTime,
                price: Number(newTrip.price),
            };
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/trip`,
                tripToSend,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            if (!response.data) {
                setNotification({
                    open: true,
                    message:
                        "Không thể tạo chuyến đi vì tài xế hoặc xe đã được phân công.",
                    severity: "warning",
                });
                return;
            }
            setOpenCreateTripDialog(false);
            setNewTrip({
                tripId: "",
                vehicleId: "",
                companyId: newTrip.companyId,
                driverId: "",
                departurePoint: "",
                departureLatitude: "",
                departureLongtitude: "",
                destinationPoint: "",
                destinationLatitude: "",
                destinationLongtitude: "",
                departureDate: "",
                departureHour: "",
                arrivalDate: "",
                arrivalHour: "",
                price: "",
                status: "",
            });
            setNotification({
                open: true,
                message: "Chuyến đi đã được tạo thành công",
                severity: "success",
            });
            fetchTrips(newTrip.companyId);
        } catch (error) {
            console.error("Error creating trip:", error);
            setNotification({
                open: true,
                message:
                    error.response?.data?.message ||
                    "Không thể tạo chuyến đi. Vui lòng thử lại sau.",
                severity: "error",
            });
        } finally {
            setIsSubmitting(false);
        }
    };


    const handleUpdateTrip = async () => {
        try {
            setIsSubmitting(true);

            const formatISOWithoutTimezone = (dateStr, timeStr) => {
                const [day, month, year] = dateStr.split("-");
                return `${year}-${month}-${day}T${timeStr}:00Z`;
            };

            const departureTime = formatISOWithoutTimezone(editTrip.departureDate, editTrip.departureHour);
            const arrivalTime = formatISOWithoutTimezone(editTrip.arrivalDate, editTrip.arrivalHour);

            const tripToSend = {
                vehicleId: editTrip.vehicleId,
                driverId: editTrip.driverId,
                departurePoint: editTrip.departurePoint,
                departureLatitude: Number(editTrip.departureLatitude),
                departureLongtitude: Number(editTrip.departureLongtitude),
                destinationPoint: editTrip.destinationPoint,
                destinationLatitude: Number(editTrip.destinationLatitude),
                destinationLongtitude: Number(editTrip.destinationLongtitude),
                departureTime, // ← đây là string
                arrivalTime,   // ← đây cũng là string
                price: Number(editTrip.price),
                status: editTrip.status,
            };

            await axios.put(
                `${import.meta.env.VITE_API_URL}/trip/${editTrip.tripId}`,
                tripToSend,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            setNotification({
                open: true,
                message: "Chuyến đi đã được cập nhật thành công",
                severity: "success",
            });
            setOpenEditTripDialog(false);
            fetchTrips(selectedCompanyId);
        } catch (error) {
            setNotification({
                open: true,
                message: error.response?.data?.message || "Có lỗi xảy ra",
                severity: "error",
            });
        } finally {
            setIsSubmitting(false);
        }
    };



    const handleDeleteTrip = async (tripId) => {
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/trip/${tripId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            await axios.delete(`${import.meta.env.VITE_API_URL}/seats/trip/${tripId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            setNotification({
                open: true,
                message: "Chuyến đi và các ghế liên quan đã được xóa thành công",
                severity: "success",
            });
            fetchTrips(selectedCompanyId);
        } catch (error) {
            console.error("Error deleting trip:", error);
            setNotification({
                open: true,
                message:
                    error.response?.data?.message ||
                    "Không thể xóa chuyến đi. Vui lòng thử lại sau.",
                severity: "error",
            });
        }
    };

    const handleCloseNotification = () => {
        setNotification({ ...notification, open: false });
    };

    const handleCompanyChange = (e) => {
        const companyId = e.target.value;
        setSelectedCompanyId(companyId);
        setNewTrip({ ...newTrip, companyId });
        if (companyId) {
            fetchTrips(companyId);
        } else {
            setTrips([]);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center my-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center my-8">
                <h6 className="text-red-500 text-lg font-semibold">{error}</h6>
                <button
                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    onClick={fetchCompanies}
                >
                    Thử lại
                </button>
            </div>
        );
    }

    return (
        <div className="">
            {/* Company Selector */}
            <div className="mb-4">
                <label className="block text-lg font-medium text-neutral-950">
                    Chọn Bến Xe
                </label>
                <select
                    value={selectedCompanyId}
                    onChange={handleCompanyChange}
                    className="mt-2 block w-full border shadow-md shadow-emerald-500 border-gray-300 rounded-md p-2 focus:ring-red-500 focus:border-blue-500"
                >
                    <option value="">━━ Chọn Bến Xe ━━</option>
                    {companies.map((company) => (
                        <option key={company.companyId} value={company.companyId}>
                            {company.companyName}
                        </option>
                    ))}
                </select>
            </div>

            {selectedCompanyId && (
                <>
                    {/* Header */}
                    <div className="flex justify-between items-center mb-4">
                        <h6 className="text-xl font-semibold">Danh sách Chuyến Đi</h6>
                        <button
                            className="bg-emerald-600 text-white px-4 py-2 rounded flex items-center hover:bg-emerald-700"
                            onClick={() => setOpenCreateTripDialog(true)}
                        >
                            <svg
                                className="w-5 h-5 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 4v16m8-8H4"
                                ></path>
                            </svg>
                            Thêm Chuyến Đi Mới
                        </button>
                    </div>

                    {/* Trips Table */}
                    {tripsLoading ? (
                        <div className="flex justify-center my-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-emerald-600"></div>
                        </div>
                    ) : tripsError ? (
                        <p className="text-red-500">{tripsError}</p>
                    ) : trips.length > 0 ? (
                        <div className="shadow-md shadow-emerald-500 rounded overflow-x-auto max-h-[540px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-500 scrollbar-track-gray-200">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead className="sticky top-0 z-10 bg-emerald-800">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                                            ID chuyến đi
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                                            ID Xe
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                                            Giờ khởi hành
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                                            Điểm khởi hành
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                                            Điểm đến
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                                            Giờ đến
                                        </th>
                                        <th className="px-6 py-3 text-xs text-center font-medium text-gray-50 uppercase tracking-wider">
                                            Hành động
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-400">
                                    {trips.map((trip) => {
                                        const departureDate = new Date(trip.departureTime);
                                        const arrivalDate = new Date(trip.arrivalTime);

                                        const formatUTCTime = (date) => {
                                            const day = String(date.getUTCDate()).padStart(2, "0");
                                            const month = String(date.getUTCMonth() + 1).padStart(2, "0");
                                            const year = date.getUTCFullYear();
                                            const hours = String(date.getUTCHours()).padStart(2, "0");
                                            const minutes = String(date.getUTCMinutes()).padStart(2, "0");
                                            return `${hours}:${minutes} ${day}/${month}/${year}`;
                                        };

                                        return (
                                            <tr key={trip._id || trip.tripId} className="hover:bg-emerald-100 text-neutral-950">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-500 underline font-semibold">{trip.tripId}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">{trip.vehicleId}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">{formatUTCTime(departureDate)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">{trip.departurePoint}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">{trip.destinationPoint}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">{formatUTCTime(arrivalDate)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm flex space-x-2 justify-center">
                                                    <button
                                                        className="font-semibold border border-red-500 text-red-500 px-3 py-1 rounded flex items-center hover:bg-red-500 hover:text-white"
                                                        onClick={() => handleDeleteTrip(trip.tripId)}
                                                    >
                                                        <svg
                                                            className="w-4 h-4 mr-2"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                        >
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                        Xóa
                                                    </button>
                                                    <button
                                                        className="font-semibold border border-blue-500 text-blue-500 px-3 py-1 rounded flex items-center hover:bg-blue-500 hover:text-white"
                                                        onClick={() => {
                                                            setEditTrip({
                                                                ...trip,
                                                                departureDate: trip.departureTime.split("T")[0].split("-").reverse().join("-"),
                                                                departureHour: trip.departureTime.split("T")[1].slice(0, 5),
                                                                arrivalDate: trip.arrivalTime.split("T")[0].split("-").reverse().join("-"),
                                                                arrivalHour: trip.arrivalTime.split("T")[1].slice(0, 5),
                                                            });
                                                            setOpenEditTripDialog(true);
                                                        }}
                                                    >
                                                        <svg
                                                            className="w-4 h-4 mr-2"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth="2"
                                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                            />
                                                        </svg>
                                                        Chỉnh sửa
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-200 text-center">Không có chuyến đi nào thuộc bến xe này.</p>
                    )}

                </>
            )}

            {/* Create Trip Dialog */}
            {openCreateTripDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-emerald-700 rounded-lg w-full max-w-lg p-6">
                        <h2 className="text-2xl text-neutral-50 font-semibold mb-4 uppercase text-center">Tạo Chuyến Đi Mới</h2>
                        <form className="space-y-4">
                            {/* Trip ID & Company ID */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-50">ID chuyến đi</label>
                                    <input
                                        type="text"
                                        name="tripId"
                                        value={newTrip.tripId}
                                        onChange={handleTripInputChange}
                                        className="text-neutral-50 mt-1 block w-full border border-gray-300 rounded-md p-2 bg-transparent"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-50">ID công ty*</label>
                                    <input
                                        type="text"
                                        name="companyId"
                                        value={newTrip.companyId}
                                        disabled
                                        className="text-neutral-300 bg-emerald-800  mt-1 block w-full border border-gray-300 rounded-md p-2 cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            {/* Vehicle ID & Driver ID */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-50">ID xe</label>
                                    <input
                                        type="text"
                                        name="vehicleId"
                                        value={newTrip.vehicleId}
                                        onChange={handleTripInputChange}
                                        className="text-neutral-50 bg-transparent mt-1 block w-full border border-gray-300 rounded-md p-2"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-50">ID tài xế</label>
                                    <input
                                        type="text"
                                        name="driverId"
                                        value={newTrip.driverId}
                                        onChange={handleTripInputChange}
                                        className="text-neutral-50 bg-transparent mt-1 block w-full border border-gray-300 rounded-md p-2"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Departure & Destination */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-50">Điểm khởi hành</label>
                                    <select
                                        name="departurePoint"
                                        value={newTrip.departurePoint}
                                        onChange={handleTripInputChange}
                                        className="text-neutral-300 bg-transparent mt-1 block w-full border border-gray-300 rounded-md p-2"
                                        required
                                    >
                                        <option value="" className="text-neutral-950">Chọn điểm khởi hành</option>
                                        {Object.keys(locationCoordinates).map((point) => (
                                            <option key={point} value={point} className="text-neutral-950">{point}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-50">Điểm đến</label>
                                    <select
                                        name="destinationPoint"
                                        value={newTrip.destinationPoint}
                                        onChange={handleTripInputChange}
                                        className="text-neutral-300 bg-transparent mt-1 block w-full border border-gray-300 rounded-md p-2"
                                        required
                                    >
                                        <option value="" className="text-neutral-950">Chọn điểm đến</option>
                                        {Object.keys(locationCoordinates).map((point) => (
                                            <option key={point} value={point} className="text-neutral-950">{point}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Departure & Arrival Dates */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-50">Ngày khởi hành</label>
                                    <input
                                        type="text"
                                        name="departureDate"
                                        placeholder="DD-MM-YYYY"
                                        value={newTrip.departureDate}
                                        onChange={handleTripInputChange}
                                        className={`text-neutral-50 bg-transparent mt-1 block w-full border rounded-md p-2 ${newTrip.departureDate && !/^\d{2}-\d{2}-\d{4}$/.test(newTrip.departureDate)
                                            ? "border-red-500"
                                            : "border-gray-300"
                                            }`}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-50">Ngày đến</label>
                                    <input
                                        type="text"
                                        name="arrivalDate"
                                        placeholder="DD-MM-YYYY"
                                        value={newTrip.arrivalDate}
                                        onChange={handleTripInputChange}
                                        className={`text-neutral-50 bg-transparent mt-1 block w-full border rounded-md p-2 ${newTrip.arrivalDate && !/^\d{2}-\d{2}-\d{4}$/.test(newTrip.arrivalDate)
                                            ? "border-red-500"
                                            : "border-gray-300"
                                            }`}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Departure & Arrival Hours */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-50">Giờ khởi hành</label>
                                    <input
                                        type="text"
                                        name="departureHour"
                                        placeholder="HH:MM"
                                        value={newTrip.departureHour}
                                        onChange={handleTripInputChange}
                                        className={`text-neutral-50 bg-transparent mt-1 block w-full border rounded-md p-2 ${newTrip.departureHour && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(newTrip.departureHour)
                                            ? "border-red-500"
                                            : "border-gray-300"
                                            }`}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-50">Giờ đến</label>
                                    <input
                                        type="text"
                                        name="arrivalHour"
                                        placeholder="HH:MM"
                                        value={newTrip.arrivalHour}
                                        onChange={handleTripInputChange}
                                        className={`text-neutral-50 bg-transparent mt-1 block w-full border rounded-md p-2 ${newTrip.arrivalHour && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(newTrip.arrivalHour)
                                            ? "border-red-500"
                                            : "border-gray-300"
                                            }`}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Price & Status */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-50">Giá vé</label>
                                    <input
                                        type="text"
                                        name="price"
                                        value={
                                            newTrip.price
                                                ? Number(newTrip.price).toLocaleString("vi-VN")
                                                : ""
                                        }
                                        onChange={(e) => {
                                            const rawValue = e.target.value.replace(/\D/g, "");
                                            setNewTrip((prev) => ({
                                                ...prev,
                                                price: rawValue,
                                            }));
                                        }}
                                        className={`text-neutral-50 bg-transparent mt-1 block w-full border rounded-md p-2 ${newTrip.price !== "" && (isNaN(newTrip.price) || newTrip.price <= 0)
                                            ? "border-red-500"
                                            : "border-gray-300"
                                            }`}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-50">Trạng thái</label>
                                    <select
                                        name="status"
                                        value={newTrip.status}
                                        onChange={handleTripInputChange}
                                        className="text-neutral-50 bg-transparent mt-1 block w-full border border-gray-300 rounded-md p-2"
                                        required
                                    >
                                        <option value="" className="text-neutral-950">Chọn trạng thái</option>
                                        <option value="PENDING" className="text-neutral-950">Đang chờ</option>
                                        <option value="IN_PROGRESS" className="text-neutral-950">Đang tiến hành</option>
                                        <option value="COMPLETED" className="text-neutral-950">Đã hoàn thành</option>
                                        <option value="CANCELLED" className="text-neutral-950">Đã hủy</option>
                                    </select>
                                </div>
                            </div>
                        </form>

                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                className={`px-4 py-2 text-gray-50 bg-red-400 rounded hover:bg-red-600 ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                                    }`}
                                onClick={() => setOpenCreateTripDialog(false)}
                                disabled={isSubmitting}
                            >
                                Hủy
                            </button>
                            <button
                                className={`px-4 py-2 text-white bg-amber-500 rounded hover:bg-amber-600 flex items-center ${isSubmitting ||
                                    !newTrip.tripId ||
                                    !newTrip.vehicleId ||
                                    !newTrip.companyId ||
                                    !newTrip.driverId ||
                                    !newTrip.departurePoint ||
                                    !newTrip.destinationPoint ||
                                    !newTrip.departureDate ||
                                    !newTrip.departureHour ||
                                    !newTrip.arrivalDate ||
                                    !newTrip.arrivalHour ||
                                    !newTrip.price ||
                                    !newTrip.status ||
                                    !/^\d{2}-\d{2}-\d{4}$/.test(newTrip.departureDate) ||
                                    !/^\d{2}-\d{2}-\d{4}$/.test(newTrip.arrivalDate) ||
                                    !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(
                                        newTrip.departureHour
                                    ) ||
                                    !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(
                                        newTrip.arrivalHour
                                    ) ||
                                    isNaN(newTrip.price) ||
                                    newTrip.price <= 0
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                                    }`}
                                onClick={handleCreateTrip}
                                disabled={
                                    isSubmitting ||
                                    !newTrip.tripId ||
                                    !newTrip.vehicleId ||
                                    !newTrip.companyId ||
                                    !newTrip.driverId ||
                                    !newTrip.departurePoint ||
                                    !newTrip.destinationPoint ||
                                    !newTrip.departureDate ||
                                    !newTrip.departureHour ||
                                    !newTrip.arrivalDate ||
                                    !newTrip.arrivalHour ||
                                    !newTrip.price ||
                                    !newTrip.status ||
                                    !/^\d{2}-\d{2}-\d{4}$/.test(newTrip.departureDate) ||
                                    !/^\d{2}-\d{2}-\d{4}$/.test(newTrip.arrivalDate) ||
                                    !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(
                                        newTrip.departureHour
                                    ) ||
                                    !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(
                                        newTrip.arrivalHour
                                    ) ||
                                    isNaN(newTrip.price) ||
                                    newTrip.price <= 0
                                }
                            >
                                {isSubmitting ? (
                                    <svg
                                        className="animate-spin h-5 w-5 mr-2 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                ) : (
                                    "Tạo"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Trip Dialog */}
            {openEditTripDialog && editTrip && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-emerald-700 rounded-lg w-full max-w-lg p-6">
                        <h2 className="text-2xl text-neutral-50 font-semibold mb-4 text-center uppercase">Chỉnh sửa Chuyến Đi</h2>
                        <form className="space-y-4">
                            {/* ID chuyến đi & ID công ty */}
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-50 ">ID chuyến đi</label>
                                    <input
                                        type="text"
                                        name="tripId"
                                        value={editTrip.tripId}
                                        disabled
                                        className="text-neutral-300 bg-emerald-800 mt-1 w-full border border-gray-300 rounded-md p-2 cursor-not-allowed"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-50">ID công ty</label>
                                    <input
                                        type="text"
                                        name="companyId"
                                        value={editTrip.companyId}
                                        disabled
                                        className="text-neutral-300 bg-emerald-800 mt-1 w-full border border-gray-300 rounded-md p-2 bg-transparent cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            {/* ID xe & ID tài xế */}
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-50">ID xe</label>
                                    <input
                                        type="text"
                                        name="vehicleId"
                                        value={editTrip.vehicleId}
                                        onChange={(e) => setEditTrip({ ...editTrip, vehicleId: e.target.value })}
                                        className="text-neutral-50 bg-transparent mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-50">ID tài xế</label>
                                    <input
                                        type="text"
                                        name="driverId"
                                        value={editTrip.driverId}
                                        onChange={(e) => setEditTrip({ ...editTrip, driverId: e.target.value })}
                                        className="text-neutral-50 bg-transparent mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Điểm khởi hành & điểm đến */}
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-50">Điểm khởi hành</label>
                                    <select
                                        name="departurePoint"
                                        value={editTrip.departurePoint}
                                        onChange={(e) => {
                                            const coords = locationCoordinates[e.target.value];
                                            setEditTrip({
                                                ...editTrip,
                                                departurePoint: e.target.value,
                                                departureLatitude: coords?.lat || "",
                                                departureLongtitude: coords?.lng || "",
                                            });
                                        }}
                                        className="text-neutral-200 bg-transparent mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    >
                                        <option value="" className="text-neutral-950">Chọn điểm khởi hành</option>
                                        {Object.keys(locationCoordinates).map((point) => (
                                            <option key={point} value={point} className="text-neutral-950">{point}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-50">Điểm đến</label>
                                    <select
                                        name="destinationPoint"
                                        value={editTrip.destinationPoint}
                                        onChange={(e) => {
                                            const coords = locationCoordinates[e.target.value];
                                            setEditTrip({
                                                ...editTrip,
                                                destinationPoint: e.target.value,
                                                destinationLatitude: coords?.lat || "",
                                                destinationLongtitude: coords?.lng || "",
                                            });
                                        }}
                                        className="text-neutral-200 bg-transparent mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    >
                                        <option value="" className="text-neutral-950">Chọn điểm đến</option>
                                        {Object.keys(locationCoordinates).map((point) => (
                                            <option key={point} value={point} className="text-neutral-950">{point}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Ngày khởi hành & ngày đến */}
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-50">Ngày khởi hành</label>
                                    <input
                                        type="text"
                                        name="departureDate"
                                        value={editTrip.departureDate}
                                        onChange={(e) => setEditTrip({ ...editTrip, departureDate: e.target.value })}
                                        placeholder="DD-YY-MM"
                                        className={`text-neutral-50 bg-transparent mt-1 w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 ${editTrip.departureDate && !/^\d{2}-\d{2}-\d{4}$/.test(editTrip.departureDate)
                                            ? "border-red-500"
                                            : "border-gray-300"
                                            }`}
                                        required
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-50">Ngày đến</label>
                                    <input
                                        type="text"
                                        name="arrivalDate"
                                        value={editTrip.arrivalDate}
                                        onChange={(e) => setEditTrip({ ...editTrip, arrivalDate: e.target.value })}
                                        placeholder="05-04-2025"
                                        className={`text-neutral-50 bg-transparent mt-1 w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 ${editTrip.arrivalDate && !/^\d{2}-\d{2}-\d{4}$/.test(editTrip.arrivalDate)
                                            ? "border-red-500"
                                            : "border-gray-300"
                                            }`}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Giờ khởi hành & giờ đến */}
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-50">Giờ khởi hành</label>
                                    <input
                                        type="text"
                                        name="departureHour"
                                        value={editTrip.departureHour}
                                        onChange={(e) => setEditTrip({ ...editTrip, departureHour: e.target.value })}
                                        placeholder="HH:MM"
                                        className={`text-neutral-50 bg-transparent mt-1 w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 ${editTrip.departureHour && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(editTrip.departureHour)
                                            ? "border-red-500"
                                            : "border-gray-300"
                                            }`}
                                        required
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-50">Giờ đến</label>
                                    <input
                                        type="text"
                                        name="arrivalHour"
                                        value={editTrip.arrivalHour}
                                        onChange={(e) => setEditTrip({ ...editTrip, arrivalHour: e.target.value })}
                                        placeholder="HH:MM"
                                        className={`text-neutral-50 bg-transparent mt-1 w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 ${editTrip.arrivalHour && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(editTrip.arrivalHour)
                                            ? "border-red-500"
                                            : "border-gray-300"
                                            }`}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Giá vé & Trạng thái */}
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-50">Giá vé</label>
                                    <input
                                        type="text"
                                        name="price"
                                        value={
                                            editTrip.price !== ""
                                                ? Number(editTrip.price).toLocaleString("vi-VN")
                                                : ""
                                        }
                                        onChange={(e) => {
                                            const raw = e.target.value.replace(/\D/g, ""); // Xóa tất cả ký tự không phải số
                                            setEditTrip({ ...editTrip, price: raw });
                                        }}
                                        className={`text-neutral-50 bg-transparent mt-1 w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 ${isNaN(editTrip.price) || editTrip.price <= 0
                                            ? "border-red-500"
                                            : "border-gray-300"
                                            }`}
                                        required
                                    />
                                </div>

                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-50">Trạng thái</label>
                                    <select
                                        name="status"
                                        value={editTrip.status}
                                        onChange={(e) => setEditTrip({ ...editTrip, status: e.target.value })}
                                        className="text-neutral-50 bg-transparent mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    >
                                        <option value="" className="text-neutral-950">Chọn trạng thái</option>
                                        <option value="PENDING" className="text-neutral-950">Đang chờ</option>
                                        <option value="IN_PROGRESS" className="text-neutral-950">Đang tiến hành</option>
                                        <option value="COMPLETED" className="text-neutral-950">Đã hoàn thành</option>
                                        <option value="CANCELLED" className="text-neutral-950">Đã hủy</option>
                                    </select>
                                </div>
                            </div>
                        </form>

                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                className={`px-4 py-2 text-gray-50 bg-red-500 rounded hover:bg-red-700 ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                                    }`}
                                onClick={() => setOpenEditTripDialog(false)}
                                disabled={isSubmitting}
                            >
                                Hủy
                            </button>
                            <button
                                className={`px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 flex items-center ${isSubmitting ||
                                    !editTrip?.vehicleId ||
                                    !editTrip?.driverId ||
                                    !editTrip?.departurePoint ||
                                    !editTrip?.destinationPoint ||
                                    !editTrip?.departureDate ||
                                    !editTrip?.departureHour ||
                                    !editTrip?.arrivalDate ||
                                    !editTrip?.arrivalHour ||
                                    !editTrip?.price ||
                                    !editTrip?.status ||
                                    !/^\d{2}-\d{2}-\d{4}$/.test(editTrip.departureDate) ||
                                    !/^\d{2}-\d{2}-\d{4}$/.test(editTrip.arrivalDate) ||
                                    !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(
                                        editTrip.departureHour
                                    ) ||
                                    !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(
                                        editTrip.arrivalHour
                                    ) ||
                                    isNaN(editTrip.price) ||
                                    editTrip.price <= 0
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                                    }`}
                                onClick={handleUpdateTrip}
                                disabled={
                                    isSubmitting ||
                                    !editTrip?.vehicleId ||
                                    !editTrip?.driverId ||
                                    !editTrip?.departurePoint ||
                                    !editTrip?.destinationPoint ||
                                    !editTrip?.departureDate ||
                                    !editTrip?.departureHour ||
                                    !editTrip?.arrivalDate ||
                                    !editTrip?.arrivalHour ||
                                    !editTrip?.price ||
                                    !editTrip?.status ||
                                    !/^\d{2}-\d{2}-\d{4}$/.test(editTrip.departureDate) ||
                                    !/^\d{2}-\d{2}-\d{4}$/.test(editTrip.arrivalDate) ||
                                    !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(
                                        editTrip.departureHour
                                    ) ||
                                    !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(
                                        editTrip.arrivalHour
                                    ) ||
                                    isNaN(editTrip.price) ||
                                    editTrip.price <= 0
                                }
                            >
                                {isSubmitting ? (
                                    <svg
                                        className="animate-spin h-5 w-5 mr-2 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                ) : (
                                    "Cập nhật"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification */}
            {notification.open && (
                <div
                    className={`fixed bottom-4 right-4 p-4 rounded-md shadow-lg text-white ${notification.severity === "success"
                        ? "bg-green-500"
                        : notification.severity === "warning"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                >
                    <div className="flex items-center">
                        <span>{notification.message}</span>
                        <button
                            className="ml-4 text-white hover:text-gray-200"
                            onClick={handleCloseNotification}
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Trips;