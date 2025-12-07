import { useEffect, useState } from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { useTranslation } from "react-i18next";
import { AiOutlineArrowLeft, AiOutlineArrowRight } from "react-icons/ai";
import { apiUrl } from "../context/http";
import { useNavigate } from "react-router-dom";

const Carousel = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();
  // States
  const [products, setProducts] = useState([]);
  const [loadingState, setLoadingState] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

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
      // Only set active products
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

  // Reset page when products change
  useEffect(() => {
    setCurrentPage(1);
  }, [products]);

  const SamplePrevArrow = ({ style, onClick }) => (
    <div
      onClick={onClick}
      className="arrow absolute top-1/3 left-4 transform -translate-y-1/2 z-10 text-white text-3xl cursor-pointer hover:text-yellow-300 transition"
      style={{ ...style }}
    >
      <AiOutlineArrowLeft />
    </div>
  );

  const SampleNextArrow = ({ style, onClick }) => (
    <div
      onClick={onClick}
      className="arrow absolute top-1/3 right-4 transform -translate-y-1/2 z-10 text-white text-3xl cursor-pointer hover:text-yellow-300 transition"
      style={{ ...style }}
    >
      <AiOutlineArrowRight />
    </div>
  );

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2700,
    arrows: true,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    lazyLoad: "ondemand",
  };

  if (loadingState) {
    return <div className="text-center text-white py-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-10">{error}</div>;
  }

  return (
    <div className="w-full relative">
      <Slider {...settings}>
        {products?.slice(0, 7).map((item, index) => (
          <div
            key={index}
            className="px-4 py-10 md:p-10 min-h-[350px] md:min-h-[400px] text-white bg-gradient-to-r from-[#0f0c29] via-[#302b63] to-[#24243e]"
          >
            <div className="flex flex-col md:flex-row gap-6 md:gap-80 items-center justify-center h-full">
              {/* Text content */}
              <div className="max-w-xl text-center md:text-left space-y-3 md:space-y-4">
                <p className="text-red-400 font-semibold text-xs md:text-sm uppercase">
                  Powering Your World with the Best in Goods
                </p>
                <h1 className="text-xl md:text-3xl font-bold leading-snug">
                  {item.title}
                </h1>
                <p className="text-gray-300 text-sm md:text-base line-clamp-3">
                  {item.description}
                </p>
                <p className="text-yellow-400 text-base md:text-lg font-semibold">
                  ${item.price}
                </p>
                <button
                  className="mt-3 md:mt-4 px-4 md:px-6 py-2 bg-red-500 hover:bg-red-600 hover:shadow-lg rounded text-white transition text-sm md:text-base cursor-pointer"
                  onClick={() => navigate(`/products/${item.id}`)}
                  aria-label={`Shop now for ${item.title}`}
                >
                  {t("Shop_Now")}
                </button>
              </div>

              {/* Image */}
              <div className="flex-shrink-0">
                <img
                  loading="lazy"
                  src={item.image_url || "/placeholder.png"}
                  alt={item.title}
                  className="w-50 h-50 md:w-66 md:h-66 object-contain rounded-full hover:scale-105 transition-all shadow-2xl shadow-blue-100 mx-auto cursor-pointer"
                />
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default Carousel;
