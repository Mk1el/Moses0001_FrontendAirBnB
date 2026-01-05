import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import toast, { Toaster } from "react-hot-toast";

import axiosClient from "../api/axiosClient";
import { saveAuthData } from "../utils/tokenStorage";

import housingImage from "../assets/images/Login_Images.webp";

interface LoginForm {
  email: string;
  password: string;
}

interface JwtPayload {
  email: string;
  role: "GUEST" | "HOST" | "ADMIN";
  exp?: number;
  iat?: number;
}

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const redirectToDashboard = (role: JwtPayload["role"]) => {
    switch (role) {
      case "ADMIN":
        navigate("/admin/dashboard");
        break;
      case "HOST":
        navigate("/host/dashboard");
        break;
      default:
        navigate("/guest/dashboard");
    }
  };

  const handleLoginSuccess = (token: string) => {
    const decoded: JwtPayload = jwtDecode(token);
    saveAuthData(token, decoded.role);
    localStorage.setItem("role", decoded.role);
    redirectToDashboard(decoded.role);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axiosClient.post("/auth/login", form);
      handleLoginSuccess(res.data.accessToken);
      toast.success("Login successful!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const res = await axiosClient.post("/auth/google-login", {
        token: credentialResponse.credential,
      });
      handleLoginSuccess(res.data.token);
      toast.success("Google login successful!");
    } catch {
      toast.error("Google login failed");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: `url(${housingImage})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50"></div>

      <Toaster />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur rounded-xl shadow-lg p-8 mx-4 border-orange-900">
        <h1 className="text-2xl font-bold text-center mb-6">Login</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <button
            type="submit"
            className="w-full p-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>

        <div className="my-6 text-center text-sm text-gray-500">OR</div>

        <div className="flex justify-center">
          <GoogleLogin onSuccess={handleGoogleSuccess} />
        </div>

        <p className="text-center mt-4">
          <RouterLink
            to="/forgot-password"
            className="text-orange-500 font-semibold hover:underline"
          >
            Forgot password?
          </RouterLink>
        </p>

        <p className="text-center mt-4">
          New user?{" "}
          <RouterLink
            to="/register"
            className="text-blue-600 font-semibold hover:underline"
          >
            Create an Account
          </RouterLink>
        </p>
      </div>
    </div>
  );
}
