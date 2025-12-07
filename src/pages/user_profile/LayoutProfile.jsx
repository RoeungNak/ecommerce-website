import { useState } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline"; // 👈 add toggle icons
import SidebarUser from "./SidebarUser";

export default function LayoutProfile({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex relative min-h-screen bg-gray-100">
      {/* Sidebar (desktop + mobile) */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white shadow-lg transition-all duration-300 z-40
          ${sidebarOpen ? "w-64" : "w-0 md:w-16 overflow-hidden"}
        `}
      >
        <SidebarUser sidebarOpen={sidebarOpen} />
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Main Content */}
      <main
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "md:ml-64" : "md:ml-0"
        }`}
      >
        {/* Top Bar with Toggle */}
        <div className="flex items-center justify-between p-4 bg-white shadow md:hidden">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
          >
            {sidebarOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
          <h1 className="text-lg font-semibold text-gray-700">My Profile</h1>
        </div>

        {/* Page Content */}
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
