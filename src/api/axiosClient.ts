import axios from "axios";
import { clearAuthData, getAuthToken } from "../utils/tokenStorage";

const API_URL = process.env.REACT_APP_API_URL
const axiosClient = axios.create({
    baseURL: API_URL,
    headers: {
      "Content-Type": "application/json",
    }
})

axiosClient.interceptors.request.use((config)=>{
    const token = getAuthToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
})
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
           clearAuthData();
      window.location.href = "/"; 
    }
    return Promise.reject(error);
  }
);

export default axiosClient;