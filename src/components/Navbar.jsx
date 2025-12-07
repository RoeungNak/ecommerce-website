import React, { useState, useEffect, useRef, useContext, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  GlobeAltIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { FaUser, FaSignOutAlt, FaCog, FaHistory } from "react-icons/fa";
import { IoCartOutline } from "react-icons/io5";
import Logo from "../img/logo.png";
import { useCart } from "../context/CartContext";
import Swal from "sweetalert2";
import { AuthContext } from "../context/Auth";
import { apiUrl } from "../context/http";

const Navbar = () => {
  const { cartItem = [] } = useCart();
  const { t, i18n } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [languageOpen, setLanguageOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const languageRef = useRef(null);
  const searchRef = useRef(null);
  const profileRef = useRef(null);
  const [order, setOrder] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const { user, logout, LoginDashbord } = useContext(AuthContext);
  const navigate = useNavigate();
  const totalItems = cartItem.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    document.body.className = i18n.language === "kh" ? "lang-kh" : "lang-en";
  }, [i18n.language]);
  useEffect(() => {
    console.log("Current user:", user);
  }, [user]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${apiUrl}/latest-products`);
        if (res.ok) {
          const data = await res.json();
          setAllProducts(data.products.filter((p) => p.status === 1));
        }
      } catch (error) {
        console.error("Failed to fetch products for search", error);
      }
    };

    fetchProducts();
  }, []);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setLanguageOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchText.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchText.trim())}`);
      setSearchText("");
      setMenuOpen(false);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (languageRef.current && !languageRef.current.contains(event.target)) {
        setLanguageOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchText("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchResults = useMemo(() => {
    if (!searchText.trim()) return [];
    return allProducts.filter((item) =>
      item.title.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [searchText, allProducts]);

  const handleSuggestionClick = (productId) => {
    navigate(`/products/${productId}`);
    setSearchText("");
    setMenuOpen(false);
  };

  return (
    <div className="bg-white dark:bg-gray-900 py-3 shadow-md transition-all sticky top-0 z-50">
      {/* Mobile Header */}
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between md:hidden">
        <Link
          to="/"
          className="flex items-center text-2xl font-bold text-gray-900 dark:text-white"
        >
          <img src={Logo} alt="ZORA Logo" className="h-10 mr-2" />
          <span className="text-red-500">Z</span>ORA
        </Link>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-gray-700 dark:text-white"
        >
          {menuOpen ? (
            <XMarkIcon className="w-7 h-7" />
          ) : (
            <Bars3Icon className="w-7 h-7" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out px-4 ${
          menuOpen ? "max-h-screen opacity-100 pb-4" : "max-h-0 opacity-0"
        }`}
      >
        <form
          onSubmit={handleSearch}
          className="relative w-full my-2"
          ref={searchRef}
        >
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            className="w-full py-2 pl-4 pr-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-300"
          >
            <MagnifyingGlassIcon className="w-5 h-5" />
          </button>
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-lg rounded-md z-20">
              <p className="text-xs text-gray-500 px-4 pt-2 font-semibold uppercase">
                Product Suggestions
              </p>
              <ul className="py-1">
                {searchResults.slice(0, 5).map((item) => (
                  <li
                    key={item.id + item.size}
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => handleSuggestionClick(item.id)}
                  >
                    <div className="flex items-center gap-3 text-sm">
                      <img
                        src={item.image_url || "/placeholder.png"}
                        alt={item.title}
                        className="w-8 h-8 object-contain rounded"
                      />
                      <span className="text-gray-800 dark:text-white">
                        {item.title}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </form>

        <ul className="flex flex-col gap-2 text-lg font-medium text-gray-800 dark:text-white">
          <li>
            <Link to="/" onClick={() => setMenuOpen(false)}>
              {t("Home")}
            </Link>
          </li>
          <li>
            <Link to="/products" onClick={() => setMenuOpen(false)}>
              {t("Product")}
            </Link>
          </li>
          <li>
            <Link to="/about" onClick={() => setMenuOpen(false)}>
              {t("About")}
            </Link>
          </li>
          <li>
            <Link to="/contact" onClick={() => setMenuOpen(false)}>
              {t("Contact")}
            </Link>
          </li>
          <li>
            <Link to="/cart" onClick={() => setMenuOpen(false)}>
              {t("Card")}
            </Link>
          </li>
          {!user && (
            <>
              <li>
                <Link to="/login" onClick={() => setMenuOpen(false)}>
                  {t("Login")}
                </Link>
              </li>
              <li>
                <Link to="/signup" onClick={() => setMenuOpen(false)}>
                  {t("SignIn")}
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>

      {/* Desktop Navbar */}
      <div className="hidden md:flex max-w-7xl mx-auto px-4 items-center justify-between gap-6">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center text-3xl font-serif font-bold text-gray-900 dark:text-white"
        >
          <img src={Logo} alt="ZORA Logo" className="h-10 mr-2" />
          <span className="text-red-500">Z</span>ORA
        </Link>

        {/* Search */}
        <form
          onSubmit={handleSearch}
          className="relative flex-1 max-w-md"
          ref={searchRef}
        >
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            className="w-full py-2 pl-4 pr-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-300"
          >
            <MagnifyingGlassIcon className="w-5 h-5" />
          </button>
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-lg rounded-md z-20">
              <p className="text-xs text-gray-500 px-4 pt-2 font-semibold uppercase">
                Product Suggestions
              </p>
              <ul className="py-1">
                {searchResults.slice(0, 5).map((item) => (
                  <li
                    key={item.id + item.size}
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => handleSuggestionClick(item.id)}
                  >
                    <div className="flex items-center gap-3 text-sm">
                      <img
                        src={item.image_url || "/placeholder.png"}
                        alt={item.title}
                        className="w-8 h-8 object-contain rounded"
                      />
                      <span className="text-gray-800 dark:text-white">
                        {item.title}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </form>

        {/* Navigation */}
        <ul className="flex gap-6 items-center text-lg font-medium text-gray-800 dark:text-white whitespace-nowrap">
          <li>
            <Link
              to="/"
              className="hover:border-b-2 hover:border-red-500 transition"
            >
              {t("Home")}
            </Link>
          </li>
          <li>
            <Link
              to="/products"
              className="hover:border-b-2 hover:border-red-500 transition"
            >
              {t("Product")}
            </Link>
          </li>
          <li>
            <Link
              to="/about"
              className="hover:border-b-2 hover:border-red-500 transition"
            >
              {t("About")}
            </Link>
          </li>
          <li>
            <Link
              to="/contact"
              className="hover:border-b-2 hover:border-red-500 transition"
            >
              {t("Contact")}
            </Link>
          </li>

          {/* Language */}
          <li className="relative" ref={languageRef}>
            <button
              onClick={() => setLanguageOpen(!languageOpen)}
              className="cursor-pointer p-1 rounded-full hover:text-red-500"
              title={t("language")}
            >
              <GlobeAltIcon className="w-6 h-6 text-gray-700 dark:text-white" />
            </button>
            {languageOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-md rounded z-10">
                <ul className="text-sm py-2">
                  <li
                    onClick={() => changeLanguage("en")}
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center"
                  >
                    <span className="fi fi-us mr-2"></span> {t("English")}
                  </li>
                  <li
                    onClick={() => changeLanguage("kh")}
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center"
                  >
                    <span className="fi fi-kh mr-2"></span> {t("Khmer")}
                  </li>
                </ul>
              </div>
            )}
          </li>

          {/* Cart */}
          <li className="relative">
            <Link to="/cart" className="hover:text-red-500">
              <IoCartOutline className="w-6 h-6 text-gray-700 dark:text-white" />
              {totalItems > 0 && (
                <span className="absolute -top-3 -right-3 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {totalItems}
                </span>
              )}
            </Link>
          </li>

          {/* Profile / Login */}
          <li className="relative" ref={profileRef}>
            {user ? (
              <>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-gray-300 dark:border-gray-600 bg-gray-200 dark:bg-gray-700 hover:text-red-500 transition"
                  aria-label={t("userProfile")}
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <FaUser className="w-5 h-5 text-gray-500 dark:text-gray-300" />
                  )}
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-lg rounded-lg z-50">
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-600 flex items-center gap-3">
                      <FaUser className="w-6 h-6 text-gray-500 dark:text-gray-300" />
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-white text-sm">
                          {user.email || "No Email"}
                        </p>

                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {t("Member")}
                        </p>
                      </div>
                    </div>

                    {/* Other menu items */}
                    <ul className="text-sm py-2">
                      <Link
                        to="/account/orders"
                        className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-2 text-gray-800 dark:text-white"
                        onClick={() => setProfileOpen(false)}
                      >
                        <FaHistory className="w-4 h-4" /> {t("Order History")}
                      </Link>
                      <li
                        onClick={() => {
                          logout();
                          setProfileOpen(false);
                        }}
                        className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-2 text-gray-800 dark:text-white"
                      >
                        <FaSignOutAlt className="w-4 h-4" /> {t("Logout")}
                      </li>
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <div className="flex space-x-4 text-gray-800 dark:text-white">
                <Link to="/account/login" className="hover:text-red-500">
                  {t("Login")}
                </Link>
                <Link to="/account/register" className="hover:text-red-500">
                  {t("SignIn")}
                </Link>
              </div>
            )}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
