import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { googleLogout } from "@react-oauth/google";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, LineChart, Line } from "recharts";
import PropertyList from "../components/Property/PropertyList";
import axiosClient from "../api/axiosClient";
import SearchProperty from "../components/Property/SearchProperty";

const HostDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("token");
    googleLogout();
    navigate("/");
  };

  const fetchProperties = async () => {
    try {
      const res = await axiosClient.get("api/properties/host/my-properties");
      setProperties(res.data);
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const total = properties.length;
  const avgPrice =
    total > 0
      ? (
          properties.reduce((sum, p) => sum + parseFloat(p.pricepernight), 0) /
          total
        ).toFixed(2)
      : 0;

  // Dummy chart data (replace with backend stats if available)
  const earningsData = [
    { month: "Jan", earnings: 54000 },
    { month: "Feb", earnings: 72000 },
    { month: "Mar", earnings: 68000 },
    { month: "Apr", earnings: 90000 },
    { month: "May", earnings: 85000 },
  ];

  const propertyData = properties.map((p) => ({
    name: p.name,
    price: parseFloat(p.pricepernight),
  }));

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-green-50 to-blue-50 min-h-screen">
      {/* ================= HEADER ================= */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-green-700">
            🏠 Host Dashboard
          </h1>
          <p className="text-gray-600 mt-2 text-sm md:text-base">
            Welcome back, host! Here’s an overview of your property performance.
          </p>
        </div>
        {/* <button
          onClick={handleLogout}
          className="mt-4 md:mt-0 bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-full shadow-md transition-all duration-300"
        >
          Logout
        </button> */}
        {/* <SearchProperty /> */}
      </header>

      {/* ================= SEARCH PROPERTIES ================= */}
      <section className="mt-10 bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          Explore All Properties
        </h2>
        <SearchProperty />
      </section>

      {/* ================= WIDGETS ================= */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
        {[
          {
            title: "Total Properties",
            value: loading ? "..." : total,
            color: "text-blue-600",
          },
          {
            title: "Average Price/Night",
            value: loading ? "..." : `KES ${avgPrice}`,
            color: "text-green-600",
          },
          {
            title: "Most Recent Property",
            value: loading ? "..." : properties[0]?.name || "—",
            color: "text-gray-700",
          },
          {
            title: "Last Updated",
            value: loading
              ? "..."
              : properties[0]?.updated_at
              ? new Date(properties[0].updated_at).toLocaleDateString()
              : "—",
            color: "text-gray-700",
          },
        ].map((card, idx) => (
          <div
            key={idx}
            className="bg-white p-6 rounded-2xl shadow-md flex flex-col items-center hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            <span className="text-gray-500 text-sm">{card.title}</span>
            <span className={`text-3xl font-bold mt-2 ${card.color}`}>
              {card.value}
            </span>
          </div>
        ))}
      </section>

      {/* ================= GRAPHS ================= */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-12">
        {/* Earnings Over Time */}
        <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            Earnings Overview
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={earningsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="earnings"
                stroke="#16a34a"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Price Comparison */}
        <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            Property Price Comparison
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={propertyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="price" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ================= PROPERTY LIST ================= */}
      {/* <section className="max-w-7xl mx-auto w-full mt-14 bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">
           Your Properties
        </h2>
        <PropertyList />
      </section> */}

      {/* ================= FOOTER ================= */}
      <footer className="text-center text-gray-500 mt-12 text-sm">
        © {new Date().getFullYear()} Host Dashboard · Built by Moses
      </footer>
    </div>
  );
};

export default HostDashboard;
