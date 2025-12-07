import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./i18n";
import App from "./App.jsx";
import { DataProvider } from "./context/DataContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { ToastContainer, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ScrollToTop from "react-scroll-to-top";
import { AuthProvider } from "./context/Auth.jsx";
import { AdminAuthProivder } from "./context/AdminAuth.jsx";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <DataProvider>
      <CartProvider>
        <AuthProvider>
          <AdminAuthProivder>
            <App />
          </AdminAuthProivder>
        </AuthProvider>
        <ScrollToTop
          smooth
          style={{
            backgroundColor: "gray",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        />
      </CartProvider>
    </DataProvider>
  </StrictMode>
);
