import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import warehouseReducer from "./slices/warehouseSlice";
import claimsReducer from "./slices/claimsSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    warehouse: warehouseReducer,
    claims: claimsReducer,
  },
});

export default store;
