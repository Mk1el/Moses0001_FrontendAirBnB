import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { GoogleLogin, googleLogout } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

import toast, { Toaster } from "react-hot-toast";

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

  const redirectToDashboard = (role: "GUEST" | "HOST" | "ADMIN") => {
    switch (role) {
      case "ADMIN":
        navigate("/admin/dashboard");
        break;
      case "HOST":
        navigate("/host/dashboard");
        break;
      case "GUEST":
      default:
        navigate("/guest/dashboard");
        break;
    }
  };

  const handleLoginSuccess = (token: string) => {
    localStorage.setItem("token", token);
    const decoded: JwtPayload = jwtDecode(token);
    console.log("Decoded JWT:", decoded);
    localStorage.setItem("role", decoded.role);
    redirectToDashboard(decoded.role);
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const res = await axios.post("http://localhost:8000/api/auth/login", form);

    const token = res.data.accessToken; 
    handleLoginSuccess(token); 
    toast.success("Login successful!");
  } catch (err: any) {
    console.error("Login error:", err);
    toast.error(err.response?.data?.message || "Login failed");
  }
};


  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      // Google JWT token
      const token = credentialResponse.credential;
      console.log("Google token:", token);

      // Optionally send to backend to create/check user
      const res = await axios.post("http://localhost:8000/api/auth/google-login", {
        token, // send Google token
      });
      console.log("Google login backend response:", res.data);

      handleLoginSuccess(res.data.token); // Use backend-issued JWT
      toast.success("Google login successful!");
    } catch (err: any) {
      console.error("Google login error:", err);
      toast.error("Google login failed");
    }
  };

  const handleGoogleFailure = (err?: any) => {
    console.error("Google login failed:", err);
    toast.error("Google login failed");
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Toaster />
      <div className="p-8 bg-white rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full p-3 border rounded"
            required
          />
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full p-3 border rounded"
            required
          />
          <button
            type="submit"
            className="w-full p-3 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Login
          </button>
        </form>

        <div className="mt-6 text-center">OR</div>

        <div className="mt-4 flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleFailure}
          />
        </div>
        <p className="text-center mt-4">
  New user?{" "}
  <a href="/register" className="text-blue-600 font-semibold hover:underline">
    Create an Account
  </a>
</p>

      </div>
    </div>
  );
}


export {};