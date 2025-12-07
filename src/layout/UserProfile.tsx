import { useEffect, useState } from "react";
import {User, Phone, Mail, Calendar, Shield } from "lucide-react";
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
export default function UserProfile(){
    const [user, setUser] = useState<UserDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // useEffect(()=>{
    //     axiosClient.get("/user/me",{
          
    //     }).then(async (res) => {
    //     if (!res.ok) {
    //       const msg = await res.text();
    //       throw new Error(msg || `Error ${res.status}`);
    //     }
    //     return res.json();
    //   })
    //   .then((data) => {
    //     setUser(data);
    //   })
    //   .catch((err) => {
    //     console.error("Failed to fetch user:", err);
    //     setError("Failed to load user profile.");
    //   }).finally(()=>{
    //     setLoading(false);
    //   });
    // }, []);



    useEffect(() => {
  axiosClient.get("/user/me")
    .then((res) => setUser(res.data)
    
  )
    
    .catch(() => setError("Failed to load user"))
    .finally(() => setLoading(false));
}, []);

    if (loading)
    return (
      <div className="flex justify-center items-center h-64 text-gray-500 ">
        Loading profile...
      </div>
    );
    if(error)
        return (
    <div className="flex justify-center items-center h-64 text-red-500">
        {error}
    </div>
    );
    if(!user)
        return (
    <div className="flex justify-center items-center h-64 text-gray-400">
        No user data found
    </div>
    );
    return (
    <div
      className="max-w-xl ms-3 mx-auto mt-10 bg-white shadow-lg rounded-2xl p-6  border-orange-500 "
      style={{ fontFamily: "sans-serif" }}
    >
      <div className="flex flex-col items-center">
        <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          {user.profilePhotoPath ? (
            <img
              src={user.profilePhotoPath}
              alt="Profile"
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <User size={48} className="text-gray-400" />
          )}
        </div>

        <h2 className="text-2xl font-semibold text-gray-800">
          {user.firstName} {user.lastName}
        </h2>
        <p className="text-sm text-gray-500 mb-4">{user.role}</p>
      </div>

      <div className="space-y-3 mt-6">
        <div className="flex items-center gap-3 text-gray-700">
          <Mail size={18} className="text-gray-400" />
          <span>{user.email}</span>
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
  );
}
export {}