import { Menu, LogOut } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/slices/authSlice";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Header = ({ onMenuToggle }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  /* ================= GET USER NAME FROM TOKEN ================= */

  const token = localStorage.getItem("token");

  let userName = "User";

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      userName = payload.name || "User";
    } catch (error) {
      console.error("Invalid token");
    }
  }

  const firstLetter = userName.charAt(0).toUpperCase();

  /* ================= CLOSE DROPDOWN ON OUTSIDE CLICK ================= */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /* ================= LOGOUT ================= */

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <div className="flex items-center justify-between px-6 py-4">

        {/* LEFT SIDE */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="lg:hidden text-gray-700 hover:text-gray-900"
          >
            <Menu size={24} />
          </button>

          <h1 className="text-xl font-bold text-gray-800">
            Madhya Pradesh Warehousing And Logistics Corporation
          </h1>
        </div>

        {/* PROFILE DROPDOWN */}
        <div className="relative" ref={dropdownRef}>

          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {firstLetter}
            </div>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">

              <Link
                to="/admin/profile"
                onClick={() => setIsDropdownOpen(false)}
                className="block px-4 py-2 hover:bg-gray-100 text-gray-700"
              >
                Profile
              </Link>

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 flex items-center gap-2"
              >
                <LogOut size={16} />
                Logout
              </button>

            </div>
          )}

        </div>

      </div>
    </header>
  );
};

export default Header;