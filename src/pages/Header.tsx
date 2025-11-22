import { useEffect, useState } from "react";
import axios from "axios";
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
  const [showMenu, setShowMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const token = localStorage.getItem("token");

  const fetchProfile = async () => {
    try {
      const res = await axiosClient.get("/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) fetchProfile();
  }, [token]);

  const logout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out!");
    navigate("/");
  };

  return (
    <header className="bg-white shadow-md px-6 py-3 flex justify-between items-center sticky top-0 z-50">
      
      <Link to="/host/dashboard" className="text-xl font-bold text-red-600 tracking-wide cursor-pointer">
        AirBnB Lite
      </Link>

      {/* Desktop Menu */}
      <nav className="hidden md:flex gap-6 items-center">
        {decodedUser?.role === "HOST" && (
          <Link className="hover:text-red-600" to="/host/properties">My Listings</Link>
        )}

        {decodedUser?.role === "GUEST" && (
          <Link className="hover:text-red-600" to="/guest/bookings">My Bookings</Link>
        )}

        {decodedUser?.role === "ADMIN" && (
          <Link className="hover:text-red-600" to="/admin/dashboard">Admin Panel</Link>
        )}

        {/* Profile Button */}
        <div className="relative">
          <button
            className="flex items-center gap-2 bg-gray-200 rounded-full px-3 py-1"
            onClick={() => setShowProfile(!showProfile)}
          >
            <img
              src={profile?.profilePhotoPath || "https://via.placeholder.com/35?text=P"}
              className="w-8 h-8 rounded-full"
            />
            {profile?.firstName || "User"}
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-40 bg-white shadow rounded-md text-sm">
              <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100 rounded">
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
      <button className="md:hidden" onClick={() => setShowMenu(true)}>
        <Menu size={26} />
      </button>

      {/* Mobile Menu */}
      {showMenu && (
        <div className="absolute top-0 right-0 bg-white w-64 h-screen shadow-lg p-6 md:hidden">
          <button className="absolute top-4 right-4" onClick={() => setShowMenu(false)}>
            <X />
          </button>

          <div className="mt-12 flex flex-col gap-4">
            <Link to="/profile" onClick={() => setShowMenu(false)}>
              Profile
            </Link>
            <button onClick={logout} className="text-left text-red-600">
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
