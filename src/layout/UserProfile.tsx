import { useEffect, useState } from "react";
import { User, Phone, Mail, Calendar, Shield } from "lucide-react";
import axiosClient from "../api/axiosClient";

interface UserDTO {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: string;
  profilePhotoPath: string | null;
  createdAt: string;
}

export default function UserProfile() {
  const [user, setUser] = useState<UserDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [updateMsg, setUpdateMsg] = useState<string | null>(null);

  useEffect(() => {
    axiosClient
      .get("/user/me")
      .then((res) => {
        setUser(res.data);
        setFormData({
          firstName: res.data.firstName || "",
          lastName: res.data.lastName || "",
          email: res.data.email || "",
          phoneNumber: res.data.phoneNumber || "",
          password: "",
        });
        setPhotoPreview(res.data.profilePhotoPath || null);
      })
      .catch(() => setError("Failed to load user"))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (!f) {
      setPhotoFile(null);
      setPhotoPreview(null);
      return;
    }
    setPhotoFile(f);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const validate = () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setUpdateMsg("First and last name are required.");
      return false;
    }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(formData.email)) {
      setUpdateMsg("Please provide a valid email address.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateMsg(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("firstName", formData.firstName);
      payload.append("lastName", formData.lastName);
      payload.append("email", formData.email);
      payload.append("phoneNumber", formData.phoneNumber || "");
      if (formData.password) payload.append("password", formData.password);
      if (photoFile) payload.append("photo", photoFile);

      const res = await axiosClient.put("/user/me", payload);

      if (res && res.data) {
        setUser(res.data);
        setFormData((prev) => ({ ...prev, password: "" }));
        setPhotoFile(null);
        setPhotoPreview(res.data.profilePhotoPath || null);
        setUpdateMsg("Profile updated successfully!");
      } else {
        setUpdateMsg("Profile updated (no data returned).");
      }
    } catch (err: any) {
      console.error(err);
      const msg =
        err?.response?.data?.message || err?.message || "Failed to update profile.";
      setUpdateMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        Loading profile...
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center h-64 text-red-500">
        {error}
      </div>
    );
  if (!user)
    return (
      <div className="flex justify-center items-center h-64 text-gray-400">
        No user data found
      </div>
    );

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-100 md:flex md:items-start md:gap-6">
        {/* LEFT: Profile */}
        <div className="md:w-1/2">
          <div className="flex flex-col items-center md:items-start">
            <div className="w-28 h-28 rounded-full bg-gray-100 flex items-center justify-center mb-4 overflow-hidden">
              {photoPreview ? (
                <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={56} className="text-gray-400" />
              )}
            </div>

            <h2 className="text-2xl font-semibold text-gray-800">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-sm text-gray-500 mb-4">{user.role}</p>

            <div className="space-y-3 mt-2 w-full md:max-w-sm">
              <div className="flex items-center gap-3 text-gray-700">
                <Mail size={18} className="text-gray-400" />
                <span className="truncate">{user.email}</span>
              </div>

              <div className="flex items-center gap-3 text-gray-700">
                <Phone size={18} className="text-gray-400" />
                <span>{user.phoneNumber || "N/A"}</span>
              </div>

              <div className="flex items-center gap-3 text-gray-700">
                <Shield size={18} className="text-gray-400" />
                <span className="capitalize">{user.role.toLowerCase()}</span>
              </div>

              <div className="flex items-center gap-3 text-gray-700">
                <Calendar size={18} className="text-gray-400" />
                <span>
                  Joined:{" "}
                  {new Date(user.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Form */}
        <form onSubmit={handleSubmit} className="md:w-1/2 mt-6 md:mt-0">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Update Profile</h3>

          {updateMsg && (
            <div className="mb-3 p-2 rounded text-sm bg-blue-50 text-blue-700">{updateMsg}</div>
          )}

          <div className="grid grid-cols-1 gap-3">
            <div className="flex gap-2">
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="flex-1 p-2 border rounded-md focus:outline-none focus:ring focus:ring-orange-200"
                placeholder="First name"
                aria-label="First name"
              />
              </div>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="flex-1 p-2 border rounded-md focus:outline-none focus:ring focus:ring-orange-200"
                placeholder="Last name"
                aria-label="Last name"
              />
            

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-orange-200"
              placeholder="Email"
            />

            <input
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-orange-200"
              placeholder="Phone number"
            />

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-orange-200"
              placeholder="New password (optional)"
            />

            <label className="flex flex-col text-sm">
              <span className="mb-1 text-gray-600">Profile photo (optional)</span>
              <input type="file" accept="image/*" onChange={handleFileChange} />
              {photoPreview && <span className="text-xs text-gray-500 mt-1">Preview shown on the left.</span>}
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 w-full inline-flex justify-center items-center gap-2 bg-blue-600 text-white p-2 rounded-md hover:bg-orange-600 disabled:opacity-60"
            >
              {submitting ? "Saving..." : "Save changes"}
            </button>

            <p className="text-xs text-gray-500 mt-2">
              Leave password blank to keep your current password. Photo will be uploaded if selected.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
