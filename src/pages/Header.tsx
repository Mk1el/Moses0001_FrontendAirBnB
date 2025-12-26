import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import toast from "react-hot-toast";
import { getUserFromToken } from "../utils/auth";
import axiosClient from "../api/axiosClient";
import Sidebar from "../routes/Sidebar";

interface UserProfile {
  firstName: string;
  profilePhotoPath: string | null;
}

export default function Header() {
  const navigate = useNavigate();
  const decodedUser = getUserFromToken();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axiosClient.get("/user/me");
      setProfile(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out!");
    navigate("/");
  };

  const getDashboardLink = () => {
    switch (decodedUser?.role) {
      case "HOST":
        return "/host/dashboard";
      case "GUEST":
        return "/guest/dashboard";
      case "ADMIN":
        return "/admin/dashboard";
      default:
        return "/";
    }
  };

  const menuItems = () => {
    const items: { label: string; path: string }[] = [];
    if (decodedUser?.role === "HOST") {
      items.push({ label: "My Listings", path: "/host/properties" });
    }
    if (decodedUser?.role === "GUEST") {
      items.push({ label: "My Bookings", path: "/guest/bookings" });
    }
    if (decodedUser?.role === "ADMIN") {
      items.push({ label: "Admin Panel", path: "/admin/dashboard" });
    }
    return items;
  };

  return (
    <header className="bg-white shadow-sm px-5 py-3 flex justify-between items-center sticky top-0 z-40">

      {/* Logo */}
      <Link to={getDashboardLink()} className="text-2xl font-bold text-red-600 tracking-wide hover:opacity-80 transition">
        AirBnB Lite
      </Link>

      {/* Desktop Menu */}
      <nav className="hidden md:flex gap-6 items-center">
        {menuItems().map((item, idx) => (
          <Link key={idx} to={item.path} className="hover:text-red-600 text-gray-700 transition">
            {item.label}
          </Link>
        ))}

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 transition"
          >
            <img
              src={profile?.profilePhotoPath || "https://via.placeholder.com/40"}
              className="w-9 h-9 rounded-full"
            />
            {profile?.firstName || "User"}
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-xl w-40 p-2 text-sm">
              <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100 rounded">
                Profile
              </Link>
              <button onClick={logout} className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded text-red-600">
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      <button className="md:hidden" onClick={() => setShowSidebar(true)}>
        <Menu size={28} />
      </button>

      {/* Mobile Sidebar */}
      {/* <Sidebar
      isOpen={showSidebar}
      onClose={() => setShowSidebar(false)}      
     userRole={decodedUser?.role}
     className="z-10"
    /> */}
    {showSidebar && (
  <div className="fixed inset-0 z-50 flex">
    {/* Overlay */}
    <div
      className="absolute inset-0 bg-black/40"
      onClick={() => setShowSidebar(false)}
    />
    {/* Sidebar panel */}
    <div className="relative w-72 bg-white shadow-xl p-6 flex flex-col animate-slideIn">
      {/* Close button */}
      <button
        className="self-end mb-4"
        onClick={() => setShowSidebar(false)}
      >
        <X size={28} />
      </button>

      {/* Menu items */}
      <nav className="flex flex-col gap-4">
        {menuItems().map((item, idx) => (
          <Link
            key={idx}
            to={item.path}
            onClick={() => setShowSidebar(false)} // close sidebar on click
            className="text-gray-700 hover:text-red-600 transition"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Divider */}
      <hr className="my-4" />

      {/* Profile info */}
      <div className="flex flex-col items-start gap-2">
        <div className="flex items-center gap-3">
          <img
            src={profile?.profilePhotoPath || "https://via.placeholder.com/40"}
            className="w-10 h-10 rounded-full"
          />
          <span className="font-medium">{profile?.firstName || "User"}</span>
        </div>
        <Link
          to="/profile"
          onClick={() => setShowSidebar(false)}
          className="text-gray-700 hover:text-red-600 transition"
        >
          Profile
        </Link>
        <button
          onClick={() => {
            logout();
            setShowSidebar(false);
          }}
          className="text-red-600 hover:opacity-80 transition text-left"
        >
          Logout
        </button>
      </div>
    </div>
  </div>
)}




    </header>
  );
}
