import axios from "axios";
import { getAuthToken } from "../utils/tokenStorage";
const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
      "Content-Type": "application/json",
    }
})
axiosClient.interceptors.request.use((config)=>{
    const token = getAuthToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
})
export default axiosClient;