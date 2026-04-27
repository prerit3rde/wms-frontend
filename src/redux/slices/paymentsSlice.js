import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as paymentService from "../../services/payments.service";

/* ================= FETCH PAYMENTS ================= */
export const fetchPayments = createAsyncThunk(
  "payments/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      const res = await paymentService.getPayments(params);
      return res.data; // { success, data, total }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch payments"
      );
    }
  }
);

/* ================= FETCH SINGLE ================= */
export const fetchPaymentById = createAsyncThunk(
  "payments/fetchOne",
  async (id, { rejectWithValue }) => {
    try {
      const res = await paymentService.getPaymentById(id);
      return res.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch payment"
      );
    }
  }
);

/* ================= CREATE ================= */
export const createNewPayment = createAsyncThunk(
  "payments/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await paymentService.createPayment(data);
      return res.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create payment"
      );
    }
  }
);

/* ================= UPDATE ================= */
export const updateExistingPayment = createAsyncThunk(
  "payments/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await paymentService.updatePayment(id, data);
      return res.data.data; // now this exists
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update payment"
      );
    }
  }
);

/* ================= DELETE ================= */
export const removePayment = createAsyncThunk(
  "payments/delete",
  async (id, { rejectWithValue }) => {
    try {
      await paymentService.deletePayment(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete payment"
      );
    }
  }
);

/* ================= APPROVE ================= */
export const approveExistingPayment = createAsyncThunk(
  "payments/approve",
  async (id, { rejectWithValue }) => {
    try {
      await paymentService.approvePayment(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to approve payment"
      );
    }
  }
);

/* ================= REJECT ================= */
export const rejectExistingPayment = createAsyncThunk(
  "payments/reject",
  async (id, { rejectWithValue }) => {
    try {
      await paymentService.rejectPayment(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to reject payment"
      );
    }
  }
);

/* ================= INITIAL STATE ================= */
const initialState = {
  items: [],
  currentPayment: null,
  total: 0,
  totalPages: 0,
  page: 1,
  limit: 50,
  loading: false,
  error: null,
};

/* ================= SLICE ================= */
const paymentsSlice = createSlice({
  name: "payments",
  initialState,
  reducers: {
    setPage: (state, action) => {
      state.page = action.payload;
    },
    setLimit: (state, action) => {
      state.limit = action.payload;
    },
    clearCurrentPayment: (state) => {
      state.currentPayment = null;
    },
  },
  extraReducers: (builder) => {
    builder

      /* FETCH ALL */
      .addCase(fetchPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data || [];
        state.total = action.payload.total || 0;
        state.totalPages = Math.ceil(
          state.total / state.limit
        );
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* FETCH ONE */
      .addCase(fetchPaymentById.fulfilled, (state, action) => {
        state.currentPayment = action.payload;
      })

      /* CREATE */
      .addCase(createNewPayment.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })

      /* UPDATE */
      .addCase(updateExistingPayment.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id
        );

        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })

      /* DELETE */
      .addCase(removePayment.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (item) => item.id !== action.payload
        );
      })

      /* APPROVE */
      .addCase(approveExistingPayment.fulfilled, (state, action) => {
        const payment = state.items.find(
          (item) => item.id === action.payload
        );
        if (payment) payment.status = "Approved";
      })

      /* REJECT */
      .addCase(rejectExistingPayment.fulfilled, (state, action) => {
        const payment = state.items.find(
          (item) => item.id === action.payload
        );
        if (payment) payment.status = "Rejected";
      });
  },
});

export const {
  setPage,
  setLimit,
  clearCurrentPayment,
} = paymentsSlice.actions;

export default paymentsSlice.reducer;