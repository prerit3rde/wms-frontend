import axios from "../../services/axios";

export const getWarehouseTypes = () =>
  axios.get("/warehouse-types");

export const createWarehouseType = (data) =>
  axios.post("/warehouse-types", data);

export const updateWarehouseType = (id, data) =>
  axios.put(`/warehouse-types/${id}`, data);

export const deleteWarehouseType = (id) =>
  axios.delete(`/warehouse-types/${id}`);