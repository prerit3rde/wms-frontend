import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const EmailConfirmed = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);

      // small delay for UX
      setTimeout(() => {
        navigate("/admin/profile");
      }, 1500);
    }
  }, []);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="bg-white p-6 rounded shadow text-center">
        <h2 className="text-green-600 text-xl font-semibold">
          ✅ Email Updated Successfully
        </h2>
        <p className="text-gray-500 mt-2">
          Redirecting to profile...
        </p>
      </div>
    </div>
  );
};

export default EmailConfirmed;