import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import warehouseReducer from "./slices/warehouseSlice";
import paymentsReducer from "./slices/paymentsSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    warehouse: warehouseReducer,
    payments: paymentsReducer,
  },
});

export default store;
