import React, { useEffect, useState, useMemo } from "react";
import FilterSection from "../components/FilterSection";
import loading from "../assets/loading.mp4";
import EmptyBox from "../assets/Empty_Box.mp4";
import { ProductCartAll } from "../components/ProductCartAll";
import { useTranslation } from "react-i18next";
import MobileFilter from "../components/MobileFilter";
import { apiUrl } from "../context/http";

const Products = () => {
  const { t } = useTranslation();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [openFilter, setOpenFilter] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [error, setError] = useState(null);
  const productsPerPage = 16;

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      const response = await fetch(`${apiUrl}/get-products`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch products.");
      }
      const result = await response.json();
      setProducts(result.products || []);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching products:", err);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${apiUrl}/get-categories`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch categories.");
      }
      const result = await response.json();
      setCategories(result.categories?.map((cat) => cat.name) || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  // Fetch brands
  const fetchBrands = async () => {
    try {
      const response = await fetch(`${apiUrl}/get-brands`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch brands.");
      }
      const result = await response.json();
      setBrands(result.brands?.map((brand) => brand.name) || []);
    } catch (err) {
      console.error("Error fetching brands:", err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        await Promise.all([fetchProducts(), fetchCategories(), fetchBrands()]);
      } catch (err) {
        setError("Failed to load data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Reset page + show filter spinner
  useEffect(() => {
    setCurrentPage(1);
    setIsFiltering(true);

    const timer = setTimeout(() => {
      setIsFiltering(false);
    }, 400); // Spinner delay for UX

    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory, selectedBrand]);

  // Filtering logic
  const filteredData = useMemo(
    () =>
      products.filter((product) => {
        const matchesCategory =
          selectedCategory === "All" ||
          product.category?.name === selectedCategory;

        const matchesBrand =
          selectedBrand === "All" || product.brand?.name === selectedBrand;

        const search = searchTerm.toLowerCase();
        const matchesSearch =
          product.title?.toLowerCase().includes(search) ||
          product.name?.toLowerCase().includes(search) ||
          product.brand?.name?.toLowerCase().includes(search) ||
          product.category?.name?.toLowerCase().includes(search);

        return matchesCategory && matchesBrand && matchesSearch;
      }),
    [products, searchTerm, selectedCategory, selectedBrand]
  );

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredData.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const totalPages = Math.ceil(filteredData.length / productsPerPage);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[900px]">
        <video className="w-24 h-24 md:w-32 md:h-32" muted autoPlay loop>
          <source src={loading} type="video/mp4" />
        </video>
      </div>
    );
  }

  // Show API error
  if (error) {
    return (
      <div className="text-center text-red-500 py-10">
        <p>Error: {error}</p>
        <p>Could not load products. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 mb-35">
      {/* Mobile Filter */}
      <MobileFilter
        openFilter={openFilter}
        setOpenFilter={setOpenFilter}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedBrand={selectedBrand}
        setSelectedBrand={setSelectedBrand}
        categories={categories}
        brands={brands}
      />

      {products.length > 0 ? (
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 mt-4">
          {/* Sidebar Filter (Desktop only) */}
          <aside className="w-full lg:w-1/4 top-0 z-10 bg-white hidden md:block">
            <FilterSection
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedBrand={selectedBrand}
              setSelectedBrand={setSelectedBrand}
              categories={categories}
              brands={brands}
            />
          </aside>

          {/* Product Grid */}
          <main className="flex-1">
            {isFiltering ? (
              <div className="flex items-center justify-center h-[300px]">
                <video
                  className="w-20 h-20 md:w-28 md:h-28"
                  muted
                  autoPlay
                  loop
                >
                  <source src={loading} type="video/mp4" />
                </video>
              </div>
            ) : currentProducts.length > 0 ? (
              <div className="grid gap-4 sm:gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3">
                {currentProducts.map((product) => (
                  <ProductCartAll key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="mt-10">
                <div className="flex justify-center">
                  <video
                    className="w-24 h-24 md:w-48 md:h-48"
                    muted
                    autoPlay
                    loop
                  >
                    <source src={EmptyBox} type="video/mp4" />
                  </video>
                </div>
                <div className="text-center mt-4">
                  <h1 className="font-semibold text-gray-700">
                    {t("Not_Found")}
                  </h1>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("All");
                      setSelectedBrand("All");
                    }}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition cursor-pointer"
                  >
                    {t("Reset_Filters")}
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      ) : (
        !isLoading && (
          <div className="text-center py-10">
            <h1 className="text-2xl font-semibold text-gray-700">
              {t("No products available at the moment.")}
            </h1>
          </div>
        )
      )}
    </div>
  );
};

export default Products;
