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

// Payments Pages
import PaymentList from "../pages/payments/PaymentList";
import AddPayment from "../pages/payments/AddPayment";
import EditPayment from "../pages/payments/EditPayment";
import ViewPayment from "../pages/payments/ViewPayment";

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

          {/* Payments */}
          <Route path="payments" element={<PaymentList />} />
          <Route path="payments/add" element={<AddPayment />} />
          <Route path="payments/view/:id" element={<ViewPayment />} />
          <Route path="payments/edit/:id" element={<EditPayment />} />

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
