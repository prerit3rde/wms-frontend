import axiosInstance from "./axios";

export const getPayments = (params) =>
  axiosInstance.get("/payments", { params });

export const getPaymentById = (id) =>
  axiosInstance.get(`/payments/${id}`);

export const createPayment = (data) =>
  axiosInstance.post("/payments", data);

export const updatePayment = (id, data) =>
  axiosInstance.put(`/payments/${id}`, data);

export const deletePayment = (id) =>
  axiosInstance.delete(`/payments/${id}`);

export const approvePayment = (id) =>
  axiosInstance.patch(`/payments/${id}/approve`);

export const rejectPayment = (id) =>
  axiosInstance.patch(`/payments/${id}/reject`);