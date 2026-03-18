import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../redux/slices/authSlice";
import { Link, useNavigate } from "react-router-dom";
import Input from "../../components/global/Input";
import Button from "../../components/global/Button";
import Card from "../../components/global/Card";
import toast from "react-hot-toast";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await dispatch(loginUser(form));
      if (result.payload && result.payload.token) {
        toast.success("Login successful!");
        navigate("/admin/dashboard");
      } else {
        toast.error("Wrong email or password. Please try again.", {
          style: {
            maxWidth: "fit-content",
          },
        });
      }
    } catch (error) {
      toast.error("Login failed. Please try again.", {
        style: {
          maxWidth: "fit-content",
        },
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-10 bg-gray-100 px-4">
      <h1 className="font-semibold text-3xl text-center leading-10">Madhya Pradesh Warehousing<br/>And Logistics Corporation</h1>
      <Card className="w-full max-w-md">

        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <Button type="submit" fullWidth disabled={loading} className="mt-6">
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm space-y-2">
          <p>
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-blue-600 font-semibold hover:underline"
            >
              Register
            </Link>
          </p>
          <p>
            <Link
              to="/forgot-password"
              className="text-blue-600 hover:underline"
            >
              Forgot Password?
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Login;
