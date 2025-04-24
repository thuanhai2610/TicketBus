/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";

const Vehicles = () => {
    const [formErrors, setFormErrors] = useState({});
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
    const [vehicles, setVehicles] = useState([]);
    const [vehiclesLoading, setVehiclesLoading] = useState(false);
    const [vehiclesError, setVehiclesError] = useState(null);
    const [newVehicle, setNewVehicle] = useState({
        vehicleId: "",
        companyId: "",
        lisencePlate: "",
        vehicleType: "",
        seatCount: "",
        availableSeats: "",
    });
    const [editVehicle, setEditVehicle] = useState(null);
    const [openCreateVehicleDialog, setOpenCreateVehicleDialog] = useState(false);
    const [openEditVehicleDialog, setOpenEditVehicleDialog] = useState(false);

    const fetchCompanies = async () => {
        try {
            setLoading(true);
            const response = await axios.get("http://localhost:3001/companies", {
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

    const fetchVehicles = async (companyId) => {
        try {
            setVehiclesLoading(true);
            setVehiclesError(null);
            const response = await axios.get(
                `http://localhost:3001/vehicle?companyId=${companyId}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            setVehicles(response.data);
            setVehiclesLoading(false);
        } catch (error) {
            console.error("Error fetching vehicles:", error);
            setVehiclesError("Không thể tải danh sách xe. Vui lòng thử lại sau.");
            setVehiclesLoading(false);
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, []);

    const handleVehicleInputChange = (e) => {
        const { name, value } = e.target;
        setNewVehicle({
            ...newVehicle,
            [name]:
                name === "seatCount" || name === "availableSeats"
                    ? Number(value)
                    : value,
        });
    };

    const handleCreateVehicle = async () => {
        try {
            setIsSubmitting(true);
            setFormErrors({});

            if (
                !newVehicle.vehicleId ||
                !newVehicle.companyId ||
                !newVehicle.lisencePlate ||
                !newVehicle.vehicleType ||
                !newVehicle.seatCount ||
                !newVehicle.availableSeats
            ) {
                throw new Error("Tất cả các trường là bắt buộc");
            }

            const seatCountNum = Number(newVehicle.seatCount);
            const availableSeatsNum = Number(newVehicle.availableSeats);
            if (isNaN(seatCountNum) || seatCountNum <= 0) {
                throw new Error("Tổng số ghế phải là một số lớn hơn 0");
            }
            if (
                isNaN(availableSeatsNum) ||
                availableSeatsNum < 0 ||
                availableSeatsNum > seatCountNum
            ) {
                throw new Error(
                    "Số ghế trống phải là một số không âm và không vượt quá tổng số ghế"
                );
            }
            if (!["GIUONGNAM", "NGOI"].includes(newVehicle.vehicleType)) {
                throw new Error(
                    "Loại xe không hợp lệ. Chỉ chấp nhận GIUONGNAM hoặc NGOI"
                );
            }

            const companyResponse = await axios.get(
                `http://localhost:3001/companies?companyId=${newVehicle.companyId}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            if (
                !companyResponse.data ||
                !Array.isArray(companyResponse.data) ||
                companyResponse.data.length === 0
            ) {
                throw new Error("Công ty không tồn tại");
            }

            const vehicleToSend = {
                vehicleId: newVehicle.vehicleId,
                companyId: newVehicle.companyId,
                lisencePlate: newVehicle.lisencePlate,
                vehicleType: newVehicle.vehicleType,
                seatCount: seatCountNum,
                availableSeats: availableSeatsNum,
            };
            await axios.post(`http://localhost:3001/vehicle`, vehicleToSend, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            setOpenCreateVehicleDialog(false);
            setNewVehicle({
                vehicleId: "",
                companyId: newVehicle.companyId,
                lisencePlate: "",
                vehicleType: "",
                seatCount: "",
                availableSeats: "",
            });
            setNotification({
                open: true,
                message: "Xe đã được tạo thành công",
                severity: "success",
            });
            fetchVehicles(newVehicle.companyId);
        } catch (error) {
            console.error("Error creating vehicle:", error);
            setFormErrors({
                global:
                    error.response?.data?.message ||
                    error.message ||
                    "Không thể tạo xe. Vui lòng thử lại sau.",
            });
            setNotification({
                open: true,
                message:
                    error.response?.data?.message ||
                    error.message ||
                    "Không thể tạo xe. Vui lòng thử lại sau.",
                severity: "error",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateVehicle = async () => {
        try {
            setIsSubmitting(true);
            setFormErrors({});

            if (
                !editVehicle.lisencePlate ||
                !editVehicle.vehicleType ||
                isNaN(editVehicle.seatCount) ||
                editVehicle.seatCount <= 0 ||
                isNaN(editVehicle.availableSeats) ||
                editVehicle.availableSeats < 0 ||
                editVehicle.availableSeats > editVehicle.seatCount
            ) {
                throw new Error("Vui lòng điền đầy đủ và hợp lệ các trường");
            }

            const vehicleToSend = {
                lisencePlate: editVehicle.lisencePlate,
                vehicleType: editVehicle.vehicleType,
                seatCount: Number(editVehicle.seatCount),
                availableSeats: Number(editVehicle.availableSeats),
            };

            await axios.put(
                `http://localhost:3001/vehicle/${editVehicle.vehicleId}`,
                vehicleToSend,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            setOpenEditVehicleDialog(false);
            setNotification({
                open: true,
                message: "Xe đã được cập nhật thành công",
                severity: "success",
            });
            fetchVehicles(selectedCompanyId);
        } catch (error) {
            console.error("Error updating vehicle:", error);
            setNotification({
                open: true,
                message:
                    error.response?.data?.message ||
                    "Không thể cập nhật xe. Vui lòng thử lại sau.",
                severity: "error",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteVehicle = async (vehicleId) => {
        try {
            await axios.delete(`http://localhost:3001/vehicle/${vehicleId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            setNotification({
                open: true,
                message: "Xe đã được xóa thành công",
                severity: "success",
            });
            fetchVehicles(selectedCompanyId);
        } catch (error) {
            console.error("Error deleting vehicle:", error);
            setNotification({
                open: true,
                message:
                    error.response?.data?.message ||
                    "Không thể xóa xe. Vui lòng thử lại sau.",
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
        setNewVehicle({ ...newVehicle, companyId });
        if (companyId) {
            fetchVehicles(companyId);
        } else {
            setVehicles([]);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <svg
                    className="animate-spin h-8 w-8 text-blue-600"
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
                        d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                    ></path>
                </svg>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center my-8">
                <p className="text-red-600 text-lg font-semibold">{error}</p>
                <button
                    onClick={fetchCompanies}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                    Thử lại
                </button>
            </div>
        );
    }

    return (
        <div className="">
            {/* Company Selection */}
            <div className="mb-6">
                <label className="block text-gray-50 font-medium mb-2 uppercase">
                    Chọn Bến Xe
                </label>
                <select
                    value={selectedCompanyId}
                    onChange={handleCompanyChange}
                    className="bg-primary w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    {/* Vehicles Header */}
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-50">
                            Danh sách Xe
                        </h2>
                        <button
                            onClick={() => setOpenCreateVehicleDialog(true)}
                            className="flex items-center px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-700 transition"
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
                            Thêm Xe Mới
                        </button>
                    </div>

                    {/* Vehicles Table */}
                    {vehiclesLoading ? (
                        <div className="flex justify-center my-4">
                            <svg
                                className="animate-spin h-8 w-8 text-blue-600"
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
                                    d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                                ></path>
                            </svg>
                        </div>
                    ) : vehiclesError ? (
                        <p className="text-red-600 text-center ">{vehiclesError}</p>
                    ) : vehicles.length > 0 ? (
                        <div className="overflow-x-auto shadow-md shadow-neutral-200 ">
                            <table className="w-full  shadow-lg rounded">
                                <thead>
                                    <tr className="bg-slate-500">
                                        <th className="p-3 text-left text-gray-50 font-semibold">
                                            ID xe
                                        </th>
                                        <th className="p-3 text-left text-gray-50 font-semibold">
                                            Biển số xe
                                        </th>
                                        <th className="p-3 text-left text-gray-50 font-semibold">
                                            Loại xe
                                        </th>
                                        <th className="p-3 text-left text-gray-50 font-semibold">
                                            Số ghế
                                        </th>
                                        <th className="p-3 text-left text-gray-50 font-semibold">
                                            Hành động
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {vehicles.map((vehicle) => (
                                        <tr
                                            key={vehicle._id || vehicle.vehicleId}
                                            className="border-b hover:bg-slate-700"
                                        >
                                            <td className="p-3">{vehicle.vehicleId}</td>
                                            <td className="p-3">{vehicle.lisencePlate}</td>
                                            <td className="p-3">{vehicle.vehicleType}</td>
                                            <td className="p-3">
                                                {vehicle.availableSeats}/{vehicle.seatCount}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm flex space-x-2">
                                                <button
                                                    className="border border-red-500 text-red-500 px-3 py-1 rounded flex items-center hover:bg-red-500 hover:text-white"
                                                    onClick={() => handleDeleteVehicle(vehicle.vehicleId)}
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
                                                            d="M6 18L18 6M6 6l12 12"
                                                        ></path>
                                                    </svg>
                                                    Xóa
                                                </button>
                                                <button
                                                    className="border border-blue-500 text-blue-500 px-3 py-1 rounded flex items-center hover:bg-blue-500 hover:text-white"
                                                    onClick={() => {
                                                        setEditVehicle(vehicle);
                                                        setOpenEditVehicleDialog(true);
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
                                                        ></path>
                                                    </svg>
                                                    Chỉnh sửa
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-200 text-center">
                            Không có xe nào thuộc bến xe này.
                        </p>
                    )}
                </>
            )}

            {/* Create Vehicle Dialog */}
            {openCreateVehicleDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-primary rounded-lg shadow-lg max-w-md w-full p-6 shadow-neutral-200">
                        <h3 className="text-lg font-semibold text-gray-50 mb-4 uppercase text-center">
                            Tạo Xe Mới
                        </h3>
                        <div className="space-y-4">
                            <input
                                name="vehicleId"
                                type="text"
                                placeholder="ID xe"
                                value={newVehicle.vehicleId}
                                onChange={handleVehicleInputChange}
                                className="bg-transparent w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            <input
                                name="companyId"
                                type="text"
                                placeholder="ID Bến Xe"
                                value={newVehicle.companyId}
                                disabled
                                className=" w-full p-3 border border-gray-300 rounded-md bg-slate-500"
                            />
                            <input
                                name="lisencePlate"
                                type="text"
                                placeholder="Biển số xe"
                                value={newVehicle.lisencePlate}
                                onChange={handleVehicleInputChange}
                                className="bg-transparent w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            <select
                                name="vehicleType"
                                value={newVehicle.vehicleType}
                                onChange={handleVehicleInputChange}
                                className="bg-transparent text-neutral-50 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="" className="bg-slate-500">━━ Chọn loại xe ━━</option>
                                <option value="GIUONGNAM" className="bg-slate-500">GIUONGNAM</option>
                                <option value="NGOI" className=" bg-slate-500">NGOI</option>
                            </select>
                            <input
                                name="seatCount"
                                type="number"
                                placeholder="Tổng số ghế"
                                value={newVehicle.seatCount}
                                onChange={handleVehicleInputChange}
                                className={`bg-transparent w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${newVehicle.seatCount &&
                                    (isNaN(newVehicle.seatCount) || newVehicle.seatCount <= 0)
                                    ? "border-red-500"
                                    : "border-gray-300 focus:ring-blue-500"
                                    }`}
                                required
                                min="1"
                            />
                            {newVehicle.seatCount &&
                                (isNaN(newVehicle.seatCount) || newVehicle.seatCount <= 0) && (
                                    <p className="text-red-500 text-sm">
                                        Tổng số ghế phải là một số lớn hơn 0
                                    </p>
                                )}
                            <input
                                name="availableSeats"
                                type="number"
                                placeholder="Số ghế trống"
                                value={newVehicle.availableSeats}
                                onChange={handleVehicleInputChange}
                                className={`bg-transparent w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${newVehicle.availableSeats &&
                                    (isNaN(newVehicle.availableSeats) ||
                                        newVehicle.availableSeats < 0 ||
                                        (newVehicle.seatCount &&
                                            newVehicle.availableSeats > newVehicle.seatCount))
                                    ? "border-red-500"
                                    : "border-gray-300 focus:ring-blue-500"
                                    }`}
                                required
                                min="0"
                            />
                            {newVehicle.availableSeats &&
                                (isNaN(newVehicle.availableSeats) ||
                                    newVehicle.availableSeats < 0) && (
                                    <p className="text-red-500 text-sm font-bold">
                                        Số ghế trống phải là một số không âm
                                    </p>
                                )}
                            {newVehicle.seatCount &&
                                newVehicle.availableSeats > newVehicle.seatCount && (
                                    <p className="text-red-500 text-sm font-bold ">
                                        Số ghế trống không thể lớn hơn tổng số ghế
                                    </p>
                                )}
                        </div>
                        <div className="flex justify-end space-x-2 mt-6">
                            <button
                                onClick={() => setOpenCreateVehicleDialog(false)}
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-red-500 text-gray-50 rounded-md hover:bg-red-700 transition"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleCreateVehicle}
                                disabled={
                                    isSubmitting ||
                                    !newVehicle.vehicleId ||
                                    !newVehicle.companyId ||
                                    !newVehicle.lisencePlate ||
                                    !newVehicle.vehicleType ||
                                    !newVehicle.seatCount ||
                                    !newVehicle.availableSeats ||
                                    isNaN(Number(newVehicle.seatCount)) ||
                                    Number(newVehicle.seatCount) <= 0 ||
                                    isNaN(Number(newVehicle.availableSeats)) ||
                                    Number(newVehicle.availableSeats) < 0 ||
                                    Number(newVehicle.availableSeats) > Number(newVehicle.seatCount)
                                }
                                className={`px-4 py-2 rounded-md text-white transition ${isSubmitting ? "bg-emerald-500" : "bg-emerald-500 hover:bg-emerald-700"
                                    }`}
                            >
                                {isSubmitting ? (
                                    <svg
                                        className="animate-spin h-5 w-5 text-white inline"
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
                                            d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
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

            {/* Edit Vehicle Dialog */}
            {openEditVehicleDialog && editVehicle && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-primary rounded-lg shadow-lg max-w-md w-full p-6 shadow-neutral-200">
                        <h3 className="text-lg font-semibold text-gray-50 mb-4 text-center uppercase">
                            Chỉnh sửa Xe
                        </h3>
                        <div className="space-y-4">
                            <input
                                name="vehicleId"
                                type="text"
                                placeholder="ID xe"
                                value={editVehicle.vehicleId}
                                disabled
                                className="bg-transparent w-full p-3 border border-gray-300 rounded-md bg-gray-100"
                            />
                            <input
                                name="companyId"
                                type="text"
                                placeholder="ID công ty"
                                value={editVehicle.companyId}
                                disabled
                                className="bg-transparent w-full p-3 border border-gray-300 rounded-md bg-gray-100"
                            />
                            <input
                                name="lisencePlate"
                                type="text"
                                placeholder="Biển số xe"
                                value={editVehicle.lisencePlate}
                                onChange={(e) =>
                                    setEditVehicle({ ...editVehicle, lisencePlate: e.target.value })
                                }
                                className="bg-transparent w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            <select
                                name="vehicleType"
                                value={editVehicle.vehicleType}
                                onChange={(e) =>
                                    setEditVehicle({ ...editVehicle, vehicleType: e.target.value })
                                }
                                className="bg-transparent w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="" className="bg-slate-500">Chọn loại xe</option>
                                <option value="GIUONGNAM" className="bg-slate-500">GIUONGNAM</option>
                                <option value="NGOI" className="bg-slate-500">NGOI</option>
                            </select>
                            <input
                                name="seatCount"
                                type="number"
                                placeholder="Tổng số ghế"
                                value={editVehicle.seatCount}
                                onChange={(e) =>
                                    setEditVehicle({
                                        ...editVehicle,
                                        seatCount: Number(e.target.value),
                                    })
                                }
                                className={`bg-transparent w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${isNaN(editVehicle.seatCount) || editVehicle.seatCount <= 0
                                    ? "border-red-500"
                                    : "border-gray-300 focus:ring-blue-500"
                                    }`}
                                required
                                min="1"
                            />
                            {isNaN(editVehicle.seatCount) || editVehicle.seatCount <= 0 ? (
                                <p className="text-red-500 text-sm font-bold">
                                    Tổng số ghế phải là một số lớn hơn 0
                                </p>
                            ) : null}
                            <input
                                name="availableSeats"
                                type="number"
                                placeholder="Số ghế trống"
                                value={editVehicle.availableSeats}
                                onChange={(e) =>
                                    setEditVehicle({
                                        ...editVehicle,
                                        availableSeats: Number(e.target.value),
                                    })
                                }
                                className={`bg-transparent w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${isNaN(editVehicle.availableSeats) ||
                                    editVehicle.availableSeats < 0 ||
                                    editVehicle.availableSeats > editVehicle.seatCount
                                    ? "border-red-500"
                                    : "border-gray-300 focus:ring-blue-500"
                                    }`}
                                required
                                min="0"
                            />
                            {isNaN(editVehicle.availableSeats) ||
                                editVehicle.availableSeats < 0 ? (
                                <p className="text-red-500 text-sm font-bold">
                                    Số ghế trống phải là một số không âm
                                </p>
                            ) : editVehicle.availableSeats > editVehicle.seatCount ? (
                                <p className="text-red-500 text-sm font-bold">
                                    Số ghế trống không thể lớn hơn tổng số ghế
                                </p>
                            ) : null}
                        </div>
                        <div className="flex justify-end space-x-2 mt-6">
                            <button
                                onClick={() => setOpenEditVehicleDialog(false)}
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-red-500 text-gray-50 rounded-md hover:bg-red-700 transition"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleUpdateVehicle}
                                disabled={
                                    isSubmitting ||
                                    !editVehicle?.lisencePlate ||
                                    !editVehicle?.vehicleType ||
                                    isNaN(editVehicle?.seatCount) ||
                                    editVehicle?.seatCount <= 0 ||
                                    isNaN(editVehicle?.availableSeats) ||
                                    editVehicle?.availableSeats < 0 ||
                                    editVehicle?.availableSeats > editVehicle?.seatCount
                                }
                                className={`px-4 py-2 rounded-md text-white transition ${isSubmitting ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                                    }`}
                            >
                                {isSubmitting ? (
                                    <svg
                                        className="animate-spin h-5 w-5 text-white inline"
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
                                            d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
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
                    className={`fixed bottom-4 right-4 p-4 rounded-md shadow-lg text-white ${notification.severity === "success" ? "bg-green-600" : "bg-red-600"
                        }`}
                >
                    <p>{notification.message}</p>
                    <button
                        onClick={handleCloseNotification}
                        className="absolute top-2 right-2 text-white"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                            ></path>
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
};

export default Vehicles;