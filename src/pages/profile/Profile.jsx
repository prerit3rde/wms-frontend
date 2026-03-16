import { useDispatch } from "react-redux";
import { logout } from "../../redux/slices/authSlice";
import { User, Mail, Shield, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/global/Button";
import Card from "../../components/global/Card";

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  let user = {
    name: "Admin User",
    email: "admin@example.com",
  };

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      user = {
        name: payload.name || "Admin User",
        email: payload.email || "admin@example.com",
      };
    } catch (error) {
      console.error("Invalid token");
    }
  }

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-5xl mx-auto px-4 space-y-6">

        {/* Profile Header */}
        <Card>
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
            </div>

          </div>
        </Card>

        {/* Account Information */}
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

        {/* Security Settings */}
        <Card>
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Shield size={18} /> Security
          </h2>

          <p className="text-gray-600 mb-6">
            Manage your login credentials and account security settings.
          </p>

          <div className="flex flex-wrap gap-3">

            <Button variant="outline">
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