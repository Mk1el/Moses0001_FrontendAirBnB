import React, { useEffect, useRef, useState } from "react";
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
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const modalRef = useRef<HTMLDivElement | null>(null);

  const todayISO = new Date().toISOString().split("T")[0];

  // fetch properties
  const fetchProperties = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get("/properties/guest/all-properties");
      const allProperties: Property[] = response.data;
      setProperties(allProperties ?? []);

      if (!allProperties || allProperties.length === 0) {
        toast.error("No properties available");
      }
    } catch (error) {
      console.error("fetchProperties error:", error);
      toast.error("Failed to load properties");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  // disable background scroll while modal open and add ESC/outside click support
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedProperty(null);
      }
    };

    if (selectedProperty) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKey);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [selectedProperty]);

  const handleOutsideClick = (e: React.MouseEvent) => {
    if (modalRef.current && e.target === modalRef.current) {
      setSelectedProperty(null);
    }
  };

  // format currency with fallback
  const formatCurrency = (amount: number, currency?: string) => {
    const code = currency || "KES";
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: code,
        maximumFractionDigits: 0,
      }).format(amount);
    } catch {
      return `${code} ${amount.toLocaleString()}`;
    }
  };

  // handle booking
  const handleBooking = async () => {
    if (!selectedProperty) {
      toast.error("Please select a property");
      return;
    }
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    const msPerDay = 1000 * 60 * 60 * 24;
    const diffMs = new Date(endDate).getTime() - new Date(startDate).getTime();
    const totalDays = Math.ceil(diffMs / msPerDay);

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
      setSelectedProperty(null);
    } catch (err) {
      console.error("booking error:", err);
      toast.error("Booking failed");
    }
  };

  const openModalFor = (prop: Property) => {
    setSelectedProperty(prop);
    // reset or set sensible defaults
    setStartDate(todayISO);
    setEndDate("");
  };

  // skeleton while loading
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-green-50 p-6">
        <div className="w-full max-w-6xl">
          <div className="animate-pulse grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow">
                <div className="h-40 bg-gray-200 rounded-md mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="mt-4 h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );

  if (!properties || properties.length === 0)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-green-50 p-6">
        <div className="text-center text-gray-700">
          <h2 className="text-2xl font-semibold mb-2">No properties available</h2>
          <p className="text-sm">Check back later or change your search.</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 p-4 sm:p-6 lg:p-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-green-700 mb-6">
          Available Properties
        </h1>

        <div className="mb-8 px-2">
          <SearchProperty />
        </div>

        {/* Responsive Grid */}
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {properties.map((prop) => (
            <article
              key={prop.propertyId}
              className="bg-white rounded-2xl shadow-md hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden"
            >
              <div className="relative">
                <img
                  src={prop.imageUrl || "/placeholder.jpg"}
                  alt={prop.name}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/placeholder.jpg";
                  }}
                  className="w-full h-48 sm:h-56 object-cover"
                />
                <span className="absolute left-3 top-3 bg-white/90 text-sm font-semibold text-green-700 px-3 py-1 rounded-full shadow">
                  {formatCurrency(prop.pricePerNight, prop.currency)} / night
                </span>
              </div>

              <div className="p-4 flex flex-col flex-grow">
                <div className="mb-3">
                  <h2 className="text-lg font-semibold text-gray-800 truncate">
                    {prop.name}
                  </h2>
                  <p className="text-sm text-gray-500">{prop.location}</p>
                  <p className="text-xs text-gray-400 mt-1">Host: {prop.hostEmail}</p>
                </div>

                <p className="text-gray-600 text-sm line-clamp-3 mb-4">{prop.description}</p>

                <div className="mt-auto">
                  <button
                    onClick={() => openModalFor(prop)}
                    className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-green-300"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Modal */}
      {selectedProperty && (
        <div
          ref={modalRef}
          onMouseDown={handleOutsideClick}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          aria-modal="true"
          role="dialog"
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-auto max-h-[90vh] animate-fadeIn"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="md:flex">
              {/* Left: Image */}
              <div className="md:w-1/2">
                <img
                  src={selectedProperty.imageUrl || "/placeholder.jpg"}
                  alt={selectedProperty.name}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/placeholder.jpg";
                  }}
                  className="w-full h-64 md:h-full object-cover rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none"
                />
              </div>

              {/* Right: Details */}
              <div className="md:w-1/2 p-6 flex flex-col">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-green-700">
                      {selectedProperty.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{selectedProperty.location}</p>
                    <p className="text-sm text-gray-400 mt-1">Host: {selectedProperty.hostEmail}</p>
                  </div>
                  <button
                    aria-label="Close modal"
                    onClick={() => setSelectedProperty(null)}
                    className="ml-4 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-gray-600 mt-4 flex-1">{selectedProperty.description}</p>

                <div className="mt-4">
                  <p className="text-green-700 font-semibold mb-2">
                    {formatCurrency(selectedProperty.pricePerNight, selectedProperty.currency)} / night
                  </p>

                  <label className="block text-sm text-gray-700 mb-2">Start date</label>
                  <input
                    type="date"
                    value={startDate}
                    min={todayISO}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      // if endDate is before new startDate, clear it
                      if (endDate && new Date(e.target.value) >= new Date(endDate)) {
                        setEndDate("");
                      }
                    }}
                    className="border w-full p-2 rounded-lg focus:ring-2 focus:ring-green-600 outline-none transition"
                  />

                  <label className="block text-sm text-gray-700 mt-3 mb-2">End date</label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate || todayISO}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border w-full p-2 rounded-lg focus:ring-2 focus:ring-green-600 outline-none transition"
                  />

                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={handleBooking}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-green-300"
                    >
                      Pay & Book
                    </button>
                    <button
                      onClick={() => setSelectedProperty(null)}
                      className="flex-1 bg-gray-200 py-2 rounded-lg hover:bg-gray-300 transition duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
