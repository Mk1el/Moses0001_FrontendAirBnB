import React, { useEffect, useRef, useState } from "react";
import axiosClient from "../api/axiosClient";
import toast from "react-hot-toast";
import SearchProperty from "../components/Property/SearchProperty";
import PaymentForm from "../components/Payment/PaymentForm";

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
  isBooked?: boolean;
}

export default function PropertyDetails() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const [nights, setNights] = useState<number | null>(null);
  const [pricePerNightCalculated, setPricePerNightCalculated] = useState<number | null>(null);
  const [totalPrice, setTotalPrice] = useState<number | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [showAfterBooking, setShowAfterBooking]=useState<{bookingId: string|null; totalAmount: number|null}>({bookingId: null, totalAmount: null})
  const todayISO = new Date().toISOString().split("T")[0];
  const [showPaymentForm, setShowPaymentForm]=useState(false);
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
  },[]);

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
  const calculatePrice = async () => {
    if(!selectedProperty || !startDate || !endDate) return;
  
  if(new Date(endDate) <= new Date (startDate)){
    setNights(null);
    setTotalPrice(null);
    return;
  }
  try{
    setCalculating(true);
    const response = await axiosClient.get("/bookings/calculate", {
      params:{
        propertyId: selectedProperty?.propertyId,
        start: startDate,
        end: endDate,
      },
    });
    setNights(response.data.nights);
    setPricePerNightCalculated(response.data.pricePerNight);
    setTotalPrice(response.data.totalPrice);
  } catch (err) {
    console.error("Calculate price error:", err);
    toast.error("Failed to calculate price");
  } finally {
    setCalculating(false);
  }
  };
  useEffect(()=>{
    if(selectedProperty && startDate && endDate){
      calculatePrice()
    }
  },[startDate, endDate, selectedProperty]);

  const checkBookedProperties = async () => {
  try {
    const response = await axiosClient.get("/properties/available", {
      params: { startDate: todayISO, endDate: todayISO },
    });

    const availablePropertyIds = response.data.map((p: Property) => p.propertyId);

    setProperties((prev) =>
      prev.map((p) => ({
        ...p,
        isBooked: !availablePropertyIds.includes(p.propertyId), // true if booked
      }))
    );
  } catch (err) {
    console.error("Error checking booked properties:", err);
    toast.error("Failed to check bookings");
  }
};
useEffect(()=>{
  fetchProperties().then(()=>{
    checkBookedProperties();
  })
},[]);

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
  const handleBooking = async ()=>{
    if(!selectedProperty) return toast.error("Please select a property!");
    if(selectedProperty.isBooked) return toast.error("This Property is already booked");
    if (!startDate || !endDate) return toast.error("Please select both start and end dates");
    if (!totalPrice || nights === null) return toast.error("Please wait for price calculation");

    try{
      const payload = {
        propertyId: selectedProperty.propertyId,
        startDate,
        endDate
      };
      const res = await axiosClient.post("/bookings/create",payload);
      const created = res.data;
      toast.success("Booking successful! Redirecting to payment");
      setShowAfterBooking({
        bookingId: created.bookingId,
        totalAmount: created.totalPrice,
      });
      setSelectedProperty(null);

      //TO DO(Redirect to payment page)
    }catch(err:any){
      console.error("booking error:", err);
      toast.error("Booking failed");

    }finally{}
  }

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
                {/* <img
                  src={prop.imageUrl || "/logo192.jpg"}
                  alt={prop.name}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/placeholder.jpg";
                  }}
                  className="w-full h-48 sm:h-56 object-cover"
                /> */}
                <span className="absolute left-3 top-3 bg-white/90 text-sm font-semibold text-green-700 px-3 py-1 rounded-full shadow">
                  {formatCurrency(prop.pricePerNight, prop.currency)} / night
                </span>
              </div>
              <div className="mt-auto">
  <button
    onClick={() => openModalFor(prop)}
    disabled={prop.isBooked}
    className={`w-full py-2 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-green-300 transition duration-200
      ${prop.isBooked
        ? "bg-gray-300 text-gray-700 cursor-not-allowed"
        : "bg-green-600 text-white hover:bg-green-700"
      }`}
  >
    {prop.isBooked ? "Already Booked" : "Book Now"}
  </button>
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
                {/* <img
                  src={selectedProperty.imageUrl || "/placeholder.jpg"}
                  alt={selectedProperty.name}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/placeholder.jpg";
                  }}
                  className="w-full h-64 md:h-full object-cover rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none"
                /> */}
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
                {showPaymentForm && showAfterBooking.bookingId && showAfterBooking.totalAmount && (
                <PaymentForm
                bookingId={showAfterBooking.bookingId}
                totalAmount={showAfterBooking.totalAmount}
                onClose={() => setShowPaymentForm(false)}
                 />
                )}

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

                  {calculating &&(
                    <p className="text-sm text-gray-500 mt-3">Calculating your total price ...</p>
                  )}
                  {!calculating && nights !== null && totalPrice !== null && (
                    <div className="mt-4 bg-green-50 border border-green-200 p-3 rounded-lg">
                      <p className="text-green-800 font-medium">
                        {nights} night(s) × {formatCurrency(pricePerNightCalculated || 0)} =
                      </p>
                      <p className="text-2xl font-bold text-green-700 mt-1">
                         {formatCurrency(totalPrice)}
                      </p>
                    </div>
                  )}

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
      {showAfterBooking.bookingId && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md text-center">
      <h2 className="text-xl font-bold text-green-700 mb-3">Booking Successful</h2>
      <p className="text-gray-600 mb-4">
        Would you like to complete your payment now?
      </p>

      <div className="flex gap-3 mt-6">
        
        <button
          className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
          onClick={() => {
            setShowPaymentForm(true);
          }}
        >
          Pay Now
        </button>

        <button
          className="flex-1 bg-gray-200 py-2 rounded-lg hover:bg-gray-300"
          onClick={() => {
            setShowAfterBooking({ bookingId: null, totalAmount: null });
            window.location.href = "/guest/bookings";
          }}
        >
          Pay Later
        </button>
      </div>
    </div>
  </div>
)}

    </div>
    
  );
}
