import React, { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import { toast } from "react-hot-toast";
import PaymentForm from "../Payment/PaymentForm"; 
import ReusableTable, { TableColumn } from "../../reusable-components/reusable-table";
import ReusableForm, { FormField } from "../../reusable-components/reusable-form";

interface Booking {
  bookingId: string;
  propertyId: string;
  propertyName: string;
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
  const [properties, setProperties] = useState<any[]>([]);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;


  const role = localStorage.getItem("role");

  const columns: TableColumn<Booking>[] = [
    { key: "bookingId", label: "Booking ID" },
    { key: "propertyName", label: "Property" },
    { key: "userId", label: "User ID" },
    { key: "startDate", label: "Start Date" },
    { key: "endDate", label: "End Date" },
    { key: "totalPrice", label: "Total Price", render: (row) => `KSh ${row.totalPrice}` },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span
          className={`px-2 py-1 rounded text-sm font-medium ${
            row.status === "CONFIRMED"
              ? "bg-green-100 text-green-700"
              : row.status === "CANCELED"
              ? "bg-red-100 text-red-600"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      className: "text-center",
      render: (row) => (
        <div className="flex flex-col sm:flex-row justify-center gap-2">
          {role === "GUEST" && row.status === "PENDING" && (
            <button
              onClick={() => {
                setSelectedBooking(row);
                setShowPayment(true);
              }}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Pay
            </button>
          )}
          {role === "GUEST" && row.status !== "CANCELED" && (
            <button
              onClick={() => cancelBooking(row.bookingId)}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Cancel
            </button>
          )}
        </div>
      ),
    },
  ];
  const bookingFields: FormField[] = [
  { name: "propertyId", label: "Property ID", required: true },
  { name: "startDate", label: "Start Date", type: "date", required: true },
  { name: "endDate", label: "End Date", type: "date", required: true },
];

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      let endpoint = "/bookings/me";
      if (role === "HOST") endpoint = "/bookings/host/my";
      if (role === "ADMIN") endpoint = "/bookings/all";

      const res = await axiosClient.get(endpoint);
      setBookings(res.data);
    } catch {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
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

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">Booking Management</h1>

        {role === "GUEST" && (
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 w-full sm:w-auto rounded-md shadow-md transition"
            onClick={() => setOpen(true)}
          >
            + New Booking
          </button>
        )}
      </div>

      {/* Responsive Table Wrapper */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
        <ReusableTable data={bookings} columns={columns} noDataMessage="No bookings found" />
      </div>

      {/* RESPONSIVE FORM MODAL */}
      {open && (
        <ReusableForm
          fields={bookingFields}
          data={editing}
          endpoint={editing ? `/api/bookings/${editing.bookingId}` : "/bookings/create"}
          method={editing ? "PUT" : "POST"}
          onSuccess={() => fetchBookings()}
          onClose={() => setOpen(false)}
        />
      )}

      {/* PAYMENT MODAL – RESPONSIVE */}
      {showPayment && selectedBooking && (
        <PaymentForm
          bookingId={selectedBooking.bookingId}
          totalAmount={selectedBooking.totalPrice}
          onClose={() => {
            setShowPayment(false);
            setSelectedBooking(null);
            fetchBookings();
          }}
        />
      )}
    </div>
  );
};

export default BookingsPage;
