import { FaBars, FaSignOutAlt } from "react-icons/fa";
import { GlobeAltIcon } from "@heroicons/react/24/outline";

import { useState, useRef, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AdminAuthContext } from "../../context/AdminAuth";

export default function Navbar({ toggleSidebar }) {
  const { t, i18n } = useTranslation();
  const { logout, user } = useContext(AdminAuthContext);

  const [openDropdown, setOpenDropdown] = useState(null);

  const languageRef = useRef(null);
  const profileRef = useRef(null);

  // Handle clicks outside dropdowns and ESC key
  useEffect(() => {
    const refs = [
      { ref: languageRef, type: "language" },
      { ref: profileRef, type: "profile" },
    ];

    const handleClickOutside = (e) => {
      refs.forEach(({ ref, type }) => {
        if (
          ref.current &&
          !ref.current.contains(e.target) &&
          openDropdown === type
        ) {
          setOpenDropdown(null);
        }
      });
    };

    const handleEsc = (e) => {
      if (e.key === "Escape") setOpenDropdown(null);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [openDropdown]);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setOpenDropdown(null);
  };

  return (
    <nav className="flex items-center justify-between bg-gray-600 px-4 py-3 border-b shadow-sm">
      {/* Sidebar toggle button */}
      <button
        onClick={toggleSidebar}
        className="text-blue-600 text-xl md:hidden"
        aria-label="Toggle sidebar"
      >
        <FaBars />
      </button>

      {/* Logo */}
      <div className="text-xl font-bold text-white">
        <h1>
          <span className="text-red-500">Z</span>ORA STORE
        </h1>
      </div>

      {/* Right section */}
      <div className="flex items-center space-x-4 mr-10">
        {/* Language */}
        <div ref={languageRef} className="relative">
          <button
            onClick={() =>
              setOpenDropdown(openDropdown === "language" ? null : "language")
            }
            className="p-1 rounded-full hover:text-red-500 cursor-pointer"
            aria-label="Select language"
            aria-haspopup="true"
            aria-expanded={openDropdown === "language"}
          >
            <GlobeAltIcon className="w-6 h-6 text-white" />
          </button>
          {openDropdown === "language" && (
            <div className="absolute right-0 mt-2 w-32 bg-white border shadow-md rounded">
              <ul className="text-sm py-2">
                <li
                  onClick={() => changeLanguage("en")}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                >
                  <span className="fi fi-us mr-2"></span> English
                </li>
                <li
                  onClick={() => changeLanguage("kh")}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                >
                  <span className="fi fi-kh mr-2"></span> Khmer
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Profile */}
        <div ref={profileRef} className="relative">
          {user ? (
            <>
              <button
                onClick={() =>
                  setOpenDropdown(openDropdown === "profile" ? null : "profile")
                }
                className="flex items-center space-x-2 text-white"
                aria-label="User profile"
                aria-haspopup="true"
                aria-expanded={openDropdown === "profile"}
              >
                <img
                  src={user.avatar || "/default-avatar.png"}
                  alt={user?.name || "Avatar"}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white"
                />
                <div className="hidden md:flex flex-col text-left">
                  <span className="font-semibold">{user?.name || "Admin"}</span>
                </div>
              </button>

              {openDropdown === "profile" && (
                <div className="absolute right-0 mt-2 w-48 bg-white border shadow-md rounded z-50">
                  <p className="font-medium">{user?.gmail}</p>

                  <ul className="text-sm py-2">
                    <li
                      onClick={logout}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                    >
                      <FaSignOutAlt className="mr-2" /> Logout
                    </li>
                  </ul>
                </div>
              )}
            </>
          ) : (
            <div className="space-x-4 text-white">
              <Link to="/account/login">{t("Login")}</Link>
              <Link to="/account/register">{t("SignIn")}</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
