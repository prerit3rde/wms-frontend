import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../../redux/slices/authSlice";
import { Link, useNavigate } from "react-router-dom";
import Input from "../../components/global/Input";
import Button from "../../components/global/Button";
import Card from "../../components/global/Card";
import toast from "react-hot-toast";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const result = await dispatch(
      registerUser({
        name: form.name,
        email: form.email,
        password: form.password,
      })
    );

    if (result.payload) {
      toast.success("Registration successful! Please login.", {
        style: {
          maxWidth: "fit-content",
        },
      });
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <Card className="w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Register</h2>

        {/* {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {typeof error === "string" ? error : "Registration failed. Please try again."}
          </div>
        )} */}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <Input
              type="text"
              placeholder="Enter your name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input
              type="email"
              placeholder="Enter your email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <Input
              type="password"
              placeholder="Enter your password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Confirm Password</label>
            <Input
              type="password"
              placeholder="Confirm your password"
              required
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
            />
          </div>

          <Button
            type="submit"
            fullWidth
            disabled={loading}
            className="mt-6"
          >
            {loading ? "Registering..." : "Register"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 font-semibold hover:underline">
            Login
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default Register;
