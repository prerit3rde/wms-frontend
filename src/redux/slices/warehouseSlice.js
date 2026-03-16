import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as warehouseService from "../../services/warehouse.service";

/* =====================================================
   FETCH WAREHOUSES (Pagination + Search + Sort)
===================================================== */
export const fetchWarehouses = createAsyncThunk(
  "warehouse/fetchWarehouses",
  async (params, { rejectWithValue }) => {
    try {
      const response = await warehouseService.getWarehouses(params);
      return response.data; // { success, data, total }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch warehouses"
      );
    }
  }
);

/* =====================================================
   FETCH SINGLE
===================================================== */
export const fetchWarehouseById = createAsyncThunk(
  "warehouse/fetchWarehouseById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await warehouseService.getWarehouseById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch warehouse"
      );
    }
  }
);

/* =====================================================
   CREATE
===================================================== */
export const createWarehouse = createAsyncThunk(
  "warehouse/createWarehouse",
  async (data, { rejectWithValue }) => {
    try {
      const response = await warehouseService.createWarehouse(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create warehouse"
      );
    }
  }
);

/* =====================================================
   UPDATE
===================================================== */
export const updateWarehouse = createAsyncThunk(
  "warehouse/updateWarehouse",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await warehouseService.updateWarehouse(id, data);
      return { id, data: response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update warehouse"
      );
    }
  }
);

/* =====================================================
   DELETE
===================================================== */
export const deleteWarehouse = createAsyncThunk(
  "warehouse/deleteWarehouse",
  async (id, { rejectWithValue }) => {
    try {
      await warehouseService.deleteWarehouse(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete warehouse"
      );
    }
  }
);

/* =====================================================
   INITIAL STATE
===================================================== */
const initialState = {
  items: [],
  currentWarehouse: null,
  total: 0,
  totalPages: 0,
  page: 1,
  limit: 10,
  loading: false,
  error: null,
};

/* =====================================================
   SLICE
===================================================== */
const warehouseSlice = createSlice({
  name: "warehouse",
  initialState,
  reducers: {
    setPage: (state, action) => {
      state.page = action.payload;
    },
    setLimit: (state, action) => {
      state.limit = action.payload;
    },
    clearCurrentWarehouse: (state) => {
      state.currentWarehouse = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    /* ================= FETCH ALL ================= */
    builder.addCase(fetchWarehouses.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(fetchWarehouses.fulfilled, (state, action) => {
      state.loading = false;
      state.items = action.payload.data || [];
      state.total = action.payload.total || 0;
      state.totalPages = Math.ceil(state.total / state.limit);
    });

    builder.addCase(fetchWarehouses.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    /* ================= FETCH SINGLE ================= */
    builder.addCase(fetchWarehouseById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(fetchWarehouseById.fulfilled, (state, action) => {
      state.loading = false;
      state.currentWarehouse = action.payload;
    });

    builder.addCase(fetchWarehouseById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    /* ================= CREATE ================= */
    builder.addCase(createWarehouse.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(createWarehouse.fulfilled, (state) => {
      state.loading = false;
      // Instead of pushing manually,
      // better to refetch list after create for pagination safety
    });

    builder.addCase(createWarehouse.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    /* ================= UPDATE ================= */
    builder.addCase(updateWarehouse.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(updateWarehouse.fulfilled, (state, action) => {
      state.loading = false;

      const index = state.items.findIndex(
        (item) => item.id === action.payload.id
      );

      if (index !== -1) {
        state.items[index] = {
          ...state.items[index],
          ...action.payload.data,
        };
      }

      if (
        state.currentWarehouse &&
        state.currentWarehouse.id === action.payload.id
      ) {
        state.currentWarehouse = {
          ...state.currentWarehouse,
          ...action.payload.data,
        };
      }
    });

    builder.addCase(updateWarehouse.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    /* ================= DELETE ================= */
    builder.addCase(deleteWarehouse.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(deleteWarehouse.fulfilled, (state, action) => {
      state.loading = false;
      state.items = state.items.filter(
        (item) => item.id !== action.payload
      );
      state.total -= 1;
      state.totalPages = Math.ceil(state.total / state.limit);
    });

    builder.addCase(deleteWarehouse.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});

export const {
  setPage,
  setLimit,
  clearCurrentWarehouse,
  clearError,
} = warehouseSlice.actions;

export default warehouseSlice.reducer;