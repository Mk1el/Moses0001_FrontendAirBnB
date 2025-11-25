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

  // const columns: TableColumn<any>[] = [
  //   { key: "name", label: "Name" },
  //   { key: "location", label: "Location" },
  //   { key: "pricePerNight", label: "Price/Night" },
  //   { key: "currency", label: "Currency" },
  //   {
  //     key: "actions",
  //     label: "Actions",
  //     className: "text-center",
  //     render: (row) => (
  //       <div className="flex justify-center gap-2">
  //         <button
  //           onClick={() => {/* edit logic */}}
  //           className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
  //         >
  //           Edit
  //         </button>
  //         {/* <button
  //           onClick={() => handleDelete(row.id)}
  //           className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
  //         >
  //           Delete
  //         </button> */}
  //       </div>
  //     ),
  //   },
  // ];
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
        <div className="flex justify-center gap-2">
          {role === "GUEST" && row.status === "PENDING" && (
            <button
              onClick={() => {
                setSelectedBooking(row);
                setShowPayment(true);
              }}
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Pay
            </button>
          )}
          {role === "GUEST" && row.status !== "CANCELED" && (
            <button
              onClick={() => cancelBooking(row.bookingId)}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Cancel
            </button>
          )}
        </div>
      ),}]

      const bookingFields: FormField[] = [
  { name: "propertyId", label: "Property ID", required: true },
  { name: "startDate", label: "Start Date", type: "date", required: true },
  { name: "endDate", label: "End Date", type: "date", required: true },
];

  const role = localStorage.getItem("role");

  const fetchBookings = async () => {
    try {
      setLoading(true);
      let endpoint = "/bookings/me";
      if (role === "HOST") endpoint = "bookings/host/my";
      if (role === "ADMIN") endpoint = "bookings/all";

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

  // Calculate paginated bookings
  const indexOfLastBooking = currentPage * itemsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - itemsPerPage;
  const currentBookings = bookings.slice(indexOfFirstBooking, indexOfLastBooking);
  const totalPages = Math.ceil(bookings.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (!form.propertyId || !form.startDate || !form.endDate) {
        toast.error("All fields are required");
        return;
      }

      if (editing) {
        toast("Editing not implemented yet");
      } else {
        const res = await axiosClient.post("/api/bookings/create", form);
        toast.success("Booking created successfully!");
        setSelectedBooking(res.data);
        setShowPayment(true);
      }

      setOpen(false);
      setEditing(null);
      fetchBookings();
    } catch (err: any) {
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
      await axiosClient.delete(`/bookings/${id}`);
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

      <div className="p-4 sm:p-8">
      <h1 className="text-2xl font-bold mb-4">My Bookings</h1>

      <ReusableTable data={bookings} columns={columns} noDataMessage="No properties found" />
    </div>

      {/* Pagination Controls */}
      {/* {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-1 rounded hover:bg-gray-300 ${
                currentPage === page ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )} */}

      {/* Modal: Create / Update Booking */}
      {/* {open && (
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
      )} */}

      {/* <ReusableForm
  fields={bookingFields}
  data={editing}
  endpoint={editing ? `/api/bookings/${editing.bookingId}` : "/bookings/create"}
  method={editing ? "PUT" : "POST"}
  onSuccess={() => {
    fetchBookings();
    setOpen(false);
  }}
/> */}
{open && (
  <ReusableForm
    fields={bookingFields}
    data={editing}
    endpoint={editing ? `/api/bookings/${editing.bookingId}` : "/bookings/create"}
    method={editing ? "PUT" : "POST"}
    onSuccess={() => fetchBookings()}
    onClose={() => setOpen(false)} // 👈 Close modal
  />
)}


      {/* Payment modal */}
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
