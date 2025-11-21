
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  email: string;
  role: "GUEST" | "HOST" | "ADMIN";
}

export const getUserFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    return jwtDecode<JwtPayload>(token);
  } catch {
    return null;
  }
};

export {};
