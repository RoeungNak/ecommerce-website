import {
  FaUserCircle,
  FaShoppingBag,
  FaKey,
  FaSignOutAlt,
  FaUser,
} from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../context/Auth";

export default function SidebarUser({ sidebarOpen, toggleSidebar }) {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  const { t } = useTranslation();

  const [submenuOpen, setSubmenuOpen] = useState(false);
  const { logout } = useContext(AuthContext);

  return (
    <>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen w-64 
          bg-gradient-to-b from-gray-500 to-gray-500 text-white
          shadow-lg flex flex-col
          transition-transform duration-300 overflow-y-auto z-50
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-center h-14 border-b border-gray-700">
          <h1 className="text-xl font-bold tracking-wide">{t("My Account")}</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 space-y-1">
          <div className="flex justify-center items-center mb-1">
            <FaUserCircle className="w-15 h-15 text-gray-500 dark:text-gray-300" />
          </div>
          <div className="border-b border-gray-700 py-4 flex items-center justify-center mb-4">
            <h3 className="text-xl font-bold ">Welcome to Your Profile </h3>
          </div>

          <Link
            to="/account/orders"
            className={`flex items-center px-6 py-3 rounded-lg mx-2 transition-colors duration-200
              ${
                isActive("/account/orders")
                  ? "bg-gray-700 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
          >
            <FaShoppingBag className="mr-3 text-lg" /> {t("Orders")}
          </Link>

          <Link
            to="/account/change-password"
            className={`flex items-center px-6 py-3 rounded-lg mx-2 transition-colors duration-200
              ${
                isActive("/account/change-password")
                  ? "bg-gray-700 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
          >
            <FaKey className="mr-3 text-lg" /> {t("Change Password")}
          </Link>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 text-center text-sm text-gray-400">
          © 2025 ZORA STORE
        </div>
      </aside>
    </>
  );
}
