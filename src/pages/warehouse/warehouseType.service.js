import axios from "../../services/axios";

export const getWarehouseTypes = () =>
  axios.get("/warehouse-types");

export const createWarehouseType = (data) =>
  axios.post("/warehouse-types", data);

export const updateWarehouseType = (id, data) =>
  axios.put(`/warehouse-types/${id}`, data);

export const deleteWarehouseType = (id) =>
  axios.delete(`/warehouse-types/${id}`);

export const setDefaultWarehouseType = (id) =>
  axios.patch(`/warehouse-types/${id}/set-default`);

export const unsetDefaultWarehouseType = (id) =>
  axios.patch(`/warehouse-types/${id}/unset-default`);

export const getDefaultWarehouseType = () =>
  axios.get("/warehouse-types/default");