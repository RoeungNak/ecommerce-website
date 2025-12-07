import { createContext, useState, useContext, useEffect } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

export const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { t } = useTranslation();
  const [cartItem, setCartItem] = useState([]);

  // Load cart from localStorage
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem("cart");
      if (storedCart) setCartItem(JSON.parse(storedCart));
    } catch (error) {
      console.error("Failed to parse cart from localStorage", error);
      localStorage.removeItem("cart");
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (cartItem.length === 0) localStorage.removeItem("cart");
    else localStorage.setItem("cart", JSON.stringify(cartItem));
  }, [cartItem]);

  const addToCart = (product) => {
    const itemInCart = cartItem.find((item) => item.id === product.id);
    if (itemInCart) {
      setCartItem(
        cartItem.map((item) =>
          item.id === product.id
            ? { ...item, quantity: Math.max(item.quantity + 1, 1) }
            : item
        )
      );
    } else {
      setCartItem([...cartItem, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId, action) => {
    const updatedCart = cartItem
      .map((item) => {
        if (item.id === productId) {
          let newQty = item.quantity;
          if (action === "increase") newQty++;
          if (action === "decrease") newQty--;
          if (newQty < 1) return null;
          return { ...item, quantity: newQty };
        }
        return item;
      })
      .filter(Boolean);
    setCartItem(updatedCart);
  };

  const increaseQuantity = (id) => updateQuantity(id, "increase");
  const decreaseQuantity = (id) => updateQuantity(id, "decrease");

  const removeFromCart = (id) => {
    setCartItem((prev) => prev.filter((item) => item.id !== id));
    toast.info(t("removed_from_cart"));
  };

  return (
    <CartContext.Provider
      value={{
        cartItem,
        setCartItem,
        addToCart,
        updateQuantity,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
