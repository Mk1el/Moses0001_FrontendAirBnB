import React, { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import toast from "react-hot-toast";
import SearchProperty from "../components/Property/SearchProperty";

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
  imageUrl?: string;
}

export default function PropertyDetails() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchProperties = async () => {
    try {
      const response = await axiosClient.get("/properties/guest/all-properties");
      const allProperties: Property[] = response.data;
      setProperties(allProperties);

      if (allProperties.length === 0) {
        toast.error("No properties available");
      }
    } catch (error) {
      toast.error("Failed to load properties");
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedProperty) {
      toast.error("Please select a property");
      return;
    }

    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    const totalDays =
      (new Date(endDate).getTime() - new Date(startDate).getTime()) /
      (1000 * 60 * 60 * 24);

    if (totalDays <= 0) {
      toast.error("End date must be after start date");
      return;
    }

    const totalAmount = totalDays * selectedProperty.pricePerNight;

    try {
      const payload = {
        propertyId: selectedProperty.propertyId,
        startDate,
        endDate,
        totalAmount,
      };

      await axiosClient.post("/api/bookings/create", payload);
      toast.success("Booking successful! Redirecting to payment...");
      // TODO: Redirect to payment page here
    } catch {
      toast.error("Booking failed");
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-gray-500 text-lg animate-pulse">
        Loading properties...
      </div>
    );

  if (properties.length === 0)
    return (
      <div className="flex justify-center items-center h-screen text-gray-600 text-lg">
        No properties available.
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 p-4 sm:p-6 lg:p-10">
      <h1 className="text-3xl sm:text-4xl font-bold text-center text-green-700 mb-8">
        Available Properties
      </h1>

      <div className="max-w-6xl mx-auto mb-8">
        <SearchProperty />
      </div>

      {/* Property Grid */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
        {properties.map((prop) => (
          <div
            key={prop.propertyId}
            className="bg-white rounded-2xl shadow-md hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex flex-col"
          >
            <img
              src={prop.imageUrl || "/placeholder.jpg"}
              alt={prop.name}
              className="w-full h-56 sm:h-64 object-cover rounded-t-2xl"
            />
            <div className="p-5 flex flex-col justify-between flex-grow">
              <div>
                <h2 className="text-xl font-semibold text-green-700 truncate">
                  {prop.name}
                </h2>
                <p className="text-gray-500">{prop.location}</p>
                <p className="text-gray-600 mt-2 line-clamp-2">
                  {prop.description}
                </p>
              </div>
              <div className="mt-4">
                <p className="text-green-700 font-semibold mb-3">
                  {prop.currency || "KES"} {prop.pricePerNight.toLocaleString()} / night
                </p>
                <button
                  onClick={() => setSelectedProperty(prop)}
                  className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition duration-200 font-medium"
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      {selectedProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-fadeIn">
            <h2 className="text-2xl font-bold text-green-700 mb-4 text-center">
              Book {selectedProperty.name}
            </h2>
            <p className="text-gray-600 mb-4 text-center">
              {selectedProperty.location} —{" "}
              {selectedProperty.currency || "KES"}{" "}
              {selectedProperty.pricePerNight.toLocaleString()} / night
            </p>

            <div className="space-y-3">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border w-full p-3 rounded-lg focus:ring-2 focus:ring-green-600 outline-none transition"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border w-full p-3 rounded-lg focus:ring-2 focus:ring-green-600 outline-none transition"
              />
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <button
                  onClick={handleBooking}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition duration-200 font-medium"
                >
                  Pay & Book
                </button>
                <button
                  onClick={() => setSelectedProperty(null)}
                  className="flex-1 bg-gray-300 py-3 rounded-lg hover:bg-gray-400 transition duration-200 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
