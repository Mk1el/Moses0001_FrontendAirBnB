import React, { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import { toast } from "react-hot-toast";
import PaymentForm from "../Payment/PaymentForm"; 

interface Booking {
  bookingId: string;
  propertyId: string;
  userId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
  createdAt: string;
}

interface BookingRequest {
  propertyId: string;
  startDate: string;
  endDate: string;
}

const BookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Booking | null>(null);
  const [form, setForm] = useState<BookingRequest>({
    propertyId: "",
    startDate: "",
    endDate: "",
  });
  const [showPayment, setShowPayment] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const role = localStorage.getItem("role");

  const fetchBookings = async () => {
    try {
      setLoading(true);
      let endpoint = "/api/bookings/me";
      if (role === "HOST") endpoint = "/api/bookings/host/my";
      if (role === "ADMIN") endpoint = "/api/bookings/all";

      const res = await axiosClient.get(endpoint);
      setBookings(res.data);
    } catch (err) {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
  try {
    if (!form.propertyId || !form.startDate || !form.endDate) {
      toast.error("All fields are required");
      return;
    }

    console.log("📦 Booking data being sent to backend:", form);

    if (editing) {
      toast("Editing not implemented yet");
    } else {
      const res = await axiosClient.post("/api/bookings/create", form);
      console.log("✅ Backend response:", res.data);

      toast.success("Booking created successfully!");

      // 👇 Auto-open payment modal with the new booking
      setSelectedBooking(res.data);
      setShowPayment(true);
    }

    setOpen(false);
    setEditing(null);
    fetchBookings();
  } catch (err: any) {
    console.error("❌ Error saving booking:", err.response?.data || err);
    toast.error(err.response?.data?.message || "Error saving booking");
  }
};



  const cancelBooking = async (id: string) => {
    if (!window.confirm("Cancel this booking?")) return;
    try {
      await axiosClient.post(`/api/bookings/${id}/cancel`);
      toast.success("Booking canceled!");
      fetchBookings();
    } catch {
      toast.error("Failed to cancel booking");
    }
  };

  const deleteBooking = async (id: string) => {
    if (!window.confirm("Delete this booking permanently?")) return;
    try {
      await axiosClient.delete(`/api/bookings/${id}`);
      toast.success("Booking deleted!");
      fetchBookings();
    } catch {
      toast.error("Failed to delete booking");
    }
  };

  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Booking Management</h1>
        {role === "GUEST" && (
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-md transition"
            onClick={() => setOpen(true)}
          >
            + New Booking
          </button>
        )}
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow-md">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3 text-left">Property ID</th>
              <th className="p-3 text-left">User ID</th>
              <th className="p-3 text-left">Dates</th>
              <th className="p-3 text-left">Total Price</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center p-6 text-gray-500 italic">
                  Loading bookings...
                </td>
              </tr>
            ) : bookings.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-6 text-gray-500 italic">
                  No bookings found
                </td>
              </tr>
            ) : (
              bookings.map((b) => (
                <tr
                  key={b.bookingId}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="p-3">{b.propertyId}</td>
                  <td className="p-3">{b.userId}</td>
                  <td className="p-3">
                    {b.startDate} → {b.endDate}
                  </td>
                  <td className="p-3">KSh {b.totalPrice}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-sm font-medium ${
                        b.status === "CONFIRMED"
                          ? "bg-green-100 text-green-700"
                          : b.status === "CANCELED"
                          ? "bg-red-100 text-red-600"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="p-3 text-center space-x-2">
                    {/* Pay button (Guest & pending) */}
                    {role === "GUEST" && b.status === "PENDING" && (
                      <button
                        onClick={() => {
                          setSelectedBooking(b);
                          setShowPayment(true);
                        }}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Pay
                      </button>
                    )}

                    {role === "GUEST" && b.status !== "CANCELED" && (
                      <button
                        onClick={() => cancelBooking(b.bookingId)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Cancel
                      </button>
                    )}

                    {/* Delete (Admin) */}
                    {role === "ADMIN" && (
                      <button
                        onClick={() => deleteBooking(b.bookingId)}
                        className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-800"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: Create / Update Booking */}
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
            <h2 className="text-lg font-semibold mb-4">
              {editing ? "Update Booking" : "Create New Booking"}
            </h2>

            <input
              name="propertyId"
              placeholder="Enter Property ID"
              value={form.propertyId}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 mb-3"
            />
            <div className="flex gap-2">
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                className="w-1/2 border rounded-lg p-2"
              />
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                className="w-1/2 border rounded-lg p-2"
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
              >
                {editing ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment modal (renders when user clicks Pay) */}
      {showPayment && selectedBooking && (
        <PaymentForm
          bookingId={selectedBooking.bookingId}
          totalAmount={selectedBooking.totalPrice}
          onClose={() => {
            setShowPayment(false);
            setSelectedBooking(null);
            // refresh bookings to show updated status after payment
            fetchBookings();
          }}
        />
      )}
    </div>
  );
};

export default BookingsPage;
