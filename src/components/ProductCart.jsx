import React, { useEffect, useState, useMemo } from "react";
import { IoCartOutline } from "react-icons/io5";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { apiUrl } from "../context/http";
import loading from "../assets/loading.mp4";
const ProductCart = () => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingState, setLoadingState] = useState(true);
  const [error, setError] = useState(null);

  const itemsPerPage = 20;
  const { t } = useTranslation();
  const { addToCart, cartItem } = useCart();
  const navigate = useNavigate();

  console.log(cartItem);

  // Fetch latest products
  const latestProducts = async () => {
    setLoadingState(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/latest-products`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      if (!res.ok) throw new Error("Failed to fetch products");
      const result = await res.json();
      setProducts(result.products);
      // Filter products to show only active ones
      setProducts(result.products.filter((product) => product.status === 1));
    } catch (err) {
      console.error(err);
      setError("Failed to load products");
    } finally {
      setLoadingState(false);
    }
  };
  useEffect(() => {
    latestProducts();
  }, []);

  // Reset current page if products change
  useEffect(() => {
    setCurrentPage(1);
  }, [products]);

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentItems = useMemo(() => {
    return products.slice(indexOfFirstItem, indexOfLastItem);
  }, [products, currentPage]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {loadingState ? (
        <div className="flex items-center justify-center h-[400px]">
          <video className="w-24 h-24 md:w-32 md:h-32" muted autoPlay loop>
            <source src={loading} type="video/mp4" />
          </video>
        </div>
      ) : (
        <>
          <h1 className="line-clamp-2 mt-3 font-semibold text-gray-800 text-2xl min-h-[3rem]">
            New Arrival
          </h1>

          {/* Product Grid */}
          <div className="grid gap-4 sm:gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {currentItems.map((product, index) => (
              <div
                key={`${product.id}-${index}`}
                className="border border-gray-200 rounded-sm p-4 bg-white shadow-sm transition-transform duration-300 ease-in-out cursor-pointer"
              >
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
                <h1 className="line-clamp-2 font-medium text-gray-800 text-base min-h-[3rem]">
                  {product.description}
                </h1>
                <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <p className="text-xl font-bold text-gray-900">
                    {product.price}$
                  </p>
                  <button
                    onClick={() => addToCart(product)}
                    className="w-full sm:w-auto bg-red-500 hover:bg-red-600 px-4 py-2 text-white rounded-sm flex items-center justify-center gap-2 font-semibold transition-colors cursor-pointer"
                  >
                    <IoCartOutline className="w-6 h-6" />
                    {t("Card")}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-end ">
            <button
              onClick={() => navigate(`/products`)}
              className="mt-5 bg-blue-500 hover:bg-blue-600 px-4 py-2 text-white rounded-sm gap-2 font-semibold transition-colors cursor-pointer"
            >
              See All Products
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ProductCart;
