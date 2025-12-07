import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import loading from "../assets/loading.mp4";
import Breadcrums from "../components/Breadcrums";
import { IoCartOutline, IoBagCheckOutline } from "react-icons/io5";
import { useTranslation } from "react-i18next";
import { useCart } from "../context/CartContext";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { apiUrl } from "../context/http";
import Swal from "sweetalert2";

export const SingleProduct = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams();
  const [singleProduct, setSingleProduct] = useState(null);
  const [error, setError] = useState(null);
  const [qty, setQuantity] = useState(1);
  const [discount, setDiscount] = useState(0);
  const [selectedSize, setSelectedSize] = useState(""); // Initialize with empty string
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [availableSizes, setAvailableSizes] = useState([]); // Renamed for clarity

  const { addToCart } = useCart();

  const discountedPrice = singleProduct
    ? (
        singleProduct.price -
        singleProduct.price * ((singleProduct.discount || 0) / 100)
      ).toFixed(2)
    : 0;

  const fetchProduct = async () => {
    try {
      const response = await fetch(`${apiUrl}/get-product/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch product.");
      }
      const result = await response.json();

      if (result.status === 200) {
        setSingleProduct(result.brands);
        // Set available sizes from product_sizes relationship
        if (result.brands.product_sizes?.length) {
          setAvailableSizes(
            result.brands.product_sizes.map((ps) => ({
              id: ps.size.id,
              name: ps.size.name,
              stock: ps.stock, // Assuming stock is available per size
            }))
          );
          setSelectedSize(result.brands.product_sizes[0]?.size.name || ""); // Select first available size by default
        }
        // Load product images
        if (result.brands.product_images?.length) {
          setImages(result.brands.product_images.map((img) => img.image_url));
        }
      } else {
        setError(result.message || "Product not found");
      }
    } catch (err) {
      console.error("Error fetching product:", err);
      setError("Something went wrong while fetching product.");
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const handleQuantityChange = (type) => {
    setQuantity((prev) => (type === "inc" ? prev + 1 : Math.max(prev - 1, 1)));
  };

  const handleAddToCart = () => {
    if (!singleProduct) return;

    if (!selectedSize) {
      Swal.fire({
        icon: "warning",
        title: "Please Select a Size",
        text: "You must select a size before adding to cart.",
      });
      return;
    }

    const item = {
      id: singleProduct.id,
      title: singleProduct.title,
      price: parseFloat(discountedPrice),
      qty: singleProduct.qty || 0,
      size: selectedSize,
      image_url: images[currentIndex],
    };

    addToCart(item);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (error) {
    return (
      <div className="text-center py-20 text-red-600 font-semibold">
        {error}
      </div>
    );
  }

  if (!singleProduct) {
    return (
      <div className="flex items-center justify-center h-screen">
        <video className="w-24 h-24 md:w-32 md:h-32" muted autoPlay loop>
          <source src={loading} type="video/mp4" />
        </video>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-0 max-w-7xl mx-auto mt-10 mb-60">
      <Breadcrums title={singleProduct.title} />

      <div className="grid md:grid-cols-2 gap-10 mt-20">
        {/* Image Section */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Thumbnails */}
          <div className="flex md:flex-col gap-2 justify-center items-center">
            {images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Thumbnail ${index + 1}`}
                onClick={() => setCurrentIndex(index)}
                className={`w-16 h-16 object-cover rounded-lg border cursor-pointer transition-transform duration-200 hover:scale-105 ${
                  currentIndex === index ? "border-blue-500" : "border-gray-300"
                }`}
              />
            ))}
          </div>

          {/* Main Image with Arrows */}
          <div className="relative bg-white p-4 rounded-2xl shadow-lg flex items-center justify-center border border-gray-200">
            <img
              src={images[currentIndex]}
              alt={`Product image of ${singleProduct.title}`}
              className="w-full max-w-md h-auto object-contain rounded-xl transition-transform duration-300 hover:scale-105"
            />

            {/* Prev Button */}
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full shadow hover:bg-gray-700"
            >
              <FaChevronLeft />
            </button>

            {/* Next Button */}
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full shadow hover:bg-gray-700"
            >
              <FaChevronRight />
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className="flex flex-col gap-4">
          <h2 className="text-3xl font-bold text-gray-900">
            {singleProduct.title}
          </h2>

          <p className="text-gray-600 leading-relaxed">
            {singleProduct.description}
          </p>

          <p className="text-base font-medium text-gray-700 capitalize">
            {t("Category")}:{" "}
            <span className="italic">{singleProduct.category?.name}</span>
          </p>
          <p className="text-base font-medium text-gray-700 capitalize">
            {t("Brand")}:{" "}
            <span className="italic">{singleProduct.brand?.name}</span>
          </p>

          <div className="flex items-center gap-4">
            <span className="text-2xl font-bold text-green-600">
              ${discountedPrice}
            </span>
            {singleProduct.discount > 0 && (
              <>
                <span className="text-lg line-through text-gray-400">
                  ${singleProduct.price}
                </span>
                <span className="bg-red-500 text-white text-sm px-2 py-1 rounded">
                  {singleProduct.discount}% OFF
                </span>
              </>
            )}
          </div>

          {/* Size Selection */}
          <div className="flex items-center gap-4">
            <label className="font-medium text-gray-700">{t("Size")}:</label>
            <div className="flex gap-2 flex-wrap">
              {availableSizes.map((size) => (
                <button
                  key={size.id} // Use size.id as key
                  onClick={() => setSelectedSize(size.name)}
                  className={`px-3 py-1 border rounded-md font-medium cursor-pointer ${
                    selectedSize === size.name
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 border-gray-300"
                  }`}
                >
                  {size.name}
                </button>
              ))}
            </div>
          </div>
          <p className="text-base font-medium text-gray-700 capitalize">
            {t("SKU")}: <span>{singleProduct.sku || "N/A"}</span>
          </p>

          <div className="flex w-full items-center gap-4">
            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              className="mt-4 w-full md:w-auto bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <IoCartOutline className="w-6 h-6" />
              {t("Card")}
            </button>

            {/* Buy Now */}
            <button
              onClick={() => navigate("/cart")}
              className="mt-4 w-full md:w-auto bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <IoBagCheckOutline className="w-6 h-6" />
              {t("BuyNow")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
