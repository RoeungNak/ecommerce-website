import { IoCartOutline } from "react-icons/io5";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

export const ProductCartAll = ({ product }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { addToCart, cartItem } = useCart();
  console.log(cartItem);

  return (
    <div className="border border-gray-200 rounded-sm p-4 mb-2 bg-white shadow-sm transition-transform duration-300 ease-in-out cursor-pointer mt-10">
      <img
        src={product.image_url || "/placeholder.png"}
        alt={product.title}
        className="w-full aspect-square object-contain bg-white rounded-xl p-4 hover:scale-105  transition-transform duration-300 ease-in-out"
        onClick={() => navigate(`/products/${product.id}`)}
      />

      <div className="mt-2 flex items-center justify-between">
        <h1 className="line-clamp-2 mt-3 text-gray-800 font-bold text-base min-h-[2rem]">
          {product.title}
        </h1>
        {/* Discount Badge */}

        {product.discount === 0
          ? null
          : product.discount > 0 && (
              <span className="inline-block bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md mt-2">
                {product.discount}% OFF
              </span>
            )}
      </div>
      <h1 className="line-clamp-2 text-gray-800 text-base min-h-[3rem]">
        {product.description}
      </h1>
      <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <p className="text-xl font-bold text-gray-900">{product.price}$</p>
        <button
          onClick={() => addToCart(product)}
          className="w-full sm:w-auto bg-red-500 hover:bg-red-600 px-4 py-2 text-white rounded-sm flex items-center justify-center gap-2 font-semibold transition-colors cursor-pointer"
        >
          <IoCartOutline className="w-6 h-6" />
          {t("Card")}
        </button>
      </div>
    </div>
  );
};
