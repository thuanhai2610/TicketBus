/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import TopLayout from "../../layout/toppage/TopLayout";
import RootLayout from "../../layout/RootLayout";
import Search from "../home/hero/search/Search";
import { motion } from "framer-motion";
import SearchResult from "./searchresult/SearchResult";
import bgImage from "../../assets/bgimg.png";
import { useLocation } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";
import markerIcon from "../../assets/marker-icon.png";
import markerShadow from "../../assets/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const Ticket = () => {
  const [trips, setTrips] = useState([]);
  const [showMap, setShowMap] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const [loading, setLoading] = useState(false);
  const [notificationModal, setNotificationModal] = useState({
    show: false,
    message: "",
    type: "error",
  });
  const location = useLocation();
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchTrips = async (from, to, date) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/trip/search?departurePoint=${encodeURIComponent(
          from
        )}&destinationPoint=${encodeURIComponent(to)}&date=${date}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      if (!response.ok) throw new Error("Không thể tìm kiếm chuyến xe, vui lòng thử lại");
      const data = await response.json();
      setTrips(data);
      setShowMap(data && data.length > 0);
      if (data && data.length > 0) {
        setTimeout(() => updateMap(data), 100);
      }
    } catch (error) {
      setNotificationModal({
        show: true,
        message: "Không thể tìm kiếm chuyến xe! Vui lòng thử lại.",
        type: "error",
      });
      setTrips([]);
      setShowMap(false);
    } finally {
      setLoading(false);
    }
  };

  const updateMap = (tripData) => {
    if (!mapRef.current) return;

    if (!leafletMapRef.current) {
      leafletMapRef.current = L.map(mapRef.current, {
        doubleClickZoom: true,
        boxZoom: false,
        keyboard: false,
        tap: isMobile,
        zoomControl: true,
      }).setView([16.0544, 108.2022], 4);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(leafletMapRef.current);
    } else {
      leafletMapRef.current.invalidateSize();
    }

    if (leafletMapRef.current._routing) {
      try {
        leafletMapRef.current.removeControl(leafletMapRef.current._routing);
      } catch (err) {
        console.warn("Không thể xóa routing control:", err);
      }
      leafletMapRef.current._routing = null;
    }

    if (tripData && tripData.length > 0) {
      const trip = tripData[0];
      if (
        trip.departureLatitude &&
        trip.departureLongtitude &&
        trip.destinationLatitude &&
        trip.destinationLongtitude
      ) {
        const routingControl = L.Routing.control({
          waypoints: [
            L.latLng(trip.departureLatitude, trip.departureLongtitude),
            L.latLng(trip.destinationLatitude, trip.destinationLongtitude),
          ],
          lineOptions: {
            styles: [{ color: "#2563eb", weight: 4 }],
          },
          routeWhileDragging: false,
          show: false,
          addWaypoints: false,
        }).addTo(leafletMapRef.current);

        leafletMapRef.current._routing = routingControl;
        leafletMapRef.current.fitBounds([
          [trip.departureLatitude, trip.departureLongtitude],
          [trip.destinationLatitude, trip.destinationLongtitude],
        ]);
      } else {
        console.warn("Trip data missing required coordinate information:", trip);
      }
    }
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const departurePoint = searchParams.get("departurePoint");
    const destinationPoint = searchParams.get("destinationPoint");
    const date = searchParams.get("date");

    if (departurePoint && destinationPoint && date) {
      fetchTrips(departurePoint, destinationPoint, date);
    } else {
      setShowMap(false);
      setTrips([]);
    }
  }, [location.search]);

  useEffect(() => {
    return () => {
      if (leafletMapRef.current) {
        if (leafletMapRef.current._routing) {
          leafletMapRef.current.removeControl(leafletMapRef.current._routing);
          leafletMapRef.current._routing = null;
        }
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  const handleSearch = (results) => {
    setTrips(results);
    setShowMap(results && results.length > 0);
    if (results && results.length > 0) {
      setTimeout(() => updateMap(results), 100);
    }
  };

  const NotificationModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={`bg-white dark:bg-primary rounded-lg shadow-xl p-4 w-11/12 max-w-sm ${
          isMobile ? "mx-4" : ""
        }`}
      >
        <h3 className="text-lg font-semibold mb-4 text-red-500 dark:text-red-400">Lỗi</h3>
        <p className="text-sm text-gray-600 dark:text-neutral-300 mb-6">
          {notificationModal.message}
        </p>
        <div className="flex justify-end">
          <button
            onClick={() => setNotificationModal({ show: false, message: "", type: "error" })}
            className="px-4 py-1.5 bg-primary hover:bg-primaryblue text-white rounded-lg text-sm"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );

  const DesktopTicket = (
    <div className="w-full space-y-12 pb-16 bg-gray-50 dark:bg-gray-900">
      <TopLayout bgImg={bgImage} title="Đặt Vé Của Bạn" />
      <RootLayout className="space-y-8 relative z-0 w-full mx-auto">
        <Search onSearchResults={handleSearch} />
        <div className="w-full flex flex-row gap-6 px-4">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center text-primary dark:text-neutral-50 text-lg">
              Đang tìm kiếm chuyến xe...
            </div>
          )}
          {showMap && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: -150 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ duration: 1, ease: "easeInOut" }}
              className="w-1/3"
            >
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 text-center mb-4">
                Bản Đồ Tuyến Đường
              </h3>
              <div
                ref={mapRef}
                className="w-full rounded-xl shadow-md bg-white dark:bg-gray-900"
                style={{ height: "600px" }}
              />
            </motion.div>
          )}
          <div className={`transition-all duration-500 ${showMap ? "w-2/3" : "w-full"}`}>
            {token && <SearchResult trips={trips} />}
          </div>
        </div>
      </RootLayout>
      {notificationModal.show && <NotificationModal />}
    </div>
  );

  const MobileTicket = (
    <div className="w-full space-y-8 pb-12 bg-white dark:bg-primary">
      <TopLayout bgImg={bgImage} title="Đặt Vé" />
      <RootLayout className="space-y-6 relative z-0 max-w-md mx-auto px-4">
        <Search onSearchResults={handleSearch} />
        <div className="w-full flex flex-col gap-6">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center text-primary dark:text-neutral-50 text-base">
              Đang tìm kiếm...
            </div>
          )}
          {showMap && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: -170 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="w-full"
            >
              <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-50 text-center mb-3">
                Bản Đồ Tuyến Đường
              </h3>
              <div
                ref={mapRef}
                className="w-full rounded-lg shadow-sm bg-white dark:bg-gray-900"
                style={{ height: "400px" }}
              />
            </motion.div>
          )}
          <div className="w-full">
            {token && <SearchResult trips={trips} />}
          </div>
        </div>
      </RootLayout>
      {notificationModal.show && <NotificationModal />}
    </div>
  );

  return isMobile ? MobileTicket : DesktopTicket;
};

export default Ticket;