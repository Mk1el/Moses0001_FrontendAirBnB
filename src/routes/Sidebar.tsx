
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  User,
  Bookmark,
  Building,
  Plus,
  Users,
  BarChart,
  LogOut,
  Search,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import { getAuthRole } from "../utils/tokenStorage";
import LogoutButton from "./Logout";

interface SidebarProps {
  userRole?: "GUEST" | "HOST" | "ADMIN" | null;
}

export default function Sidebar({ userRole }: SidebarProps) {
  const location = useLocation();
  const [searchText, setSearchText] = useState("");
  const [activeRole, setActiveRole] = useState<"GUEST" | "HOST" | "ADMIN" | null>(null);

  const derivedRole = useMemo(() => {
    const path = location.pathname.toLowerCase();
    if (path.startsWith("/host")) return "HOST";
    if (path.startsWith("/admin")) return "ADMIN";
    if (path.startsWith("/guest")) return "GUEST";
    return userRole || activeRole;
  }, [location.pathname, userRole, activeRole]);

  useEffect(() => {
    if(!userRole){
      const savedRole = getAuthRole() as "GUEST" | "HOST" | "ADMIN" | null;
      setActiveRole(savedRole);
    }else {
      setActiveRole(userRole);
    }
  },[userRole]);
    

  // Styling for links
  const linkClasses = (path: string) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium
      ${
        location.pathname === path
          ? "text-white bg-green-600 shadow-md"
          : "text-gray-700 hover:bg-gray-200"
      }`;

  const shouldShow = (label: string) =>
    label.toLowerCase().includes(searchText.toLowerCase());

  return (
    <aside
      className="hidden md:flex flex-col w-64 bg-white border-r shadow-sm
                 h-[calc(100vh-64px)] sticky top-[64px] p-4"
    >
      {/* TITLE */}
      <div className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide">
        House Management
      </div>

      <nav className="flex flex-col gap-2">

        {activeRole === "GUEST" && (
          <>
          {shouldShow("Dashboard") && (
              <Link to="/guest/dashboard" className={linkClasses("/guest/dashboard")}>
                <Home size={20} /> Dashboard
              </Link>
            )}
            {shouldShow("Review") && (
              <Link to="/guest/review" className={linkClasses("/guest/review")}>
                <Home size={20} /> Review
              </Link>
            )}
            {shouldShow("My Bookings") && (
              <Link to="/guest/bookings" className={linkClasses("/guest/bookings")}>
                <Bookmark size={20} /> My Bookings
              </Link>
            )}
          </>
        )}

        {/* HOST MENU */}
        {activeRole === "HOST" && (
          <>
            {shouldShow("Bookings") && (
              <Link to="/host/bookings" className={linkClasses("/host/bookings")}>
                <Building size={20} /> Bookings
              </Link>
            )}
            {shouldShow("Properties") && (
              <Link to="/host/properties" className={linkClasses("/host/properties")}>
                <Bookmark size={20} /> Properties
              </Link>
            )}
            {shouldShow("Add Property") && (
              <Link to="/host/add-property" className={linkClasses("/host/add-property")}>
                <Plus size={20} /> Add Property
              </Link>
            )}
          </>
        )}

        {/* ADMIN MENU */}
        {activeRole === "ADMIN" && (
          <>
            {shouldShow("Manage Users") && (
              <Link to="/admin/users" className={linkClasses("/admin/users")}>
                <Users size={20} /> Manage Users
              </Link>
            )}
            {shouldShow("Reports") && (
              <Link to="/admin/reports" className={linkClasses("/admin/reports")}>
                <BarChart size={20} /> Reports
              </Link>
            )}
          </>
        )}

        {/* COMMON */}
        {shouldShow("Profile") && (
          <Link to="/profile" className={linkClasses("/profile")}>
            <User size={20} /> Profile
          </Link>
        )}

        <LogoutButton />

      </nav>
    </aside>
  );
}
