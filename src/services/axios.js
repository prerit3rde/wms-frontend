import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const navigate = useNavigate();
      localStorage.removeItem("token");
      toast.error("Session expired. Please log in again.");
      navigate('/login');
    }
    
    // Handle network errors gracefully
    if (!error.response) {
      console.warn("Network error or API server is not running:", error.message);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
