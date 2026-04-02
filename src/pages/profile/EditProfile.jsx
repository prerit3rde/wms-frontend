import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/global/Button";
import Card from "../../components/global/Card";
import Input from "../../components/global/Input";
import axios from "../../services/axios";
import toast from "react-hot-toast";

const EditProfile = () => {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const payload = JSON.parse(atob(token.split(".")[1]));

  const [formData, setFormData] = useState({
    name: payload.name,
    email: payload.email,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const res = await axios.put("/auth/update-profile", formData);

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }

      toast.success(res.data.message, {
        style: { 
          maxWidth: "fit-content",
         },
      });

      // 🔥 FORCE REFRESH → VERY IMPORTANT
      // window.location.href = "/admin/profile";
      navigate("/admin/profile");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error updating profile", {
        style: { 
          maxWidth: "fit-content",
         },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="">
      <h1 className="text-3xl font-bold">Edit Profile</h1>

      <div className="flex justify-center mt-8">
        <Card className="w-full max-w-[500px]">
          <h2 className="text-lg font-semibold text-center mb-6">
            Edit Your Profile Information
          </h2>
          <div className="space-y-4">
            <FormField label="Full Name">
              <Input
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </FormField>
            <FormField label="Email Address">
              <Input
                label="Email Address"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </FormField>

            <div className="flex gap-4 pt-4">
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
                {loading ? "Saving..." : "Save Changes"}
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

export default EditProfile;
