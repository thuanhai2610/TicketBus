import React, { useState } from "react";
import Companies from "./Companies";
import Vehicles from "./Vehicles";
import Trips from "./Trips";

const ManageTrips = () => {
  const [selectedSection, setSelectedSection] = useState("companies");

  return (
    <div className="bg-gray-900 text-white min-h-screen p-4">
      <h2 className="font-bold uppercase mb-4 text-3xl">
        Quản lý Hệ thống Bến Xe
      </h2>

      {/* Navigation Buttons */}
      <div className="flex space-x-2 mb-4 mt-8">
        <button
          onClick={() => setSelectedSection("companies")}
          className={`px-4 py-2 rounded-md transition-colors duration-200 ${
            selectedSection === "companies"
              ? "bg-primaryblue text-neutral-900"
              : "bg-gray-700 text-white"
          } hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-primaryblue`}
        >
          Quản lý Bến Xe
        </button>
        <button
          onClick={() => setSelectedSection("vehicles")}
          className={`px-4 py-2 rounded-md transition-colors duration-200 ${
            selectedSection === "vehicles"
              ? "bg-primaryblue text-neutral-900"
              : "bg-gray-700 text-white"
          } hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-primaryblue`}
        >
          Quản lý Xe
        </button>
        <button
          onClick={() => setSelectedSection("trips")}
          className={`px-4 py-2 rounded-md transition-colors duration-200 ${
            selectedSection === "trips"
              ? "bg-primaryblue text-neutral-900"
              : "bg-gray-700 text-white"
          } hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-primaryblue`}
        >
          Quản lý Chuyến Đi
        </button>
      </div>

      {/* Conditional Section Rendering */}
      {selectedSection === "companies" && <Companies />}
      {selectedSection === "vehicles" && <Vehicles />}
      {selectedSection === "trips" && <Trips />}
    </div>
  );
};

export default ManageTrips;
