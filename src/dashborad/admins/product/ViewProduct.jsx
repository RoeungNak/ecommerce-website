import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Layout from "../../component_dashboard/Layout";
import { adminToken, apiUrl } from "../../../context/http";
import Swal from "sweetalert2";
import Loading from "../category/Loading";

const ViewProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [fetchLoading, setFetchLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [category, setCategory] = useState(null);
  const [brand, setBrand] = useState(null);
  const [supplier, setSupplier] = useState(null);
  const [error, setError] = useState(null);
  const [imageLoading, setImageLoading] = useState({});

  // Fetch product
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${apiUrl}/products/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${adminToken()}`,
          },
        });
        const result = await res.json();
        if (res.ok) {
          setProduct(result.data);
          console.log("Product data:", result.data);
        } else {
          setError(result.message || "Failed to fetch product");
          Swal.fire({
            title: "Error",
            text: result.message || "Failed to fetch product",
            icon: "error",
            confirmButtonText: "Back to Products",
          }).then(() => {
            navigate("/admin/products");
          });
        }
      } catch (error) {
        setError(error.message || "An unexpected error occurred");
        Swal.fire({
          title: "Error",
          text: error.message || "An unexpected error occurred",
          icon: "error",
          confirmButtonText: "Back to Products",
        }).then(() => {
          navigate("/admin/products");
        });
      } finally {
        setFetchLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  // Fetch category, brand, and supplier after product is loaded
  useEffect(() => {
    const fetchCategory = async (categoryId) => {
      try {
        const res = await fetch(`${apiUrl}/categoies/${categoryId}`, {
          headers: {
            Authorization: `Bearer ${adminToken()}`,
          },
        });
        const result = await res.json();
        if (res.ok) {
          setCategory(result.data || result);
          console.log("Category data:", result.data || result);
        } else {
          setError(result.message || "Failed to fetch category");
          console.error("Failed to fetch category:", result.message);
        }
      } catch (error) {
        setError(error.message || "Error fetching category");
        console.error("Error fetching category:", error);
      }
    };

    const fetchBrand = async (brandId) => {
      try {
        const res = await fetch(`${apiUrl}/brands/${brandId}`, {
          headers: {
            Authorization: `Bearer ${adminToken()}`,
          },
        });
        const result = await res.json();
        if (res.ok) {
          setBrand(result.data || result);
          console.log("Brand data:", result.data || result);
        } else {
          setError(result.message || "Failed to fetch brand");
          console.error("Failed to fetch brand:", result.message);
        }
      } catch (error) {
        setError(error.message || "Error fetching brand");
        console.error("Error fetching brand:", error);
      }
    };

    const fetchSupplier = async (supplierId) => {
      try {
        const res = await fetch(`${apiUrl}/suppliers/${supplierId}`, {
          headers: {
            Authorization: `Bearer ${adminToken()}`,
          },
        });
        const result = await res.json();
        if (res.ok) {
          setSupplier(result.data || result);
          console.log("Supplier data:", result.data || result);
        } else {
          setError(result.message || "Failed to fetch supplier");
          console.error("Failed to fetch supplier:", result.message);
        }
      } catch (error) {
        setError(error.message || "Error fetching supplier");
        console.error("Error fetching supplier:", error);
      }
    };

    if (product) {
      if (product.category_id) fetchCategory(product.category_id);
      if (product.brand_id) fetchBrand(product.brand_id);
      if (product.supplier_id) fetchSupplier(product.supplier_id);
    }
  }, [product]);

  const handleImageLoad = (index) => {
    setImageLoading((prev) => ({ ...prev, [index]: false }));
    console.log(`Image at index ${index} loaded successfully`);
  };

  const handleImageError = (index, e) => {
    setImageLoading((prev) => ({ ...prev, [index]: false }));
    e.target.src = "https://via.placeholder.com/150";
    console.error(`Failed to load image at index ${index}: ${e.target.src}`);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">Product Details</h3>
          <Link
            to="/admin/products"
            className="mt-2 sm:mt-0 px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition"
          >
            Back
          </Link>
        </div>

        {/* Product Details Card */}
        <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg border border-gray-200 p-6 sm:p-8">
          {fetchLoading ? (
            <div className="flex justify-center py-10">
              <Loading />
            </div>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : product ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h3 className="text-gray-500 font-semibold mb-1">Title</h3>
                <p className="text-gray-800 text-lg">
                  {product.title || "N/A"}
                </p>
              </div>

              <div>
                <h3 className="text-gray-500 font-semibold mb-1">Price</h3>
                <p className="text-gray-800 text-lg">
                  ${product.price ? Number(product.price).toFixed(2) : "N/A"}
                </p>
              </div>

              <div>
                <h3 className="text-gray-500 font-semibold mb-1">Quantity</h3>
                <p className="text-gray-800 text-lg">{product.qty ?? "N/A"}</p>
              </div>

              <div>
                <h3 className="text-gray-500 font-semibold mb-1">Cost Price</h3>
                <p className="text-gray-800 text-lg">
                  ${product.cost ? Number(product.cost).toFixed(2) : "N/A"}
                </p>
              </div>

              <div>
                <h3 className="text-gray-500 font-semibold mb-1">
                  Selling Price
                </h3>
                <p className="text-gray-800 text-lg">
                  ${product.price ? Number(product.price).toFixed(2) : "N/A"}
                </p>
              </div>
              <div>
                <h3 className="text-gray-500 font-semibold mb-1">Category</h3>
                <p className="text-gray-800 text-lg">
                  {category ? category.name : "N/A"}
                </p>
              </div>

              <div>
                <h3 className="text-gray-500 font-semibold mb-1">Supplier</h3>
                <p className="text-gray-800 text-lg">
                  {supplier ? supplier.name : "N/A"}
                </p>
              </div>

              <div>
                <h3 className="text-gray-500 font-semibold mb-1">Brand</h3>
                <p className="text-gray-800 text-lg">
                  {brand ? brand.name : "N/A"}
                </p>
              </div>
              <div>
                <h3 className="text-gray-500 font-semibold mb-1">Discount</h3>
                <p className="text-gray-800 text-lg">
                  {product.discount ? `${product.discount}%` : "N/A"}
                </p>
              </div>

              <div className="sm:col-span-2">
                <h3 className="text-gray-500 font-semibold mb-1">
                  Description
                </h3>
                <p className="text-gray-800">{product.description || "-"}</p>
              </div>
              <div>
                <h3 className="text-gray-500 font-semibold mb-1">Status</h3>
                <p
                  className={`text-lg font-medium ${
                    product.status === 1 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {product.status === 1 ? "Active" : "Inactive"}
                </p>
              </div>

              <div className="sm:col-span-2">
                <h3 className="text-gray-500 font-semibold mb-2">
                  Product Images
                </h3>
                {product.gallery && product.gallery.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {product.gallery.map((image, index) => (
                      <div key={index} className="relative">
                        {imageLoading[index] !== false && (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-md">
                            <Loading />
                          </div>
                        )}
                        <img
                          src={image.url || image.image || image.path || image}
                          alt={`${product.title} - ${index + 1}`}
                          className={`w-50 h-50 object-cover rounded-md border border-gray-300 shadow-sm ${
                            imageLoading[index] !== false ? "opacity-0" : ""
                          }`}
                          onLoad={() => handleImageLoad(index)}
                          onError={(e) => handleImageError(index, e)}
                        />
                      </div>
                    ))}
                  </div>
                ) : product.image_url ? (
                  <div className="relative">
                    {imageLoading[0] !== false && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-md">
                        <Loading />
                      </div>
                    )}
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className={`w-50 h-50 object-cover rounded-md border border-gray-300 shadow-sm ${
                        imageLoading[0] !== false ? "opacity-0" : ""
                      }`}
                      onLoad={() => handleImageLoad(0)}
                      onError={(e) => handleImageError(0, e)}
                    />
                  </div>
                ) : (
                  <p className="text-gray-500">No images available.</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500">Product not found.</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ViewProduct;
