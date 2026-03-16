import { useSelector } from "react-redux";

export const useAuth = () => {
  return useSelector((state) => state.auth);
};

export const useWarehouse = () => {
  return useSelector((state) => state.warehouse);
};

export const useClaims = () => {
  return useSelector((state) => state.claims);
};
