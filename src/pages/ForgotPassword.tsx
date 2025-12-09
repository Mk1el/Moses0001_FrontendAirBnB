import {Container, Box, Button, Grid, TextField, Typography } from "@mui/material";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { setForgotEmail } from "../utils/forgotSession";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const[loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const handleSubmit = async (e:React.FormEvent) =>{
        e.preventDefault();
        setLoading(true);
        try{
            await axiosClient.post("/auth/forgot-password", {email})
            setForgotEmail(email);
            toast.success("OTP sent to your email!");
            navigate("/verify-otp");
        }catch(err:any){
            console.error("Forgot password error:", err);
            toast.error(err?.response?.data?.message || "Unable to send OTP");
        }finally{
            setLoading(false);
        }
    };
    return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Toaster />

      <div className="p-8 bg-white rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Forgot Password</h1>
        <p className="text-center text-gray-600 mb-6">
          Enter your registered email to receive a verification code.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            className="w-full p-3 border rounded"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full p-3 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>

        <p className="text-center mt-4">
          <a href="/login" className="text-blue-500 hover:underline">
            Back to Login
          </a>
        </p>
      </div>
    </div>
  );
}