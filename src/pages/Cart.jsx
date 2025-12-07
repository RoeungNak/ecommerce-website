import { FaPlus, FaMinus, FaTrashAlt } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import { useTranslation } from "react-i18next";
import EmptyBox from "../assets/Empty_Box.mp4";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const Cart = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { cartItem, increaseQuantity, decreaseQuantity, removeFromCart } =
    useCart();

  const [shipping, setShipping] = useState(0);

  const RIEL_RATE = 4100; // USD → Riel

  // Calculate totals with discount
  const total = cartItem.reduce((sum, item) => {
    const qty = item.quantity || 1;
    const discountPercent = item.discount > 0 ? item.discount : 0;
    const discountedPrice = item.price - (item.price * discountPercent) / 100;
    return sum + discountedPrice * qty;
  }, 0);

  const originalTotal = cartItem.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0
  );
  const discount = originalTotal - total;

  // Update shipping dynamically
  useEffect(() => {
    if (total === 0) setShipping(0);
    else if (total >= 50) setShipping(0);
    else setShipping(2.5);
  }, [total]);

  const finalTotal = total + shipping;

  return (
    <div className="container mx-auto px-4 py-10 mb-48">
      {cartItem.length === 0 ? (
        <div className="flex flex-col items-center justify-center">
          <video
            src={EmptyBox}
            autoPlay
            loop
            muted
            className="w-24 h-24 md:w-32 md:h-32"
          />
          <p className="text-gray-600 text-xl mt-4">{t("Not_Found")}</p>
          <button
            onClick={() => navigate("/products")}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition cursor-pointer"
          >
            {t("Reset_Filters")}
          </button>
        </div>
      ) : (
        <>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
            {t("List_of_shopping_items")}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="md:col-span-2 space-y-4">
              {cartItem.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-white rounded-lg shadow p-4"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={item.image_url || "/placeholder.png"}
                      alt={item.title}
                      className="w-24 h-24 object-contain rounded"
                    />
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800">
                        {item.title}
                      </h2>
                      <p className="text-gray-600">
                        $
                        {Number(
                          item.price * (1 - (item.discount || 0) / 100)
                        ).toFixed(2)}
                      </p>
                      <p className="text-sm text-green-600">
                        In Stock: {item.qty}
                      </p>
                      <p className="text-sm text-gray-600">
                        Size: {item.size || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => decreaseQuantity(item.id, item.size)}
                      className="text-red-500 hover:text-red-700 cursor-pointer"
                    >
                      <FaMinus />
                    </button>
                    <span className="text-lg">{item.quantity}</span>
                    <button
                      onClick={() => {
                        if (item.quantity < item.qty) {
                          increaseQuantity(item.id, item.size);
                        }
                      }}
                      className="text-green-500 hover:text-green-700 cursor-pointer mr-6 disabled:text-gray-300 disabled:cursor-not-allowed"
                      disabled={item.quantity >= item.qty}
                    >
                      <FaPlus />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id, item.size)}
                      className="text-red-600 hover:text-red-800 cursor-pointer"
                    >
                      <FaTrashAlt />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="bg-gray-100 rounded-lg p-6 shadow">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                {t("Order_information")}
              </h2>

              <div className="flex justify-between mb-2">
                <span>{t("Original_Price")}:</span>
                <span>${Number(originalTotal).toFixed(2)}</span>
              </div>

              <div className="flex justify-between mb-2">
                <span>{t("Shipping")}:</span>
                <span>
                  {shipping === 0
                    ? t("Free")
                    : `$${Number(shipping).toFixed(2)}`}
                </span>
              </div>

              <hr />

              <div className="flex justify-between mt-4 font-bold text-lg">
                <span>{t("TotalUSD")}:</span>
                <span>${Number(finalTotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between mt-2 font-bold text-lg">
                <span>{t("TotalRiel")}:</span>
                <span>{Number(finalTotal * RIEL_RATE).toLocaleString()} ៛</span>
              </div>

              <button
                onClick={() => navigate("/payment")}
                className="w-full mt-6 bg-amber-600 text-white py-2 rounded hover:bg-amber-700 transition cursor-pointer"
              >
                {t("Proceed_to_Checkout")}
              </button>

              <p className="text-center mt-3 text-sm text-gray-600">
                {t("or")}{" "}
                <a
                  onClick={() => navigate("/products")}
                  className="text-amber-700 hover:underline font-medium cursor-pointer transition"
                >
                  {t("Continue_Shopping")}
                </a>
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
