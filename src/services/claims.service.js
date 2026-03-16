import axiosInstance from "./axios";

export const getClaims = (params) =>
  axiosInstance.get("/claims", { params });

export const getClaimById = (id) =>
  axiosInstance.get(`/claims/${id}`);

export const createClaim = (data) =>
  axiosInstance.post("/claims", data);

export const updateClaim = (id, data) =>
  axiosInstance.put(`/claims/${id}`, data);

export const deleteClaim = (id) =>
  axiosInstance.delete(`/claims/${id}`);

export const approveClaim = (id) =>
  axiosInstance.patch(`/claims/${id}/approve`);

export const rejectClaim = (id) =>
  axiosInstance.patch(`/claims/${id}/reject`);