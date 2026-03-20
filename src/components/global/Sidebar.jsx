import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Package,
  FileText,
  BarChart3,
  ChevronDown,
  FileTextIcon,
} from "lucide-react";

const Sidebar = () => {
  const location = useLocation();
  const [expandedMenu, setExpandedMenu] = useState(null);

  const isActive = (path) => location.pathname.startsWith(path);
  const isMenuExpanded = (menu) => expandedMenu === menu;

  const toggleMenu = (menu) => {
    setExpandedMenu(expandedMenu === menu ? null : menu);
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
  ];

  return (
    <aside className="hidden lg:block w-64 bg-gray-900 text-white min-h-screen overflow-y-auto sticky top-0 h-full">
      <div className="p-6">
        <h2 className="text-2xl font-bold">WMS</h2>
      </div>

      <nav className="space-y-2 px-4">
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
    </aside>
  );
};

export default Sidebar;
