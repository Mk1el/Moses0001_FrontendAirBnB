import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

interface NavbarProps {
  role: "GUEST" | "HOST" | "ADMIN" | null;
  firstName?: string | null;
}

export default function Navbar({ role, firstName }: NavbarProps) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Brand */}
        <h1 className="text-xl font-bold text-red-500">
          Airbnb Clone
        </h1>

        {/* Desktop Menu */}
        <nav className="hidden md:flex gap-6 items-center">
          {role === "GUEST" && (
            <>
              <Link to="/guest/dashboard" className="hover:text-red-500">Dashboard</Link>
              <Link to="/guest/bookings" className="hover:text-red-500">Bookings</Link>
            </>
          )}

          {role === "HOST" && (
            <>
              <Link to="/host/dashboard" className="hover:text-red-500">Dashboard</Link>
              <Link to="/host/properties" className="hover:text-red-500">My Properties</Link>
              <Link to="/host/bookings" className="hover:text-red-500">Bookings</Link>
            </>
          )}

          {role === "ADMIN" && (
            <>
              <Link to="/admin/dashboard" className="hover:text-red-500">Dashboard</Link>
              <Link to="/admin/users" className="hover:text-red-500">Users</Link>
              <Link to="/admin/reports" className="hover:text-red-500">Reports</Link>
            </>
          )}

          {/* Profile & Logout */}
          <Link to="/profile" className="font-semibold hover:text-red-500">
            {firstName ? `Hi, ${firstName}` : "Profile"}
          </Link>
          <button onClick={logout} className="text-red-600 font-bold hover:underline">
            Logout
          </button>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-700"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white px-4 pb-4 space-y-3 border-t">
          {role === "GUEST" && (
            <>
              <Link to="/guest/dashboard" className="block hover:text-red-500">Dashboard</Link>
              <Link to="/guest/bookings" className="block hover:text-red-500">Bookings</Link>
            </>
          )}

          {role === "HOST" && (
            <>
              <Link to="/host/dashboard" className="block hover:text-red-500">Dashboard</Link>
              <Link to="/host/properties" className="block hover:text-red-500">My Properties</Link>
              <Link to="/host/bookings" className="block hover:text-red-500">Bookings</Link>
            </>
          )}

          {role === "ADMIN" && (
            <>
              <Link to="/admin/dashboard" className="block hover:text-red-500">Dashboard</Link>
              <Link to="/admin/users" className="block hover:text-red-500">Users</Link>
              <Link to="/admin/reports" className="block hover:text-red-500">Reports</Link>
            </>
          )}

          <Link to="/profile" className="block hover:text-red-500">
            {firstName ? `Hi, ${firstName}` : "Profile"}
          </Link>

          <button
            onClick={logout}
            className="text-red-600 font-bold hover:underline block"
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
}
