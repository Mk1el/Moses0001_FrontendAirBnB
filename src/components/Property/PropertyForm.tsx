import { useState } from "react";
import axiosClient from "../../api/axiosClient";

interface PropertyFormProps{
    onSuccess: ()=>void;
    editProperty?: any;
}
export default function PropertyForm({onSuccess, editProperty}: PropertyFormProps){
    const [form, setForm] = useState({
        name: editProperty?.name || "",
        description: editProperty?.description || "",
        location: editProperty?.location || "",
        price: editProperty?.price || "",
        currency: editProperty?.currency || "",
    });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=>{
        setForm({...form, [e.target.name]:e.target.value});
    };
    const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    console.log("Submitting property form:", form);

    const url = editProperty
      ? `/api/properties/${editProperty.id}`
      : "/api/properties";

    console.log("POST URL:", url);

    const response = editProperty
      ? await axiosClient.put(url, form)
      : await axiosClient.post(url, form);

    console.log("Response data:", response.data);

    onSuccess();
    setForm({
      name: "",
      description: "",
      location: "",
      price: "",
      currency: "",
    });
  } catch (error: any) {
    if (error.response) {
      console.error("Server responded with an error:", error.response.status);
      console.error("Response data:", error.response.data);
      console.error("Response headers:", error.response.headers);
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error setting up request:", error.message);
    }
  }
};

    return (
    <form
      onSubmit={handleSubmit}
      className="w-full bg-white rounded-2xl shadow-md p-6 flex flex-col gap-4"
    >
      <h2 className="text-xl font-semibold text-gray-700">
        {editProperty ? "Update Property" : "Add New Property"}
      </h2>
      <input
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="Property Name"
        className="p-2 border rounded-md focus:ring focus:ring-green-300 outline-none"
        required
      />
      <textarea
        name="description"
        value={form.description}
        onChange={handleChange}
        placeholder="Description"
        className="p-2 border rounded-md focus:ring focus:ring-green-300 outline-none"
        required
      />
      <input
        name="location"
        value={form.location}
        onChange={handleChange}
        placeholder="Location"
        className="p-2 border rounded-md focus:ring focus:ring-green-300 outline-none"
        required
      />
      <input
        name="price"
        type="number"
        value={form.price}
        onChange={handleChange}
        placeholder="Price per night"
        className="p-2 border rounded-md focus:ring focus:ring-green-300 outline-none"
        required
      />
      <input
        name="currency"
        value={form.currency}
        onChange={handleChange}
        placeholder="Currency Type"
        className="p-2 border rounded-md focus:ring focus:ring-green-300 outline-none"
        required
      />
      <button
        type="submit"
        className="bg-blue-600 text-white rounded-md py-2 hover:bg-green-700 transition"
      >
        {editProperty ? "Update" : "Create"}
      </button>
    </form>
  );
}