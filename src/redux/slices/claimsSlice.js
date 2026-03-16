import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as claimService from "../../services/claims.service";

/* ================= FETCH CLAIMS ================= */
export const fetchClaims = createAsyncThunk(
  "claims/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      const res = await claimService.getClaims(params);
      return res.data; // { success, data, total }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch claims"
      );
    }
  }
);

/* ================= FETCH SINGLE ================= */
export const fetchClaimById = createAsyncThunk(
  "claims/fetchOne",
  async (id, { rejectWithValue }) => {
    try {
      const res = await claimService.getClaimById(id);
      return res.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch claim"
      );
    }
  }
);

/* ================= CREATE ================= */
export const createNewClaim = createAsyncThunk(
  "claims/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await claimService.createClaim(data);
      return res.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create claim"
      );
    }
  }
);

/* ================= UPDATE ================= */
export const updateExistingClaim = createAsyncThunk(
  "claims/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await claimService.updateClaim(id, data);
      return res.data.data; // now this exists
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update claim"
      );
    }
  }
);

/* ================= DELETE ================= */
export const removeClaim = createAsyncThunk(
  "claims/delete",
  async (id, { rejectWithValue }) => {
    try {
      await claimService.deleteClaim(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete claim"
      );
    }
  }
);

/* ================= APPROVE ================= */
export const approveExistingClaim = createAsyncThunk(
  "claims/approve",
  async (id, { rejectWithValue }) => {
    try {
      await claimService.approveClaim(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to approve claim"
      );
    }
  }
);

/* ================= REJECT ================= */
export const rejectExistingClaim = createAsyncThunk(
  "claims/reject",
  async (id, { rejectWithValue }) => {
    try {
      await claimService.rejectClaim(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to reject claim"
      );
    }
  }
);

/* ================= INITIAL STATE ================= */
const initialState = {
  items: [],
  currentClaim: null,
  total: 0,
  totalPages: 0,
  page: 1,
  limit: 10,
  loading: false,
  error: null,
};

/* ================= SLICE ================= */
const claimsSlice = createSlice({
  name: "claims",
  initialState,
  reducers: {
    setPage: (state, action) => {
      state.page = action.payload;
    },
    setLimit: (state, action) => {
      state.limit = action.payload;
    },
    clearCurrentClaim: (state) => {
      state.currentClaim = null;
    },
  },
  extraReducers: (builder) => {
    builder

      /* FETCH ALL */
      .addCase(fetchClaims.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClaims.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data || [];
        state.total = action.payload.total || 0;
        state.totalPages = Math.ceil(
          state.total / state.limit
        );
      })
      .addCase(fetchClaims.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* FETCH ONE */
      .addCase(fetchClaimById.fulfilled, (state, action) => {
        state.currentClaim = action.payload;
      })

      /* CREATE */
      .addCase(createNewClaim.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })

      /* UPDATE */
      .addCase(updateExistingClaim.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id
        );

        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })

      /* DELETE */
      .addCase(removeClaim.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (item) => item.id !== action.payload
        );
      })

      /* APPROVE */
      .addCase(approveExistingClaim.fulfilled, (state, action) => {
        const claim = state.items.find(
          (item) => item.id === action.payload
        );
        if (claim) claim.status = "Approved";
      })

      /* REJECT */
      .addCase(rejectExistingClaim.fulfilled, (state, action) => {
        const claim = state.items.find(
          (item) => item.id === action.payload
        );
        if (claim) claim.status = "Rejected";
      });
  },
});

export const {
  setPage,
  setLimit,
  clearCurrentClaim,
} = claimsSlice.actions;

export default claimsSlice.reducer;