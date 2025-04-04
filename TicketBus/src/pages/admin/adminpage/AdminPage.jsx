import React from "react";
import { Link } from "react-router-dom";
import { FaTicketAlt, FaBus, FaUsers, FaMoneyBillWave } from "react-icons/fa";

const AdminPage = () => {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800">Bảng điều khiển</h2>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-4 gap-6 mt-6">
        <Link to="/admin/buy-tickets" className="bg-white p-4 rounded-lg shadow-md flex items-center cursor-pointer">
          <FaTicketAlt className="text-red-500 text-3xl mr-3" />
          <div>
            <p className="text-gray-500">Vé đã bán</p>
            <h3 className="text-xl font-semibold">1,230</h3>
          </div>
        </Link>
        <Link to="/admin/revenue" className="bg-white p-4 rounded-lg shadow-md flex items-center cursor-pointer">
          <FaMoneyBillWave className="text-green-500 text-3xl mr-3" />
          <div>
            <p className="text-gray-500">Doanh thu</p>
            <h3 className="text-xl font-semibold">$23,450</h3>
          </div>
        </Link>
        <Link to="/admin/buses" className="bg-white p-4 rounded-lg shadow-md flex items-center cursor-pointer">
          <FaBus className="text-blue-500 text-3xl mr-3" />
          <div>
            <p className="text-gray-500">Chuyến xe</p>
            <h3 className="text-xl font-semibold">320</h3>
          </div>
        </Link>
        <Link to="/admin/manage-customers" className="bg-white p-4 rounded-lg shadow-md flex items-center cursor-pointer">
          <FaUsers className="text-purple-500 text-3xl mr-3" />
          <div>
            <p className="text-gray-500">Khách hàng</p>
            <h3 className="text-xl font-semibold">890</h3>
          </div>
        </Link>
      </div>

      {/* Danh sách chuyến xe */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Chuyến xe gần đây
        </h3>
        <table className="w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="p-3 border">Mã Chuyến</th>
              <th className="p-3 border">Tuyến</th>
              <th className="p-3 border">Số ghế</th>
              <th className="p-3 border">Giá vé</th>
              <th className="p-3 border">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            <tr className="text-center">
              <td className="p-3 border">
                <Link to="/admin/trip/*" className="text-blue-500 underline">BX1234</Link>
              </td>
              <td className="p-3 border">Hà Nội - Sài Gòn</td>
              <td className="p-3 border">45/50</td>
              <td className="p-3 border">$25</td>
              <td className="p-3 border text-green-500">Đang chạy</td>
            </tr>
            <tr className="text-center bg-gray-50">
              <td className="p-3 border">
                <Link to="/admin/trip/*" className="text-blue-500 underline">BX5678</Link>
              </td>
              <td className="p-3 border">Đà Nẵng - Hà Nội</td>
              <td className="p-3 border">30/40</td>
              <td className="p-3 border">$20</td>
              <td className="p-3 border text-red-500">Hủy chuyến</td>
            </tr>
            <tr className="text-center">
              <td className="p-3 border">
                <Link to="/admin/trip/*" className="text-blue-500 underline">BX91011</Link>
              </td>
              <td className="p-3 border">Hải Phòng - Vinh</td>
              <td className="p-3 border">38/45</td>
              <td className="p-3 border">$15</td>
              <td className="p-3 border text-green-500">Đang chạy</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPage;
