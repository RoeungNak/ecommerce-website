import React from "react";
import "./index.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Products from "./pages/Products";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import Login from "./pages/admin/Login";
import SignUp from "./pages/admin/SignUp";
import "flag-icons/css/flag-icons.min.css";
import Carousel from "./components/Carousel";
import Footer from "./components/Footer";
import { SingleProduct } from "./pages/SingleProduct";
import Payment from "./components/Payment";
import { ToastContainer } from "react-toastify";
import Dashboard from "./dashborad/page/Dashborad";
import { AdminRequireAuth } from "./dashborad/admins/AdminRequireAuth";
import { default as ShowCategories } from "./dashborad/admins/category/Show";
import { default as CreateCategories } from "./dashborad/admins/category/Create";
import { default as EditCategories } from "./dashborad/admins/category/Edit";

import ShowBrand from "./dashborad/admins/brand/ShowBrand";
import CreateBrand from "./dashborad/admins/brand/CreateBrand";
import EditBrand from "./dashborad/admins/brand/EditBrand";

import ShowSupplier from "./dashborad/admins/supplier/ShowSupplier";
import CreateSupplier from "./dashborad/admins/supplier/CreateSupplier";
import EditSupplier from "./dashborad/admins/supplier/EditSupplier";

import ShowProduct from "./dashborad/admins/product/ShowProduct";
import CreateProduct from "./dashborad/admins/product/CreateProduct";
import EditProduct from "./dashborad/admins/product/EditProduct";
import ViewProduct from "./dashborad/admins/product/ViewProduct";
import AdminLogin from "./dashborad/admins/AdminLogin";
import Profile from "./pages/profile";
import { RequireAuth } from "./dashborad/admins/RequireAuth";
import Confirmation from "./pages/Confirmation";
import ShowOrders from "./dashborad/admins/order/ShowOrders";
import OrderDetail from "./dashborad/admins/order/OrderDetail";
import MyOrder from "./front/MyOrder"; // Keep this as MyOrder
import { default as UserOrderDetails } from "./front/OrderDetails"; // Rename import to avoid conflict and clarify
import ShowUser from "./dashborad/admins/user/ShowUser";
import EditUser from "./dashborad/admins/user/EditUser";

const AppRoutes = () => {
  const location = useLocation();

  // Routes where Navbar & Footer should be hidden
  const hideNavbarRoutes = [
    "/login",
    "/signup",
    "/admin/login",
    "/admin/dashboard",
    "/admin/categories",
    "/admin/categories/create",
    "/admin/categories/edit/:id",
    "/admin/brands",
    "/admin/brands/create",
    "/admin/brands/edit/:id",
    "/admin/suppliers",
    "/admin/suppliers/create",
    "/admin/suppliers/edit/:id",
    "/admin/products",
    "/admin/products/create",
    "/admin/products/edit/:id",
    "/admin/products/show/view/:id",
    "/admin/orders",
    "/admin/orders/:id",
    "/account/login",
    "/account/register",
    "/order/confirmation/:id",
    "/admin/roles",
    "/admin/roles/edit/:id",
  ];

  // Function to check if current path matches hide routes
  const hideNavbar = hideNavbarRoutes.some((route) => {
    if (route.includes("/:id")) {
      const basePath = route.split("/:id")[0];
      return location.pathname.startsWith(basePath);
    }
    return location.pathname === route;
  });

  const hideFooter = hideNavbar;

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<SingleProduct />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/cart" element={<Cart />} />

        {/* Admin Dashboard */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminRequireAuth>
              <Dashboard />
            </AdminRequireAuth>
          }
        />

        {/* Categories */}
        <Route
          path="/admin/categories"
          element={
            <AdminRequireAuth>
              <ShowCategories />
            </AdminRequireAuth>
          }
        />
        <Route
          path="/admin/categories/create"
          element={
            <AdminRequireAuth>
              <CreateCategories />
            </AdminRequireAuth>
          }
        />
        <Route
          path="/admin/categories/edit/:id"
          element={
            <AdminRequireAuth>
              <EditCategories />
            </AdminRequireAuth>
          }
        />
        {/* Brands */}
        <Route
          path="/admin/brands"
          element={
            <AdminRequireAuth>
              <ShowBrand />
            </AdminRequireAuth>
          }
        />
        <Route
          path="/admin/brands/create"
          element={
            <AdminRequireAuth>
              <CreateBrand />
            </AdminRequireAuth>
          }
        />
        <Route
          path="/admin/brands/edit/:id"
          element={
            <AdminRequireAuth>
              <EditBrand />
            </AdminRequireAuth>
          }
        />
        {/* Suppliers */}
        <Route
          path="/admin/suppliers"
          element={
            <AdminRequireAuth>
              <ShowSupplier />
            </AdminRequireAuth>
          }
        />
        <Route
          path="/admin/suppliers/create"
          element={
            <AdminRequireAuth>
              <CreateSupplier />
            </AdminRequireAuth>
          }
        />
        <Route
          path="/admin/suppliers/edit/:id"
          element={
            <AdminRequireAuth>
              <EditSupplier />
            </AdminRequireAuth>
          }
        />
        {/* products */}
        <Route
          path="/admin/products"
          element={
            <AdminRequireAuth>
              <ShowProduct />
            </AdminRequireAuth>
          }
        />
        <Route
          path="/admin/products/create"
          element={
            <AdminRequireAuth>
              <CreateProduct />
            </AdminRequireAuth>
          }
        />
        <Route
          path="/admin/products/edit/:id"
          element={
            <AdminRequireAuth>
              <EditProduct />
            </AdminRequireAuth>
          }
        />
        <Route
          path="/admin/products/show/view/:id"
          element={
            <AdminRequireAuth>
              <ViewProduct />
            </AdminRequireAuth>
          }
        />

        {/* order route */}
        <Route
          path="/admin/orders"
          element={
            <AdminRequireAuth>
              <ShowOrders />
            </AdminRequireAuth>
          }
        />
        <Route
          path="/admin/orders/:id"
          element={
            <AdminRequireAuth>
              <OrderDetail />
            </AdminRequireAuth>
          }
        />

        {/* Route Roles */}
        <Route
          path="/admin/roles"
          element={
            <AdminRequireAuth>
              <ShowUser />
            </AdminRequireAuth>
          }
        />
        <Route
          path="/admin/roles/edit/:id"
          element={
            <AdminRequireAuth>
              <EditUser />
            </AdminRequireAuth>
          }
        />

        {/* admin login */}
        <Route path="/admin/login" element={<AdminLogin />} />
        {/* account */}
        <Route path="/account/login" element={<Login />} />
        <Route path="/account/register" element={<SignUp />} />
        <Route
          path="/account"
          element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          }
        />
        <Route
          path="/account/orders"
          element={
            <RequireAuth>
              <MyOrder />
            </RequireAuth>
          }
        />
        <Route
          path="/order/confirmation/:id"
          element={
            <RequireAuth>
              <Confirmation />
            </RequireAuth>
          }
        />
        <Route
          path="/account/order-details/:id"
          element={
            <RequireAuth>
              <UserOrderDetails />
            </RequireAuth>
          }
        />

        {/* 404 */}
        <Route path="*" element={<div>Page Not Found</div>} />
      </Routes>
      <ToastContainer />
      {!hideFooter && <Footer />}
    </>
  );
};

export const App = () => {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;
