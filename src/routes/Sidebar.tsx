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
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface SidebarProps {
  userRole?: "GUEST" | "HOST" | "ADMIN" | null;
}

export default function Sidebar({ userRole }: SidebarProps) {
  const location = useLocation();
  const [activeRole, setActiveRole] = useState<"GUEST" | "HOST" | "ADMIN" | null>(null);

  // ✅ Derive role from path or fallback to user role
  const derivedRole = useMemo(() => {
    const path = location.pathname.toLowerCase();
    if (path.startsWith("/host")) return "HOST";
    if (path.startsWith("/admin")) return "ADMIN";
    if (path.startsWith("/guest")) return "GUEST";
    return userRole || activeRole;
  }, [location.pathname, userRole, activeRole]);

  // ✅ Persist last known role (so /profile keeps sidebar items visible)
  useEffect(() => {
    if (derivedRole) setActiveRole(derivedRole);
  }, [derivedRole]);

  const linkClasses = (path: string) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium
    ${
      location.pathname === path
        ? "text-red-600 bg-red-50 shadow-sm"
        : "text-gray-700 hover:bg-gray-100"
    }`;

  return (
    <aside
      className="hidden md:flex flex-col w-60 bg-white border-r shadow-sm
                 h-[calc(100vh-64px)] sticky top-[64px] p-4"
    >
      <div className="text-xs font-semibold text-gray-400 mb-4 uppercase tracking-wide">
        Menu
      </div>

      <nav className="flex flex-col gap-2">
        {/* Role-based navigation */}
        {activeRole === "GUEST" && (
          <>
            <Link to="/guest/review" className={linkClasses("/guest/explore")}>
              <Home size={20} />
              Review
            </Link>
            <Link
              to="/guest/bookings"
              className={linkClasses("/guest/bookings")}
            >
              <Bookmark size={20} />
              My Bookings
            </Link>
          </>
        )}

        {activeRole === "HOST" && (
          <>
            <Link
              to="/host/properties"
              className={linkClasses("/host/bookings")}
            >
              <Building size={20} />
              Bookings
            </Link>

            <Link
              to="/host/bookings"
              className={linkClasses("/host/properties")}
            >
              <Bookmark size={20} />
              Property 
            </Link>

            <Link
              to="/host/add-property"
              className={linkClasses("/host/add-property")}
            >
              <Plus size={20} />
              Add Property
            </Link>
          </>
        )}

        {activeRole === "ADMIN" && (
          <>
            <Link to="/admin/users" className={linkClasses("/admin/users")}>
              <Users size={20} />
              Manage Users
            </Link>

            <Link to="/admin/reports" className={linkClasses("/admin/reports")}>
              <BarChart size={20} />
              Reports
            </Link>
          </>
        )}

        {/* Common Links */}
        <Link to="/profile" className={linkClasses("/profile")}>
          <User size={20} />
          Profile
        </Link>

        <Link
          to="/logout"
          className="flex items-center gap-3 px-4 py-3 mt-6 text-red-600 hover:bg-red-50 rounded-xl"
        >
          <LogOut size={20} />
          Logout
        </Link>
      </nav>
    </aside>
  );
}
