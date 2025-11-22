import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

import Login from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import GuestDashboard from "./pages/GuestDashboard";
import HostDashboard from "./pages/HostDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import DashboardLayout from "./layout/DashboardLayout";
import UserProfile from "./layout/UserProfile";
import PropertyList from "./components/Property/PropertyList";
import BookingsPage from "./components/Booking/BookingPage";
import ReviewsPage from "./components/Reviews/ReviewsPage";
import axiosClient from "./api/axiosClient";

interface Role {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: "GUEST" | "HOST" | "ADMIN";
  profilePhotoPath: string | null;
  createdAt: string;
}

function App() {
  const [role, setRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // useEffect(() => {
  //   const token = localStorage.getItem("token");
  //   if (!token) {
  //     setIsLoading(false);
  //     return;
  //   }

  //   axios
  //     .get<User>("http://localhost:8000/api/user/me", {
  //       headers: { Authorization: `Bearer ${token}` },
  //     })
  //     .then((res) => setUser(res.data))
  //     .catch(() => setUser(null))
  //     .finally(() => setIsLoading(false));
  // }, []);
  useEffect(()=>{
    
    axiosClient.get("/user/me")
    .then((res)=> setRole(res.data))
    .catch(()=> setRole(null))
    .finally(()=> setIsLoading(false))
    
  },[])
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          element={
            <ProtectedRoute allowedRoles={["GUEST", "HOST", "ADMIN"]}>
              <DashboardLayout user={role} />
            </ProtectedRoute>
          }
        >
          <Route path="/guest/dashboard" element={<GuestDashboard />} />
          
          <Route path="/host/dashboard" element={<HostDashboard />} />
          <Route path="/host/bookings" element={<PropertyList/>}/>
          <Route path="/guest/review" element={<ReviewsPage />}/>
          <Route path="/guest/bookings" element={<BookingsPage/>}/>
          <Route path="/host/properties" element={<BookingsPage/>}/>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          <Route path="/profile" element={<UserProfile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
