import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import toast from "react-hot-toast";
import { getUserFromToken } from "../utils/auth";
import axiosClient from "../api/axiosClient";

interface UserProfile {
  firstName: string;
  profilePhotoPath: string | null;
}

export default function Header() {
  const navigate = useNavigate();
  const decodedUser = getUserFromToken();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await axiosClient.get("/user/me");
      setProfile(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

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

  // Menu items based on role
  const menuItems = () => {
    const items: { label: string; path: string }[] = [];
    if (decodedUser?.role === "HOST") {
      items.push({ label: "My Listings", path: "/host/properties" });
    } else if (decodedUser?.role === "GUEST") {
      items.push({ label: "My Bookings", path: "/guest/bookings" });
    } else if (decodedUser?.role === "ADMIN") {
      items.push({ label: "Admin Panel", path: "/admin/dashboard" });
    }
    return items;
  };

  return (
    <header className="bg-white shadow-md px-6 py-3 flex justify-between items-center sticky top-0 z-50">
      {/* Logo / Dashboard Link */}
      <Link
        to={getDashboardLink()}
        className="text-xl font-bold text-red-600 tracking-wide cursor-pointer"
      >
        AirBnB Lite
      </Link>

      {/* Desktop Menu */}
      <nav className="hidden md:flex gap-6 items-center">
        {menuItems().map((item, idx) => (
          <Link key={idx} to={item.path} className="hover:text-red-600">
            {item.label}
          </Link>
        ))}

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            className="flex items-center gap-2 bg-gray-200 rounded-full px-3 py-1"
            onClick={() => setShowSidebar((prev) => !prev)}
          >
            <img
              src={profile?.profilePhotoPath || "https://via.placeholder.com/35?text=P"}
              className="w-8 h-8 rounded-full"
            />
            {profile?.firstName || "User"}
          </button>
          {showSidebar && (
            <div className="absolute right-0 mt-2 w-40 bg-white shadow rounded-md text-sm">
              <Link
                to="/profile"
                className="block px-4 py-2 hover:bg-gray-100 rounded"
              >
                Profile
              </Link>
              <button
                onClick={logout}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Hamburger */}
      <button
        className="md:hidden"
        onClick={() => setShowSidebar(true)}
      >
        <Menu size={26} />
      </button>

      {/* Mobile Sidebar */}
      {showSidebar && (
        <div className="fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setShowSidebar(false)}
          />

          {/* Sidebar */}
          <div className="relative w-64 bg-white shadow-lg p-6 flex flex-col">
            <button
              className="absolute top-4 right-4"
              onClick={() => setShowSidebar(false)}
            >
              <X />
            </button>

            <div className="mt-12 flex flex-col gap-4">
              {menuItems().map((item, idx) => (
                <Link
                  key={idx}
                  to={item.path}
                  onClick={() => setShowSidebar(false)}
                  className="text-lg font-medium hover:text-red-600"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/profile"
                onClick={() => setShowSidebar(false)}
                className="text-lg font-medium hover:text-red-600"
              >
                Profile
              </Link>
              <button
                onClick={logout}
                className="text-left text-red-600 font-medium"
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
