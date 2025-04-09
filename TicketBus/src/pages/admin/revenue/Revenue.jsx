// import React, { useState, useEffect } from "react";
// import axios from "axios";

// // Function to format number as VNĐ
// const formatVND = (amount) => {
//   return new Intl.NumberFormat("vi-VN", {
//     style: "currency",
//     currency: "VND",
//   }).format(amount);
// };

// const Revenue = () => {
//   const [revenueByDate, setRevenueByDate] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     fetchRevenue();
//   }, []);

//   const fetchRevenue = async () => {
//     setLoading(true);
//     setError(null);
//     const token = localStorage.getItem("token")
//     console.log("Token:", token);
//     try {
//       const response = await axios.get("http://localhost:3001/payments/revenues", {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("token")}`, // Ensure token is valid
//         },
//       });
//       console.log("Response data:", response.data);

//       const completedPayments = response.data.filter(
//         (payment) => payment.paymentStatus === "completed"
//       );

//       const revenueMap = {};
//       completedPayments.forEach((payment) => {
//         const date = new Date(payment.createdAt).toLocaleDateString("vi-VN");
//         if (!revenueMap[date]) {
//           revenueMap[date] = {
//             total: 0,
//             tickets: [],
//           };
//         }
//         revenueMap[date].total += payment.amount || 0;
//         revenueMap[date].tickets.push(payment);
//       });

//       setRevenueByDate(revenueMap);
//     } catch (err) {
//       console.error("Lỗi khi lấy dữ liệu doanh thu:", err);
//       setError(
//         err.response?.data?.message || "Không thể kết nối đến server. Vui lòng kiểm tra backend."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-4">
//       <h2 className="text-2xl font-bold mb-4">Doanh Thu</h2>

//       {loading && <p className="text-blue-500">Đang tải dữ liệu...</p>}
//       {error && <p className="text-red-500 mb-4">{error}</p>}

//       {!loading && Object.keys(revenueByDate).length > 0 ? (
//         <div className="grid gap-6">
//           {Object.entries(revenueByDate).map(([date, data]) => (
//             <div key={date} className="border p-4 rounded shadow">
//               <h3 className="text-lg font-semibold mb-2">Ngày: {date}</h3>
//               <p>
//                 <strong>Tổng doanh thu:</strong> {formatVND(data.total)}
//               </p>
//               <p>
//                 <strong>Số vé bán được:</strong> {data.tickets.length}
//               </p>
//               <div className="mt-2">
//                 <strong>Chi tiết vé:</strong>
//                 <ul className="list-disc pl-5">
//                   {data.tickets.map((ticket) => (
//                     <li key={ticket._id}>
//                       Ticket ID: {ticket.ticketId} - {formatVND(ticket.amount)}
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             </div>
//           ))}
//         </div>
//       ) : (
//         !loading && <p className="text-gray-500">Không có doanh thu từ vé đã thanh toán.</p>
//       )}
//     </div>
//   );
// };

// export default Revenue;