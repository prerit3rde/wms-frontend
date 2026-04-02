import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/global/Button";
import Card from "../../components/global/Card";
import Input from "../../components/global/Input";
import axios from "../../services/axios";
import toast from "react-hot-toast";

const ChangePassword = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      await axios.put("/auth/change-password", formData);

      toast.success("Password updated successfully");

      navigate("/admin/profile");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error updating password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="">
      <h1 className="text-3xl font-bold">Change Password</h1>

      <div className="flex justify-center mt-8">
        <Card className="w-full max-w-[500px]">
          <h2 className="text-lg font-semibold text-center mb-6">
            Create a New Password
          </h2>

          <div className="space-y-4">
            <FormField label="Current Password">
              <Input
                type="password"
                name="currentPassword"
                label="Current Password"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Current Password"
              />
            </FormField>

            <FormField label="New Password">
              <Input
                type="password"
                name="newPassword"
                label="New Password"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="New Password"
              />
            </FormField>

            <FormField label="Confirm Password">
              <Input
                type="password"
                name="confirmPassword"
                label="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
              />
            </FormField>

            <div className="flex justify-between gap-4 pt-4">
              <Button
                variant="outline"
                onClick={() => navigate("/admin/profile")}
                className="w-full"
              >
                Cancel
              </Button>

              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full"
              >
                {loading ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

const FormField = ({ label, children }) => (
  <div className="flex flex-col">
    <label className="text-sm font-medium mb-2 text-gray-700">{label}</label>
    {children}
  </div>
);

export default ChangePassword;
