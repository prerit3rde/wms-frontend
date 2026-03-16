import axios from "./axios";

export const getWarehouses = (params) => {
  return axios.get("/warehouses", {
    params: {
      page: params?.page || 1,
      limit: params?.limit || 10,
      search: params?.search || "",
      sort: params?.sort || "date_desc",
      district: params?.district || "",
      branch: params?.branch || "",
      warehouse_name: params?.warehouse_name || "",
      warehouse_type: params?.warehouse_type || "",
    },
  });
};

export const getWarehouseById = (id) =>
  axios.get(`/warehouses/${id}`);

export const createWarehouse = (data) =>
  axios.post("/warehouses", data);

export const updateWarehouse = (id, data) =>
  axios.put(`/warehouses/${id}`, data);

export const deleteWarehouse = (id) =>
  axios.delete(`/warehouses/${id}`);

export const getWarehouseFilters = () =>
  axios.get("/warehouses/filters");