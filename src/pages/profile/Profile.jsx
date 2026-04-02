import { useDispatch } from "react-redux";
import { logout } from "../../redux/slices/authSlice";
import { User, Mail, Shield, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Button from "../../components/global/Button";
import Card from "../../components/global/Card";

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [user, setUser] = useState({
    name: "Admin User",
    email: "admin@example.com",
    pendingEmail: null,
  });

  // ✅ Always load latest token data
  useEffect(() => {
    const loadUser = () => {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));

          setUser({
            name: payload.name || "Admin User",
            email: payload.email || "admin@example.com",
            pendingEmail: payload.pending_email || null,
          });
          console.log("Loaded user from token:", payload);
        } catch (error) {
          console.error("Invalid token");
        }
      }
    };

    loadUser();

    // 🔥 Re-run when coming back to page
    window.addEventListener("focus", loadUser);

    return () => {
      window.removeEventListener("focus", loadUser);
    };
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-5xl mx-auto px-4 space-y-6">
        {/* ================= PROFILE HEADER ================= */}
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white">
                <User size={36} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {user.name}
                </h1>

                <p className="text-gray-500 flex items-center gap-2">
                  <Mail size={16} /> {user.email}
                </p>

                {/* 🔥 PENDING EMAIL */}
                {user.pendingEmail && (
                  <div className="mt-2 px-3 py-2 bg-yellow-100 text-yellow-700 text-sm rounded">
                    Email change pending: {user.pendingEmail}
                  </div>
                )}
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => navigate("/admin/edit-profile")}
            >
              Edit Profile
            </Button>
          </div>
        </Card>

        {/* ================= ACCOUNT INFO ================= */}
        <Card>
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <User size={18} /> Account Information
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-500 text-sm">Full Name</p>
              <p className="font-medium">{user.name}</p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">Email Address</p>
              <p className="font-medium">{user.email}</p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">Role</p>
              <p className="font-medium">Administrator</p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">Account Status</p>
              <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-700">
                Active
              </span>
            </div>
          </div>
        </Card>

        {/* ================= SECURITY ================= */}
        <Card>
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Shield size={18} /> Security
          </h2>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate("/admin/change-password")}
            >
              Change Password
            </Button>

            <Button
              variant="danger"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut size={16} />
              Logout
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
