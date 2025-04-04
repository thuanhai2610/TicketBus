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
import axios from "axios";

const ManageCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false); // New dialog for viewing details
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
  const [viewCompany, setViewCompany] = useState(null); // State for the company being viewed
  const [vehicles, setVehicles] = useState([]); // State to store vehicles
  const [vehiclesLoading, setVehiclesLoading] = useState(false); // Loading state for vehicles
  const [vehiclesError, setVehiclesError] = useState(null); // Error state for vehicles

  // Fetch companies from the backend
  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:3001/companies", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setCompanies(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching companies:", error);
      setError("Failed to load companies. Please try again later.");
      setLoading(false);
    }
  };

  // Fetch vehicles for a specific company
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
      setVehiclesError("Failed to load vehicles. Please try again later.");
      setVehiclesLoading(false);
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
    fetchVehicles(company.companyId); // Fetch vehicles when opening the view dialog
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setViewCompany(null);
    setVehicles([]); // Clear vehicles when closing the dialog
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
      console.log("Updating company with _id:", editCompany._id);
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
          Try Again
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
        <Typography variant="h5" component="h2">
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
                  sx={{ "&:hover": { backgroundColor: "#f9f9f9", cursor: "pointer" } }}
                  onClick={() => handleOpenViewDialog(company)} // Make the entire row clickable
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
                        e.stopPropagation(); // Prevent row click from triggering
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

      {/* Dialog for creating a new company */}
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

      {/* Dialog for editing a company */}
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

      {/* Dialog for viewing company details and vehicles */}
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
              {/* Company Details */}
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

              {/* Vehicles Section */}
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Danh sách xe của công ty
                </Typography>
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
                            <TableCell>{vehicle.seatCount}</TableCell>
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
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>Đóng</Button>
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

export default ManageCompanies;