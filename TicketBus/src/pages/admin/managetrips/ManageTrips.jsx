/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import MenuItem from "@mui/material/MenuItem";

const ManageTrips = () => {
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openCreateTripDialog, setOpenCreateTripDialog] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [newCompany, setNewCompany] = useState({
    companyId: "",
    companyName: "",
    phone: "",
    address: "",
  });
  const [editCompany, setEditCompany] = useState(null);
  const [viewCompany, setViewCompany] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [vehiclesError, setVehiclesError] = useState(null);
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
  const [openCreateVehicleDialog, setOpenCreateVehicleDialog] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    vehicleId: "",
    companyId: "",
    lisencePlate: "",
    vehicleType: "",
    seatCount: "",
    availableSeats: "",
  });
  const [openEditVehicleDialog, setOpenEditVehicleDialog] = useState(false);
  const [editVehicle, setEditVehicle] = useState(null);
  const [openEditTripDialog, setOpenEditTripDialog] = useState(false);
  const [editTrip, setEditTrip] = useState(null);

  const handleCloseCreateVehicleDialog = () => {
    setOpenCreateVehicleDialog(false);
    setNewVehicle({
      vehicleId: "",
      companyId: "",
      lisencePlate: "",
      vehicleType: "",
      seatCount: "",
      availableSeats: "",
    });
  };

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
      const response = await axios.post(
        `http://localhost:3001/vehicle`,
        vehicleToSend,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      handleCloseCreateVehicleDialog();
      setNotification({
        open: true,
        message: "Xe đã được tạo thành công",
        severity: "success",
      });
      if (viewCompany) {
        fetchVehicles(viewCompany.companyId);
      }
    } catch (error) {
      console.error(
        "Error creating vehicle:",
        error.response?.data || error.message
      );
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

  const fetchTrips = async (companyId) => {
    try {
      setTripsLoading(true);
      setTripsError(null);
      const response = await axios.get(
        `http://localhost:3001/trip?companyId=${companyId}`,
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

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewCompany({
      companyId: "",
      companyName: "",
      phone: "",
      address: "",
    });
  };

  const handleOpenEditDialog = (company) => {
    setEditCompany(company);
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setEditCompany(null);
  };

  const handleOpenViewDialog = (company) => {
    setViewCompany(company);
    setOpenViewDialog(true);
    fetchVehicles(company.companyId);
    fetchTrips(company.companyId);
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setViewCompany(null);
    setVehicles([]);
    setTrips([]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCompany({
      ...newCompany,
      [name]: value,
    });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditCompany({
      ...editCompany,
      [name]: value,
    });
  };

  const handleCreateCompany = async () => {
    try {
      await axios.post("http://localhost:3001/companies", newCompany, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      handleCloseDialog();
      setNotification({
        open: true,
        message: "Công ty đã được tạo thành công",
        severity: "success",
      });
      fetchCompanies();
    } catch (error) {
      console.error("Error creating company:", error);
      setNotification({
        open: true,
        message: "Không thể tạo công ty. Vui lòng thử lại sau.",
        severity: "error",
      });
    }
  };

  const handleUpdateCompany = async () => {
    try {
      if (!editCompany._id) {
        throw new Error("Company _id is missing");
      }
      await axios.put(
        `http://localhost:3001/companies/${editCompany._id}`,
        editCompany,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      handleCloseEditDialog();
      setNotification({
        open: true,
        message: "Công ty đã được cập nhật thành công",
        severity: "success",
      });
      fetchCompanies();
    } catch (error) {
      console.error("Error updating company:", error);
      setNotification({
        open: true,
        message: "Không thể cập nhật công ty. Vui lòng thử lại sau.",
        severity: "error",
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const handleOpenCreateTripDialog = () => {
    setNewTrip({
      ...newTrip,
      companyId: viewCompany.companyId,
    });
    setOpenCreateTripDialog(true);
  };

  const handleCloseCreateTripDialog = () => {
    setOpenCreateTripDialog(false);
    setNewTrip({
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
  };

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

  const locationCoordinates = {
    "Đà Nẵng": { lat: 16.05676, lng: 108.17257 },
    Huế: { lat: 16.45266, lng: 107.60618 },
    "Quảng Ngãi": { lat: 15.10798, lng: 108.82012 },
    "Bình Định": { lat: 13.75342, lng: 109.20895 },
    "Phú Yên": { lat: 13.10562, lng: 109.29385 },
    "Nha Trang": { lat: 12.24406, lng: 109.09787 },
  };

  const handleCreateTrip = async () => {
    try {
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
        "http://localhost:3001/trip",
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
      handleCloseCreateTripDialog();
      setNotification({
        open: true,
        message: "Chuyến đi đã được tạo thành công",
        severity: "success",
      });
      if (viewCompany) {
        fetchTrips(viewCompany.companyId);
      }
    } catch (error) {
      console.error("Error creating trip:", error);
      setNotification({
        open: true,
        message:
          error.response?.data?.message ||
          "Không thể tạo chuyến đi. Vui lòng thử lại sau.",
        severity: "error",
      });
    }
  };

  const handleDeleteTrip = async (tripId) => {
    try {
      // Xóa chuyến đi
      await axios.delete(`http://localhost:3001/trip/${tripId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // Xóa các ghế liên quan đến chuyến đi
      await axios.delete(`http://localhost:3001/seats/trip/${tripId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setNotification({
        open: true,
        message: "Chuyến đi và các ghế liên quan đã được xóa thành công",
        severity: "success",
      });

      if (viewCompany) {
        fetchTrips(viewCompany.companyId);
        fetchVehicles(viewCompany.companyId);
      }
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
  const handleDeleteVehicle = async (vehicleId) => {
    try {
      // Xóa xe
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
      if (viewCompany) {
        fetchVehicles(viewCompany.companyId);
      }
    } catch (error) {
      console.error("Lỗi khi xóa xe:", error);
      setNotification({
        open: true,
        message:
          error.response?.data?.message ||
          "Không thể xóa xe. Vui lòng thử lại sau.",
        severity: "error",
      });
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
      if (viewCompany) {
        fetchVehicles(viewCompany.companyId);
      }
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
  const handleUpdateTrip = async () => {
    try {
      setIsSubmitting(true);
      setFormErrors({});

      const [depDay, depMonth, depYear] = editTrip.departureDate.split("-");
      const [depHour, depMinute] = editTrip.departureHour.split(":");
      const localDepartureDate = new Date(
        depYear,
        depMonth - 1,
        depDay,
        depHour,
        depMinute,
        0
      );
      const departureTime = localDepartureDate.toISOString();

      const [arrDay, arrMonth, arrYear] = editTrip.arrivalDate.split("-");
      const [arrHour, arrMinute] = editTrip.arrivalHour.split(":");
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
        vehicleId: editTrip.vehicleId,
        driverId: editTrip.driverId,
        departurePoint: editTrip.departurePoint,
        departureLatitude: Number(editTrip.departureLatitude),
        departureLongtitude: Number(editTrip.departureLongtitude),
        destinationPoint: editTrip.destinationPoint,
        destinationLatitude: Number(editTrip.destinationLatitude),
        destinationLongtitude: Number(editTrip.destinationLongtitude),
        departureTime,
        arrivalTime,
        price: Number(editTrip.price),
        status: editTrip.status,
      };

      const response = await axios.put(
        `http://localhost:3001/trip/${editTrip.tripId}`,
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
            "Không thể cập nhật chuyến đi vì tài xế hoặc xe đã được phân công.",
          severity: "warning",
        });
        return;
      }

      setOpenEditTripDialog(false);
      setNotification({
        open: true,
        message: "Chuyến đi đã được cập nhật thành công",
        severity: "success",
      });
      if (viewCompany) {
        fetchTrips(viewCompany.companyId);
      }
    } catch (error) {
      console.error("Error updating trip:", error);
      setNotification({
        open: true,
        message:
          error.response?.data?.message ||
          "Không thể cập nhật chuyến đi. Vui lòng thử lại sau.",
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" my={4}>
        <Typography color="error" variant="h6">
          {error}
        </Typography>
        <Button variant="contained" onClick={fetchCompanies} sx={{ mt: 2 }}>
          Thử lại
        </Button>
      </Box>
    );
  }

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5" component="h2" className="font-bold uppercase">
          Quản lý Bến Xe
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Thêm Bến xe mới
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="companies table">
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell>
                <strong>ID</strong>
              </TableCell>
              <TableCell>
                <strong>Tên công ty</strong>
              </TableCell>
              <TableCell>
                <strong>Số điện thoại</strong>
              </TableCell>
              <TableCell>
                <strong>Địa chỉ</strong>
              </TableCell>
              <TableCell>
                <strong>Hành động</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {companies.length > 0 ? (
              companies.map((company) => (
                <TableRow
                  key={company._id || company.companyId}
                  sx={{
                    "&:hover": {
                      backgroundColor: "#f9f9f9",
                      cursor: "pointer",
                    },
                  }}
                  onClick={() => handleOpenViewDialog(company)}
                >
                  <TableCell>{company.companyId}</TableCell>
                  <TableCell>{company.companyName}</TableCell>
                  <TableCell>{company.phone}</TableCell>
                  <TableCell>{company.address}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<EditIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEditDialog(company);
                      }}
                    >
                      Chỉnh sửa
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body1" sx={{ py: 2 }}>
                    Không có dữ liệu công ty nào
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Thêm công ty mới</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              name="companyId"
              label="ID công ty"
              fullWidth
              margin="normal"
              value={newCompany.companyId}
              onChange={handleInputChange}
              required
            />
            <TextField
              name="companyName"
              label="Tên công ty"
              fullWidth
              margin="normal"
              value={newCompany.companyName}
              onChange={handleInputChange}
              required
            />
            <TextField
              name="phone"
              label="Số điện thoại"
              fullWidth
              margin="normal"
              value={newCompany.phone}
              onChange={handleInputChange}
              required
            />
            <TextField
              name="address"
              label="Địa chỉ"
              fullWidth
              margin="normal"
              value={newCompany.address}
              onChange={handleInputChange}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button
            onClick={handleCreateCompany}
            variant="contained"
            color="primary"
            disabled={
              !newCompany.companyId ||
              !newCompany.companyName ||
              !newCompany.phone ||
              !newCompany.address
            }
          >
            Tạo
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openEditDialog}
        onClose={handleCloseEditDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Chỉnh sửa công ty</DialogTitle>
        <DialogContent>
          {editCompany && (
            <Box component="form" sx={{ mt: 2 }}>
              <TextField
                name="companyId"
                label="ID công ty"
                fullWidth
                margin="normal"
                value={editCompany.companyId}
                onChange={handleEditInputChange}
                disabled
              />
              <TextField
                name="companyName"
                label="Tên công ty"
                fullWidth
                margin="normal"
                value={editCompany.companyName}
                onChange={handleEditInputChange}
                required
              />
              <TextField
                name="phone"
                label="Số điện thoại"
                fullWidth
                margin="normal"
                value={editCompany.phone}
                onChange={handleEditInputChange}
                required
              />
              <TextField
                name="address"
                label="Địa chỉ"
                fullWidth
                margin="normal"
                value={editCompany.address}
                onChange={handleEditInputChange}
                required
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Hủy</Button>
          <Button
            onClick={handleUpdateCompany}
            variant="contained"
            color="primary"
            disabled={
              !editCompany?.companyName ||
              !editCompany?.phone ||
              !editCompany?.address
            }
          >
            Cập nhật
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openViewDialog}
        onClose={handleCloseViewDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Chi tiết công ty</DialogTitle>
        <DialogContent>
          {viewCompany && (
            <>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body1">
                  <strong>ID công ty:</strong> {viewCompany.companyId}
                </Typography>
                <Typography variant="body1">
                  <strong>Tên công ty:</strong> {viewCompany.companyName}
                </Typography>
                <Typography variant="body1">
                  <strong>Số điện thoại:</strong> {viewCompany.phone}
                </Typography>
                <Typography variant="body1">
                  <strong>Địa chỉ:</strong> {viewCompany.address}
                </Typography>
              </Box>

              <Box sx={{ mt: 4 }}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                >
                  <Typography variant="h6">Danh sách xe công ty</Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      setNewVehicle({
                        vehicleId: "",
                        companyId: viewCompany.companyId,
                        lisencePlate: "",
                        vehicleType: "",
                        seatCount: "",
                        availableSeats: "",
                      });
                      setOpenCreateVehicleDialog(true);
                    }}
                  >
                    Thêm xe mới
                  </Button>
                </Box>
                {vehiclesLoading ? (
                  <Box display="flex" justifyContent="center" my={2}>
                    <CircularProgress />
                  </Box>
                ) : vehiclesError ? (
                  <Typography color="error" variant="body1">
                    {vehiclesError}
                  </Typography>
                ) : vehicles.length > 0 ? (
                  <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="vehicles table">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                          <TableCell>
                            <strong>ID xe</strong>
                          </TableCell>
                          <TableCell>
                            <strong>Biển số xe</strong>
                          </TableCell>
                          <TableCell>
                            <strong>Loại xe</strong>
                          </TableCell>
                          <TableCell>
                            <strong>Số ghế</strong>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {vehicles.map((vehicle) => (
                          <TableRow
                            key={vehicle._id || vehicle.vehicleId}
                            sx={{ "&:hover": { backgroundColor: "#f9f9f9" } }}
                          >
                            <TableCell>{vehicle.vehicleId}</TableCell>
                            <TableCell>{vehicle.lisencePlate}</TableCell>
                            <TableCell>{vehicle.vehicleType}</TableCell>
                            <TableCell>
                              {vehicle.availableSeats}/{vehicle.seatCount}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outlined"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteVehicle(vehicle.vehicleId);
                                }}
                              >
                                Xóa
                              </Button>
                              <Button
                                variant="outlined"
                                color="primary"
                                startIcon={<EditIcon />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditVehicle(vehicle);
                                  setOpenEditVehicleDialog(true);
                                }}
                                sx={{ mr: 1 }}
                              >
                                Chỉnh sửa
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body1">
                    Không có xe nào thuộc công ty này.
                  </Typography>
                )}
              </Box>

              <Box sx={{ mt: 4 }}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                >
                  <Typography variant="h6">Chuyến đi</Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleOpenCreateTripDialog}
                  >
                    Thêm chuyến đi mới
                  </Button>
                </Box>
                {tripsLoading ? (
                  <Box display="flex" justifyContent="center" my={2}>
                    <CircularProgress />
                  </Box>
                ) : tripsError ? (
                  <Typography color="error" variant="body1">
                    {tripsError}
                  </Typography>
                ) : trips.length > 0 ? (
                  <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="departure table">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                          <TableCell>
                            <strong>ID chuyến đi</strong>
                          </TableCell>
                          <TableCell>
                            <strong>ID Xe</strong>
                          </TableCell>
                          <TableCell>
                            <strong>Giờ khởi hành</strong>
                          </TableCell>
                          <TableCell>
                            <strong>Điểm khởi hành</strong>
                          </TableCell>
                          <TableCell>
                            <strong>Điểm đến</strong>
                          </TableCell>
                          <TableCell>
                            <strong>Giờ đến</strong>
                          </TableCell>
                          <TableCell>
                            <strong>Hành động</strong>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {trips.map((trip) => {
                          const departureDate = new Date(trip.departureTime);
                          const arrivalDate = new Date(trip.arrivalTime);

                          const formatUTCTime = (date) => {
                            const day = String(date.getUTCDate()).padStart(
                              2,
                              "0"
                            );
                            const month = String(
                              date.getUTCMonth() + 1
                            ).padStart(2, "0");
                            const year = date.getUTCFullYear();
                            const hours = String(date.getUTCHours()).padStart(
                              2,
                              "0"
                            );
                            const minutes = String(
                              date.getUTCMinutes()
                            ).padStart(2, "0");
                            return `${hours}:${minutes} ${day}/${month}/${year}`;
                          };

                          return (
                            <TableRow
                              key={trip._id || trip.tripId}
                              sx={{ "&:hover": { backgroundColor: "#f9f9f9" } }}
                            >
                              <TableCell>{trip.tripId}</TableCell>
                              <TableCell>{trip.vehicleId}</TableCell>
                              <TableCell>
                                {formatUTCTime(departureDate)}
                              </TableCell>
                              <TableCell>{trip.departurePoint}</TableCell>
                              <TableCell>{trip.destinationPoint}</TableCell>
                              <TableCell>
                                {formatUTCTime(arrivalDate)}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="outlined"
                                  color="error"
                                  startIcon={<DeleteIcon />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteTrip(trip.tripId);
                                  }}
                                >
                                  Xóa
                                </Button>
                                <Button
                                  variant="outlined"
                                  color="primary"
                                  startIcon={<EditIcon />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditTrip({
                                      ...trip,
                                      departureDate: trip.departureTime
                                        .split("T")[0]
                                        .split("-")
                                        .reverse()
                                        .join("-"),
                                      departureHour: trip.departureTime
                                        .split("T")[1]
                                        .slice(0, 5),
                                      arrivalDate: trip.arrivalTime
                                        .split("T")[0]
                                        .split("-")
                                        .reverse()
                                        .join("-"),
                                      arrivalHour: trip.arrivalTime
                                        .split("T")[1]
                                        .slice(0, 5),
                                    });
                                    setOpenEditTripDialog(true);
                                  }}
                                  sx={{ mr: 1 }}
                                >
                                  Chỉnh sửa
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body1">
                    Không có chuyến đi nào thuộc công ty này.
                  </Typography>
                )}
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>Đóng</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openCreateTripDialog}
        onClose={handleCloseCreateTripDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Tạo Tuyến Đi Xe</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              name="tripId"
              label="ID chuyến đi"
              fullWidth
              margin="normal"
              value={newTrip.tripId}
              onChange={handleTripInputChange}
              required
            />
            <TextField
              name="vehicleId"
              label="ID xe"
              fullWidth
              margin="normal"
              value={newTrip.vehicleId}
              onChange={handleTripInputChange}
              required
            />
            <TextField
              name="companyId"
              label="ID công ty"
              fullWidth
              margin="normal"
              value={newTrip.companyId}
              onChange={handleTripInputChange}
              required
              disabled
            />
            <TextField
              name="driverId"
              label="ID tài xế"
              fullWidth
              margin="normal"
              value={newTrip.driverId}
              onChange={handleTripInputChange}
              required
            />
            <TextField
              name="departurePoint"
              label="Điểm khởi hành"
              select
              fullWidth
              margin="normal"
              value={newTrip.departurePoint}
              onChange={handleTripInputChange}
              required
            >
              <MenuItem value="Đà Nẵng">Đà Nẵng</MenuItem>
              <MenuItem value="Huế">Huế</MenuItem>
              <MenuItem value="Quảng Ngãi">Quảng Ngãi</MenuItem>
              <MenuItem value="Bình Định">Bình Định</MenuItem>
              <MenuItem value="Phú Yên">Phú Yên</MenuItem>
              <MenuItem value="Nha Trang">Nha Trang</MenuItem>
            </TextField>
            <TextField
              name="destinationPoint"
              label="Điểm đến"
              select
              fullWidth
              margin="normal"
              value={newTrip.destinationPoint}
              onChange={handleTripInputChange}
              required
            >
              <MenuItem value="Đà Nẵng">Đà Nẵng</MenuItem>
              <MenuItem value="Huế">Huế</MenuItem>
              <MenuItem value="Quảng Ngãi">Quảng Ngãi</MenuItem>
              <MenuItem value="Bình Định">Bình Định</MenuItem>
              <MenuItem value="Phú Yên">Phú Yên</MenuItem>
              <MenuItem value="Nha Trang">Nha Trang</MenuItem>
            </TextField>
            <TextField
              name="departureDate"
              label="Ngày khởi hành (DD-MM-YYYY)"
              fullWidth
              margin="normal"
              value={newTrip.departureDate}
              onChange={handleTripInputChange}
              required
              placeholder="05-04-2025"
              inputProps={{ pattern: "\\d{2}-\\d{2}-\\d{4}" }}
              error={
                !newTrip.departureDate &&
                !/^\d{2}-\d{2}-\d{4}$/.test(newTrip.departureDate)
              }
              helperText={
                newTrip.departureDate &&
                !/^\d{2}-\d{2}-\d{4}$/.test(newTrip.departureDate)
                  ? "Phải có định dạng DD-MM-YYYY (ví dụ: 05-04-2025)"
                  : ""
              }
            />
            <TextField
              name="departureHour"
              label="Giờ khởi hành (HH:MM)"
              fullWidth
              margin="normal"
              value={newTrip.departureHour}
              onChange={handleTripInputChange}
              required
              placeholder="10:00"
              inputProps={{ pattern: "([0-1]?[0-9]|2[0-3]):[0-5][0-9]" }}
              error={
                !newTrip.departureHour &&
                !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(newTrip.departureHour)
              }
              helperText={
                newTrip.departureHour &&
                !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(newTrip.departureHour)
                  ? "Phải có định dạng HH:MM (ví dụ: 10:00)"
                  : ""
              }
            />
            <TextField
              name="arrivalDate"
              label="Ngày đến (DD-MM-YYYY)"
              fullWidth
              margin="normal"
              value={newTrip.arrivalDate}
              onChange={handleTripInputChange}
              required
              placeholder="05-04-2025"
              inputProps={{ pattern: "\\d{2}-\\d{2}-\\d{4}" }}
              error={
                !newTrip.arrivalDate &&
                !/^\d{2}-\d{2}-\d{4}$/.test(newTrip.arrivalDate)
              }
              helperText={
                newTrip.arrivalDate &&
                !/^\d{2}-\d{2}-\d{4}$/.test(newTrip.arrivalDate)
                  ? "Phải có định dạng DD-MM-YYYY (ví dụ: 05-04-2025)"
                  : ""
              }
            />
            <TextField
              name="arrivalHour"
              label="Giờ đến (HH:MM)"
              fullWidth
              margin="normal"
              value={newTrip.arrivalHour}
              onChange={handleTripInputChange}
              required
              placeholder="12:00"
              inputProps={{ pattern: "([0-1]?[0-9]|2[0-3]):[0-5][0-9]" }}
              error={
                !newTrip.arrivalHour &&
                !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(newTrip.arrivalHour)
              }
              helperText={
                newTrip.arrivalHour &&
                !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(newTrip.arrivalHour)
                  ? "Phải có định dạng HH:MM (ví dụ: 12:00)"
                  : ""
              }
            />
            <TextField
              name="price"
              label="Giá vé"
              type="number"
              fullWidth
              margin="normal"
              value={newTrip.price}
              onChange={handleTripInputChange}
              required
              error={
                !newTrip.price !== "" &&
                (isNaN(newTrip.price) || newTrip.price <= 0)
              }
              helperText={
                newTrip.price !== "" &&
                (isNaN(newTrip.price) || newTrip.price <= 0)
                  ? "Giá vé phải là một số lớn hơn 0"
                  : ""
              }
              inputProps={{ min: 1 }}
            />
            <TextField
              name="status"
              label="Trạng thái"
              select
              fullWidth
              margin="normal"
              value={newTrip.status}
              onChange={handleTripInputChange}
              required
            >
              <MenuItem value="PENDING">Đang chờ</MenuItem>
              <MenuItem value="IN_PROGRESS">Đang tiến hành</MenuItem>
              <MenuItem value="COMPLETED">Đã hoàn thành</MenuItem>
              <MenuItem value="CANCELLED">Đã hủy</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateTripDialog}>Hủy</Button>
          <Button
            onClick={handleCreateTrip}
            variant="contained"
            color="primary"
            disabled={
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
              !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(newTrip.arrivalHour) ||
              isNaN(newTrip.price) ||
              newTrip.price <= 0
            }
          >
            Tạo
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openCreateVehicleDialog}
        onClose={handleCloseCreateVehicleDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Tạo Xe Mới</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              name="vehicleId"
              label="ID xe"
              fullWidth
              margin="normal"
              value={newVehicle.vehicleId}
              onChange={handleVehicleInputChange}
              required
            />
            <TextField
              name="companyId"
              label="ID công ty"
              fullWidth
              margin="normal"
              value={newVehicle.companyId}
              onChange={handleVehicleInputChange}
              required
              disabled
            />
            <TextField
              name="lisencePlate"
              label="Biển số xe"
              fullWidth
              margin="normal"
              value={newVehicle.lisencePlate}
              onChange={handleVehicleInputChange}
              required
            />
            <TextField
              name="vehicleType"
              label="Loại xe"
              select
              fullWidth
              margin="normal"
              value={newVehicle.vehicleType}
              onChange={handleVehicleInputChange}
              required
            >
              <MenuItem value="GIUONGNAM">GIUONGNAM</MenuItem>
              <MenuItem value="NGOI">NGOI</MenuItem>
            </TextField>
            <TextField
              name="seatCount"
              label="Tổng số ghế"
              type="number"
              fullWidth
              margin="normal"
              value={newVehicle.seatCount}
              onChange={handleVehicleInputChange}
              required
              error={
                newVehicle.seatCount !== "" &&
                (isNaN(newVehicle.seatCount) || newVehicle.seatCount <= 0)
              }
              helperText={
                newVehicle.seatCount !== "" &&
                (isNaN(newVehicle.seatCount) || newVehicle.seatCount <= 0)
                  ? "Tổng số ghế phải là một số lớn hơn 0"
                  : ""
              }
              inputProps={{ min: 1 }}
            />
            <TextField
              name="availableSeats"
              label="Số ghế trống"
              type="number"
              fullWidth
              margin="normal"
              value={newVehicle.availableSeats}
              onChange={handleVehicleInputChange}
              required
              error={
                newVehicle.availableSeats !== "" &&
                (isNaN(newVehicle.availableSeats) ||
                  newVehicle.availableSeats < 0 ||
                  (newVehicle.seatCount &&
                    newVehicle.availableSeats > newVehicle.seatCount))
              }
              helperText={
                newVehicle.availableSeats !== "" &&
                (isNaN(newVehicle.availableSeats) ||
                  newVehicle.availableSeats < 0)
                  ? "Số ghế trống phải là một số không âm"
                  : newVehicle.seatCount &&
                    newVehicle.availableSeats > newVehicle.seatCount
                  ? "Số ghế trống không thể lớn hơn tổng số ghế"
                  : ""
              }
              inputProps={{ min: 0 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseCreateVehicleDialog}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            onClick={handleCreateVehicle}
            variant="contained"
            color="primary"
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
          >
            {isSubmitting ? <CircularProgress size={24} /> : "Tạo"}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openEditVehicleDialog}
        onClose={() => setOpenEditVehicleDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Chỉnh sửa Xe</DialogTitle>
        <DialogContent>
          {editVehicle && (
            <Box component="form" sx={{ mt: 2 }}>
              <TextField
                name="vehicleId"
                label="ID xe"
                fullWidth
                margin="normal"
                value={editVehicle.vehicleId}
                disabled
              />
              <TextField
                name="companyId"
                label="ID công ty"
                fullWidth
                margin="normal"
                value={editVehicle.companyId}
                disabled
              />
              <TextField
                name="lisencePlate"
                label="Biển số xe"
                fullWidth
                margin="normal"
                value={editVehicle.lisencePlate}
                onChange={(e) =>
                  setEditVehicle({
                    ...editVehicle,
                    lisencePlate: e.target.value,
                  })
                }
                required
              />
              <TextField
                name="vehicleType"
                label="Loại xe"
                select
                fullWidth
                margin="normal"
                value={editVehicle.vehicleType}
                onChange={(e) =>
                  setEditVehicle({
                    ...editVehicle,
                    vehicleType: e.target.value,
                  })
                }
                required
              >
                <MenuItem value="GIUONGNAM">GIUONGNAM</MenuItem>
                <MenuItem value="NGOI">NGOI</MenuItem>
              </TextField>
              <TextField
                name="seatCount"
                label="Tổng số ghế"
                type="number"
                fullWidth
                margin="normal"
                value={editVehicle.seatCount}
                onChange={(e) =>
                  setEditVehicle({
                    ...editVehicle,
                    seatCount: Number(e.target.value),
                  })
                }
                required
                error={
                  isNaN(editVehicle.seatCount) || editVehicle.seatCount <= 0
                }
                helperText={
                  isNaN(editVehicle.seatCount) || editVehicle.seatCount <= 0
                    ? "Tổng số ghế phải là một số lớn hơn 0"
                    : ""
                }
                inputProps={{ min: 1 }}
              />
              <TextField
                name="availableSeats"
                label="Số ghế trống"
                type="number"
                fullWidth
                margin="normal"
                value={editVehicle.availableSeats}
                onChange={(e) =>
                  setEditVehicle({
                    ...editVehicle,
                    availableSeats: Number(e.target.value),
                  })
                }
                required
                error={
                  isNaN(editVehicle.availableSeats) ||
                  editVehicle.availableSeats < 0 ||
                  editVehicle.availableSeats > editVehicle.seatCount
                }
                helperText={
                  isNaN(editVehicle.availableSeats) ||
                  editVehicle.availableSeats < 0
                    ? "Số ghế trống phải là một số không âm"
                    : editVehicle.availableSeats > editVehicle.seatCount
                    ? "Số ghế trống không thể lớn hơn tổng số ghế"
                    : ""
                }
                inputProps={{ min: 0 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenEditVehicleDialog(false)}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            onClick={handleUpdateVehicle}
            variant="contained"
            color="primary"
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
          >
            {isSubmitting ? <CircularProgress size={24} /> : "Cập nhật"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openEditTripDialog}
        onClose={() => setOpenEditTripDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Chỉnh sửa Chuyến Đi</DialogTitle>
        <DialogContent>
          {editTrip && (
            <Box component="form" sx={{ mt: 2 }}>
              <TextField
                name="tripId"
                label="ID chuyến đi"
                fullWidth
                margin="normal"
                value={editTrip.tripId}
                disabled
              />
              <TextField
                name="vehicleId"
                label="ID xe"
                fullWidth
                margin="normal"
                value={editTrip.vehicleId}
                onChange={(e) =>
                  setEditTrip({ ...editTrip, vehicleId: e.target.value })
                }
                required
              />
              <TextField
                name="companyId"
                label="ID công ty"
                fullWidth
                margin="normal"
                value={editTrip.companyId}
                disabled
              />
              <TextField
                name="driverId"
                label="ID tài xế"
                fullWidth
                margin="normal"
                value={editTrip.driverId}
                onChange={(e) =>
                  setEditTrip({ ...editTrip, driverId: e.target.value })
                }
                required
              />
              <TextField
                name="departurePoint"
                label="Điểm khởi hành"
                select
                fullWidth
                margin="normal"
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
                required
              >
                <MenuItem value="Đà Nẵng">Đà Nẵng</MenuItem>
                <MenuItem value="Huế">Huế</MenuItem>
                <MenuItem value="Quảng Ngãi">Quảng Ngãi</MenuItem>
                <MenuItem value="Bình Định">Bình Định</MenuItem>
                <MenuItem value="Phú Yên">Phú Yên</MenuItem>
                <MenuItem value="Nha Trang">Nha Trang</MenuItem>
              </TextField>
              <TextField
                name="destinationPoint"
                label="Điểm đến"
                select
                fullWidth
                margin="normal"
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
                required
              >
                <MenuItem value="Đà Nẵng">Đà Nẵng</MenuItem>
                <MenuItem value="Huế">Huế</MenuItem>
                <MenuItem value="Quảng Ngãi">Quảng Ngãi</MenuItem>
                <MenuItem value="Bình Định">Bình Định</MenuItem>
                <MenuItem value="Phú Yên">Phú Yên</MenuItem>
                <MenuItem value="Nha Trang">Nha Trang</MenuItem>
              </TextField>
              <TextField
                name="departureDate"
                label="Ngày khởi hành (DD-MM-YYYY)"
                fullWidth
                margin="normal"
                value={editTrip.departureDate}
                onChange={(e) =>
                  setEditTrip({ ...editTrip, departureDate: e.target.value })
                }
                required
                placeholder="05-04-2025"
                inputProps={{ pattern: "\\d{2}-\\d{2}-\\d{4}" }}
                error={!/^\d{2}-\d{2}-\d{4}$/.test(editTrip.departureDate)}
                helperText={
                  !/^\d{2}-\d{2}-\d{4}$/.test(editTrip.departureDate)
                    ? "Phải có định dạng DD-MM-YYYY (ví dụ: 05-04-2025)"
                    : ""
                }
              />
              <TextField
                name="departureHour"
                label="Giờ khởi hành (HH:MM)"
                fullWidth
                margin="normal"
                value={editTrip.departureHour}
                onChange={(e) =>
                  setEditTrip({ ...editTrip, departureHour: e.target.value })
                }
                required
                placeholder="10:00"
                inputProps={{ pattern: "([0-1]?[0-9]|2[0-3]):[0-5][0-9]" }}
                error={
                  !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(
                    editTrip.departureHour
                  )
                }
                helperText={
                  !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(
                    editTrip.departureHour
                  )
                    ? "Phải có định dạng HH:MM (ví dụ: 10:00)"
                    : ""
                }
              />
              <TextField
                name="arrivalDate"
                label="Ngày đến (DD-MM-YYYY)"
                fullWidth
                margin="normal"
                value={editTrip.arrivalDate}
                onChange={(e) =>
                  setEditTrip({ ...editTrip, arrivalDate: e.target.value })
                }
                required
                placeholder="05-04-2025"
                inputProps={{ pattern: "\\d{2}-\\d{2}-\\d{4}" }}
                error={!/^\d{2}-\d{2}-\d{4}$/.test(editTrip.arrivalDate)}
                helperText={
                  !/^\d{2}-\d{2}-\d{4}$/.test(editTrip.arrivalDate)
                    ? "Phải có định dạng DD-MM-YYYY (ví dụ: 05-04-2025)"
                    : ""
                }
              />
              <TextField
                name="arrivalHour"
                label="Giờ đến (HH:MM)"
                fullWidth
                margin="normal"
                value={editTrip.arrivalHour}
                onChange={(e) =>
                  setEditTrip({ ...editTrip, arrivalHour: e.target.value })
                }
                required
                placeholder="12:00"
                inputProps={{ pattern: "([0-1]?[0-9]|2[0-3]):[0-5][0-9]" }}
                error={
                  !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(
                    editTrip.arrivalHour
                  )
                }
                helperText={
                  !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(
                    editTrip.arrivalHour
                  )
                    ? "Phải có định dạng HH:MM (ví dụ: 12:00)"
                    : ""
                }
              />
              <TextField
                name="price"
                label="Giá vé"
                type="number"
                fullWidth
                margin="normal"
                value={editTrip.price}
                onChange={(e) =>
                  setEditTrip({ ...editTrip, price: Number(e.target.value) })
                }
                required
                error={isNaN(editTrip.price) || editTrip.price <= 0}
                helperText={
                  isNaN(editTrip.price) || editTrip.price <= 0
                    ? "Giá vé phải là một số lớn hơn 0"
                    : ""
                }
                inputProps={{ min: 1 }}
              />
              <TextField
                name="status"
                label="Trạng thái"
                select
                fullWidth
                margin="normal"
                value={editTrip.status}
                onChange={(e) =>
                  setEditTrip({ ...editTrip, status: e.target.value })
                }
                required
              >
                <MenuItem value="PENDING">PENDING</MenuItem>
                <MenuItem value="COMPLETED">COMPLETED</MenuItem>
                <MenuItem value="CANCELLED">CANCELLED</MenuItem>
              </TextField>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditTripDialog(false)}>Hủy</Button>
          <Button
            onClick={handleUpdateTrip}
            variant="contained"
            color="primary"
            disabled={
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
              !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(editTrip.arrivalHour) ||
              isNaN(editTrip.price) ||
              editTrip.price <= 0
            }
          >
            Cập nhật
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ManageTrips;
