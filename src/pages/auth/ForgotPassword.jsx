import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { forgotPassword } from "../../redux/slices/authSlice";
import { Link } from "react-router-dom";
import Input from "../../components/global/Input";
import Button from "../../components/global/Button";
import Card from "../../components/global/Card";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(forgotPassword(email));
    if (result.payload) {
      setSuccess(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <Card className="w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Forgot Password</h2>

        {success ? (
          <div className="text-center space-y-4">
            <div className="p-4 bg-green-100 text-green-700 rounded-lg">
              Reset link has been sent to your email. Please check your inbox.
            </div>
            <Link to="/login" className="text-blue-600 font-semibold hover:underline">
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                {typeof error === "string" ? error : "Request failed. Please try again."}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-gray-600 text-sm mb-4">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                fullWidth
                disabled={loading}
                className="mt-6"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm">
              <Link to="/login" className="text-blue-600 hover:underline">
                Back to Login
              </Link>
            </p>
          </>
        )}
      </Card>
    </div>
  );
};

export default ForgotPassword;
