import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import PropertyForm from "./PropertyForm";

export default function PropertyList() {
  const [properties, setProperties] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);

  // Fetch Properties
  const fetchProperties = async () => {
    try {
      const res = await axiosClient.get("api/properties/host/my-properties");
      setProperties(res.data);
    } catch (err) {
      console.error("Error fetching properties:", err);
    }
  };

  // Delete Property
  const handleDelete = async (id: string) => {
    try {
      await axiosClient.delete(`api/properties/${id}`);
      fetchProperties();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  // Widget Stats
  const total = properties.length;
  const avgPrice =
    total > 0
      ? (properties.reduce((sum, p) => sum + parseFloat(p.pricepernight), 0) / total).toFixed(2)
      : 0;

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* ===================== TOP WIDGETS ===================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-md p-4 flex flex-col items-center">
          <span className="text-gray-500 text-sm">Total Properties</span>
          <span className="text-2xl font-bold text-blue-600">{total}</span>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-4 flex flex-col items-center">
          <span className="text-gray-500 text-sm">Average Price/Night</span>
          <span className="text-2xl font-bold text-green-600">KES {avgPrice}</span>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-4 flex flex-col items-center">
          <span className="text-gray-500 text-sm">Most Recent</span>
          <span className="text-lg font-semibold text-gray-800">
            {properties[0]?.name || "—"}
          </span>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-4 flex flex-col items-center">
          <span className="text-gray-500 text-sm">Last Updated</span>
          <span className="text-lg font-semibold text-gray-800">
            {properties[0]?.updated_at
              ? new Date(properties[0].updated_at).toLocaleDateString()
              : "—"}
          </span>
        </div>
      </div>

      {/* ===================== HEADER + ADD BUTTON ===================== */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-700">My Properties</h2>
        <button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Add Property
        </button>
      </div>

      {/* ===================== TABLE ===================== */}
      <div className="overflow-x-auto bg-white shadow-md rounded-2xl">
        <table className="min-w-full text-left border-collapse">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Location</th>
              <th className="p-3">Price/Night</th>
              <th className="p-3">Currency</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {properties.map((p, i) => (
              <tr
                key={p.property_id}
                className={`border-b ${i % 2 ? "bg-gray-50" : "bg-white"} hover:bg-green-50`}
              >
                <td className="p-3">{p.name}</td>
                <td className="p-3">{p.location}</td>
                <td className="p-3">{p.pricePerNight}</td>
                <td className="p-3">{p.currency}</td>
                <td className="p-3 flex justify-center gap-2">
                  <button
                    onClick={() => {
                      setEditing(p);
                      setOpen(true);
                    }}
                    className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p.property_id)}
                    className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {properties.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-gray-500 p-4">
                  No properties found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ===================== DIALOG (MODAL) ===================== */}
      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white w-full max-w-lg p-6 rounded-2xl shadow-lg relative animate-fadeIn">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-600 text-xl"
            >
              &times;
            </button>
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              {editing ? "Edit Property" : "Add New Property"}
            </h3>
            <PropertyForm
              onSuccess={() => {
                fetchProperties();
                setOpen(false);
              }}
              editProperty={editing}
            />
          </div>
        </div>
      )}
    </div>
  );
}
