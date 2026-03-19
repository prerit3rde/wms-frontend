import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/global/ProtectedRoute";
import DashboardLayout from "../layouts/DashboardLayout";

// Auth Pages
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

// Dashboard Pages
import DashboardHome from "../pages/dashboard/DashboardHome";
import Overview from "../pages/dashboard/Overview";

// Warehouse Pages
import WarehouseList from "../pages/warehouse/WarehouseList";
import AddWarehouse from "../pages/warehouse/AddWarehouse";
import EditWarehouse from "../pages/warehouse/EditWarehouse";
import ViewWarehouse from "../pages/warehouse/ViewWarehouse";
import WarehouseType from "../pages/warehouse/AddWarehouseType";

// Claims Pages
import ClaimList from "../pages/claims/ClaimList";
import AddClaim from "../pages/claims/AddClaim";
import EditClaim from "../pages/claims/EditClaim";
import ViewClaim from "../pages/claims/ViewClaim";

// Profile Page
import Profile from "../pages/profile/Profile";

// Reports
import Reports from "../pages/reports/Reports";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Protected Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard */}
          <Route path="dashboard" element={<DashboardHome />} />
          <Route path="overview" element={<Overview />} />

          {/* Warehouses */}
          <Route path="warehouses" element={<WarehouseList />} />
          <Route path="warehouses/types" element={<WarehouseType />} />
          <Route path="warehouses/add" element={<AddWarehouse />} />
          <Route path="warehouses/view/:id" element={<ViewWarehouse />} />
          <Route path="warehouses/edit/:id" element={<EditWarehouse />} />

          {/* Claims */}
          <Route path="claims" element={<ClaimList />} />
          <Route path="claims/add" element={<AddClaim />} />
          <Route path="claims/view/:id" element={<ViewClaim />} />
          <Route path="claims/edit/:id" element={<EditClaim />} />

          {/* Profile */}
          <Route path="profile" element={<Profile />} />
          <Route path="reports" element={<Reports />} />
        </Route>

        {/* Catch All - Redirect to Login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
