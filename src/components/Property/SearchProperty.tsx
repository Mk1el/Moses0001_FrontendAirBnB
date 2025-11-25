import React, { useState } from "react";
import axiosClient from "../../api/axiosClient";
import { Search, Filter } from "lucide-react";

interface Property {
  propertyId: string;
  hostId: string;
  hostEmail: string;
  name: string;
  description: string;
  location: string;
  pricePerNight: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

const SearchProperty: React.FC = () => {
  const [filterType, setFilterType] = useState("location");
  const [query, setQuery] = useState("");
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!query.trim()) {
      setError(`Please enter a ${filterType} to search.`);
      return;
    }
    setError("");
    setLoading(true);

    try {
      let url = `/properties/search?`;
      switch (filterType) {
        case "location":
          url += `location=${encodeURIComponent(query)}`;
          break;
        case "description":
          url += `description=${encodeURIComponent(query)}`;
          break;
        case "price":
          const [min, max] = query.split("-").map((v) => v.trim());
          if (min) url += `minPrice=${min}`;
          if (max) url += `&maxPrice=${max}`;
          break;
        case "guests":
          url += `guests=${query}`;
          break;
        default:
          break;
      }

      const response = await axiosClient.get(url);
      setProperties(response.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch properties. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl shadow-md">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-10 space-y-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-center text-blue-700">
          🏡 Find Your Perfect Stay
        </h1>
        <p className="text-center text-gray-500 text-sm md:text-base">
          Search by location, price range, guests, or description.
        </p>

        {/* ================= FILTER BAR ================= */}
        <div className="flex flex-col md:flex-row gap-3 justify-center items-center">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter size={20} className="text-gray-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-56 bg-gray-50"
            >
              <option value="location">Location</option>
              <option value="price">Price Range (e.g. 2000-6000)</option>
              <option value="guests">Number of Guests</option>
              <option value="description">Description</option>
            </select>
          </div>

          <input
            type="text"
            placeholder={
              filterType === "price"
                ? "Enter price range (e.g. 2000-6000)"
                : `Enter ${filterType}...`
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-2 w-full md:flex-1 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
          />

          <button
            onClick={handleSearch}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl shadow-md transition-all duration-300 w-full md:w-auto disabled:bg-gray-400"
          >
            <Search size={18} />
            {loading ? "Searching..." : "Apply"}
          </button>
        </div>

        {error && <p className="text-center text-red-600 font-medium">{error}</p>}

        <div className="mt-8">
          {loading ? (
            <p className="text-center text-gray-500 animate-pulse">
              Loading properties...
            </p>
          ) : properties.length === 0 ? (
            <p className="text-center text-gray-500">
              No properties found. Try adjusting your filters.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((p) => (
                <div
                  key={p.propertyId}
                  className="border border-gray-100 rounded-2xl shadow-md hover:shadow-xl bg-white transition-all duration-300 overflow-hidden flex flex-col"
                >
                  <div className="p-5 flex flex-col justify-between flex-1">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800 mb-1">
                        {p.name}
                      </h2>
                      <p className="text-sm text-gray-600 mb-2">
                        📍 {p.location}
                      </p>
                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                        {p.description}
                      </p>
                    </div>
                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100">
                      <span className="font-bold text-blue-600 text-sm">
                        {p.pricePerNight.toLocaleString()} {p.currency}
                      </span>
                      <span className="text-xs text-gray-400">
                        Host: {p.hostEmail}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchProperty;
