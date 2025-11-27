import { useEffect, useMemo, useState } from "react";
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
  X,
} from "lucide-react";
import LogoutButton from "./Logout";
import { getAuthRole } from "../utils/tokenStorage";

interface SidebarProps {
  userRole?: "GUEST" | "HOST" | "ADMIN" | null;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ userRole, isOpen = false, onClose }: SidebarProps) {
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
    if (!userRole) {
      const savedRole = getAuthRole() as "GUEST" | "HOST" | "ADMIN" | null;
      setActiveRole(savedRole);
    } else {
      setActiveRole(userRole);
    }
  }, [userRole]);

  const linkClasses = (path: string) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium
      ${location.pathname === path ? "text-white bg-green-600 shadow-md" : "text-gray-700 hover:bg-gray-200"}`;

  const shouldShow = (label: string) =>
    label.toLowerCase().includes(searchText.toLowerCase());

  const renderMenu = () => {
    switch (activeRole) {
      case "GUEST":
        return (
          <>
            {shouldShow("Dashboard") && (
              <Link to="/guest/dashboard" className={linkClasses("/guest/dashboard")} onClick={onClose}>
                <Home size={20} /> Dashboard
              </Link>
            )}
            {shouldShow("Review") && (
              <Link to="/guest/review" className={linkClasses("/guest/review")} onClick={onClose}>
                <Home size={20} /> Review
              </Link>
            )}
            {shouldShow("My Bookings") && (
              <Link to="/guest/bookings" className={linkClasses("/guest/bookings")} onClick={onClose}>
                <Bookmark size={20} /> My Bookings
              </Link>
            )}
          </>
        );
      case "HOST":
        return (
          <>
            {shouldShow("Bookings") && (
              <Link to="/host/bookings" className={linkClasses("/host/bookings")} onClick={onClose}>
                <Building size={20} /> Bookings
              </Link>
            )}
            {shouldShow("Properties") && (
              <Link to="/host/properties" className={linkClasses("/host/properties")} onClick={onClose}>
                <Bookmark size={20} /> Properties
              </Link>
            )}
            {shouldShow("Add Property") && (
              <Link to="/host/add-property" className={linkClasses("/host/add-property")} onClick={onClose}>
                <Plus size={20} /> Add Property
              </Link>
            )}
          </>
        );
      case "ADMIN":
        return (
          <>
            {shouldShow("Manage Users") && (
              <Link to="/admin/users" className={linkClasses("/admin/users")} onClick={onClose}>
                <Users size={20} /> Manage Users
              </Link>
            )}
            {shouldShow("Reports") && (
              <Link to="/admin/reports" className={linkClasses("/admin/reports")} onClick={onClose}>
                <BarChart size={20} /> Reports
              </Link>
            )}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <aside className="hidden md:flex flex-col w-64 bg-white border-r shadow-sm h-[calc(100vh-64px)] sticky top-[64px] p-4">
        <div className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide">
          House Management
        </div>
        <nav className="flex flex-col gap-2">
          {renderMenu()}
          <Link to="/profile" className={linkClasses("/profile")}>
            <User size={20} /> Profile
          </Link>
          <LogoutButton />
        </nav>
      </aside>

      {/* Mobile Sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
          <div className="relative w-64 bg-white shadow-lg p-6 flex flex-col">
            <button className="absolute top-4 right-4" onClick={onClose}>
              <X />
            </button>
            <div className="mt-12 flex flex-col gap-4">
              {renderMenu()}
              <Link to="/profile" className={linkClasses("/profile")} onClick={onClose}>
                <User size={20} /> Profile
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
