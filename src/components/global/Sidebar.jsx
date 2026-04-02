import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Package,
  FileText,
  BarChart3,
  ChevronDown,
  FileTextIcon,
  UserRoundPen,
  LogOut,
} from "lucide-react";
import { logout } from "../../redux/slices/authSlice";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [expandedMenu, setExpandedMenu] = useState(null);

  const isActive = (path) => location.pathname.startsWith(path);
  const isMenuExpanded = (menu) => expandedMenu === menu;

  const toggleMenu = (menu) => {
    setExpandedMenu(expandedMenu === menu ? null : menu);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const menuItems = [
    {
      label: "Dashboard",
      icon: <BarChart3 size={20} />,
      path: "/admin/dashboard",
    },
    {
      label: "Warehouses",
      icon: <Package size={20} />,
      submenu: [
        { label: "Warehouse List", path: "/admin/warehouses" },
        { label: "Add New Warehouse", path: "/admin/warehouses/add" },
        { label: "Add Warehouse Type", path: "/admin/warehouses/types" },
      ],
    },
    {
      label: "Payments",
      icon: <FileText size={20} />,
      submenu: [
        { label: "Payments List", path: "/admin/payments" },
        { label: "Add New Payment", path: "/admin/payments/add" },
      ],
    },
    {
      label: "Reports",
      icon: <FileTextIcon size={20} />,
      path: "/admin/reports",
    },
    {
      label: "Profile",
      icon: <UserRoundPen size={20} />,
      path: "/admin/profile",
    },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-gray-900 text-white min-h-screen sticky top-0 h-full">
      {/* LOGO */}
      <div className="p-6">
        <h2 className="text-2xl font-bold">WMS</h2>
      </div>

      {/* MENU */}
      <nav className="space-y-2 px-4 flex-1">
        {menuItems.map((item, index) => (
          <div key={index}>
            {item.submenu ? (
              <>
                <button
                  onClick={() => toggleMenu(item.label)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                    isMenuExpanded(item.label)
                      ? "bg-gray-800"
                      : "hover:bg-gray-800"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    {item.icon}
                    {item.label}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${
                      isMenuExpanded(item.label) ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isMenuExpanded(item.label) && (
                  <div className="bg-gray-800 rounded-lg mt-2 space-y-1">
                    {item.submenu.map((subitem, subindex) => (
                      <Link
                        key={subindex}
                        to={subitem.path}
                        className={`block px-4 py-2 rounded-lg text-sm transition-colors ${
                          isActive(subitem.path)
                            ? "bg-blue-600"
                            : "hover:bg-gray-700"
                        }`}
                      >
                        {subitem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path) ? "bg-blue-600" : "hover:bg-gray-800"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* LOGOUT BUTTON */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-gray-800 w-full cursor-pointer"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
