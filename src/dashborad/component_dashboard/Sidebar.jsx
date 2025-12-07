import {
  FaUserShield,
  FaTachometerAlt,
  FaUsers,
  FaBoxes,
  FaChevronRight,
  FaFileInvoiceDollar,
  FaChartLine,
  FaCogs,
  FaTruck,
  FaShoppingCart,
  FaClipboardList,
  FaFileAlt,
  FaTrademark,
  FaUserTie,
  FaUserCog,
  FaKey,
  FaBox,
} from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function Sidebar({ sidebarOpen, toggleSidebar }) {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  const { t } = useTranslation();

  const [submenuOpen, setSubmenuOpen] = useState(false);

  return (
    <>
      {/* Overlay on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-gray-800 text-white
          transition-transform duration-300 overflow-y-auto z-50
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0`}
      >
        <div className="text-center py-6 text-lg font-semibold border-b border-gray-700">
          <FaUserShield className="inline mr-2" /> Admin Panel
        </div>

        <nav className="mt-4">
          <Link
            to="/admin/dashboard"
            className={`block px-6 py-3 hover:bg-gray-700 ${
              isActive("/admin/dashboard") && "bg-gray-700"
            }`}
          >
            <FaTachometerAlt className="inline mr-2" /> {t("Dashboard")}
          </Link>

          <Link
            to="/admin/suppliers"
            className={`block px-6 py-3 hover:bg-gray-700 ${
              isActive("/admin/suppliers") && "bg-gray-700"
            }`}
          >
            <FaUsers className="inline mr-2" /> {t("Suppliers")}
          </Link>

          <Link
            to="/admin/categories"
            className={`block px-6 py-3 hover:bg-gray-700 ${
              isActive("/admin/categories") && "bg-gray-700"
            }`}
          >
            <FaBoxes className="inline mr-2" /> {t("Category")}
          </Link>
          <Link
            to="/admin/brands"
            className={`block px-6 py-3 hover:bg-gray-700 ${
              isActive("/admin/brands") && "bg-gray-700"
            }`}
          >
            <FaBox className="inline mr-2" />
            {t("Brand")}
          </Link>

          <Link
            to="/admin/products"
            className={`block px-6 py-3 hover:bg-gray-700 ${
              isActive("/admin/products") && "bg-gray-700"
            }`}
          >
            <FaFileInvoiceDollar className="inline mr-2" /> {t("Products")}
          </Link>

          {/* <Link
            to="/delivery"
            className={`block px-6 py-3 hover:bg-gray-700 ${
              isActive("/delivery") && "bg-gray-700"
            }`}
          >
            <FaTruck className="inline mr-2" /> {t("Delivery")}
          </Link> */}

          <Link
            to="/admin/orders"
            className={`block px-6 py-3 hover:bg-gray-700 ${
              isActive("/admin/orders") && "bg-gray-700"
            }`}
          >
            <FaShoppingCart className="inline mr-2" /> {t("Orders")}
          </Link>
          <Link
            to="/admin/roles"
            className={`block px-6 py-3 hover:bg-gray-700 ${
              isActive("/admin/roles") && "bg-gray-700"
            }`}
          >
            <FaUserShield className="inline mr-2" /> {t("Roles")}
          </Link>
        </nav>
      </aside>
    </>
  );
}
