/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openCreateCompanyDialog, setOpenCreateCompanyDialog] = useState(false);
  const [openEditCompanyDialog, setOpenEditCompanyDialog] = useState(false);
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

  useEffect(() => {
    fetchCompanies();
  }, []);

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
      await axios.post(`${import.meta.env.VITE_API_URL}/companies`, newCompany, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setOpenCreateCompanyDialog(false);
      setNewCompany({
        companyId: "",
        companyName: "",
        phone: "",
        address: "",
      });
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
        `${import.meta.env.VITE_API_URL}/companies/${editCompany._id}`,
        editCompany,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setOpenEditCompanyDialog(false);
      setEditCompany(null);
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
    <div className="p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h6 className="text-xl font-semibold">Danh sách Bến Xe</h6>
        <button
          className="bg-emerald-600 text-white px-4 py-2 rounded flex items-center hover:bg-emerald-700"
          onClick={() => setOpenCreateCompanyDialog(true)}
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
          Thêm Bến Xe Mới
        </button>
      </div>

      {/* Table */}
      <div className=" shadow-md rounded overflow-x-auto shadow-neutral-200">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-slate-500">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                Tên Bến Xe
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                Số Điện Thoại
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                Địa Chỉ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                Chỉnh Sửa
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-500">
            {companies.length > 0 ? (
              companies.map((company) => (
                <tr
                  key={company._id || company.companyId}
                  className="hover:bg-slate-600"
                >
                  <td className="px-6 py-4  text-sm text-gray-50">
                    {company.companyId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-50">
                    {company.companyName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-50">
                    {company.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-50">
                    {company.address}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      className="border border-blue-500 text-blue-400 px-3 py-1 rounded flex items-center hover:bg-blue-500 hover:text-white"
                      onClick={() => {
                        setEditCompany(company);
                        setOpenEditCompanyDialog(true);
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
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-4 text-center text-sm text-gray-200"
                >
                  Không có dữ liệu bến xe nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Company Dialog */}
      {openCreateCompanyDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-primary rounded-lg w-full max-w-md p-6 shadow-lg shadow-neutral-200">
            <h2 className="text-xl font-semibold mb-4 bg-primary text-center uppercase">Thêm Bến Xe Mới</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-50">
                  ID Bến Xe
                </label>
                <input
                  type="text"
                  name="companyId"
                  value={newCompany.companyId}
                  onChange={handleInputChange}
                  className="bg-transparent mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-50">
                  Tên Bến Xe
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={newCompany.companyName}
                  onChange={handleInputChange}
                  className="bg-transparent mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-50">
                  Số Điện Thoại
                </label>
                <input
                  type="text"
                  name="phone"
                  value={newCompany.phone}
                  onChange={handleInputChange}
                  className="bg-transparent mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-50">
                  Địa chỉ
                </label>
                <input
                  type="text"
                  name="address"
                  value={newCompany.address}
                  onChange={handleInputChange}
                  className="bg-transparent mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </form>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                className="px-4 py-2 text-neutral-50 bg-red-500 rounded hover:bg-red-700"
                onClick={() => setOpenCreateCompanyDialog(false)}
              >
                Hủy
              </button>
              <button
                className={`px-4 py-2 text-white bg-emerald-500 rounded hover:bg-emerald-700 ${
                  !newCompany.companyId ||
                  !newCompany.companyName ||
                  !newCompany.phone ||
                  !newCompany.address
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                onClick={handleCreateCompany}
                disabled={
                  !newCompany.companyId ||
                  !newCompany.companyName ||
                  !newCompany.phone ||
                  !newCompany.address
                }
              >
                Tạo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Company Dialog */}
      {openEditCompanyDialog && editCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-primary rounded-lg w-full max-w-md p-6 shadow-lg shadow-neutral-200">
            <h2 className="text-xl font-semibold mb-4 text-center uppercase">Chỉnh sửa Bến Xe</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-50">
                  ID Bến Xe
                  </label>
                  <input
                  type="text"
                  name="companyId"
                  value={editCompany.companyId}
                  onChange={handleEditInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-50">
                  Tên Bến Xe
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={editCompany.companyName}
                  onChange={handleEditInputChange}
                  className=" bg-transparent mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-50">
                  Số Điện Thoại
                </label>
                <input
                  type="text"
                  name="phone"
                  value={editCompany.phone}
                  onChange={handleEditInputChange}
                  className="bg-transparent mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-50">
                  Địa chỉ
                </label>
                <input
                  type="text"
                  name="address"
                  value={editCompany.address}
                  onChange={handleEditInputChange}
                  className="bg-transparent mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </form>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                className="px-4 py-2 text-gray-50 bg-red-500 rounded hover:bg-red-700"
                onClick={() => setOpenEditCompanyDialog(false)}
              >
                Hủy
              </button>
              <button
                className={`px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 ${
                  !editCompany?.companyName ||
                  !editCompany?.phone ||
                  !editCompany?.address
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                onClick={handleUpdateCompany}
                disabled={
                  !editCompany?.companyName ||
                  !editCompany?.phone ||
                  !editCompany?.address
                }
              >
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification.open && (
        <div
          className={`fixed bottom-4 right-4 p-4 rounded-md shadow-lg text-white ${
            notification.severity === "success" ? "bg-green-500" : "bg-red-500"
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

export default Companies;