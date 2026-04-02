import axiosInstance from "./axios";

export const register = (data) =>
  axiosInstance.post("/auth/register", data);

export const login = (data) =>
  axiosInstance.post("/auth/login", data);

export const forgotPassword = (email) =>
  axiosInstance.post("/auth/forgot-password", { email });

export const resetPassword = (token, password) =>
  axiosInstance.post(`/auth/reset-password/${token}`, { password });

export const getProfile = () =>
  axiosInstance.get("/auth/profile");

export const updateProfile = (data) =>
  axiosInstance.put("/auth/profile", data);

export const logout = () => {
  localStorage.removeItem("token");
};
