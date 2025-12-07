import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Layout from "../../component_dashboard/Layout";
import Swal from "sweetalert2";
import { format, parseISO } from "date-fns";
import {
  HomeIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { adminToken, apiUrl } from "../../../context/http";
import Loading from "../category/Loading";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const ShowProduct = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtering, setFiltering] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");
  const [filterInStock, setFilterInStock] = useState(false);
  const [filterOutStock, setFilterOutStock] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [perPage] = useState(10);
  const [previewImage, setPreviewImage] = useState(null); // State for modal preview

  const fetchProducts = async (page = 1) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${apiUrl}/products?page=${page}&per_page=${perPage}`,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${adminToken()}`,
          },
        }
      );
      const result = await res.json();
      setProducts(result.data || []);
      setTotalPages(result.meta?.last_page || 1);
      setTotalProducts(result.meta?.total || 0);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setProducts([]);
      setTotalProducts(0);
      Swal.fire({
        title: "Error",
        text: "Failed to fetch products",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete product
  const deleteProduct = async (id, title) => {
    const result = await Swal.fire({
      title: `Are you sure?`,
      text: `You want to delete product: "${title}"`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      cancelButtonText: "CANCEL",
      confirmButtonText: "DELETE",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      setDeletingId(id);
      try {
        const res = await fetch(`${apiUrl}/products/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${adminToken()}`,
          },
        });
        await res.json();
        setProducts((prev) => prev.filter((p) => p.id !== id));
        Swal.fire({
          title: "Deleted!",
          text: "Product deleted successfully.",
          icon: "success",
        });
        fetchProducts(currentPage);
      } catch (error) {
        console.error("Failed to delete product:", error);
        Swal.fire({
          title: "Error",
          text: "Failed to delete product",
          icon: "error",
        });
      } finally {
        setDeletingId(null);
      }
    }
  };

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage]);

  // Debounce for search/filter
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    setFiltering(true);
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setFiltering(false);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    setFiltering(true);
    const handler = setTimeout(() => setFiltering(false), 50);
    return () => clearTimeout(handler);
  }, [filterInStock, filterOutStock]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        product.sku.toLowerCase().includes(debouncedSearch.toLowerCase());

      let matchesStock = true;
      if (filterInStock && !filterOutStock) matchesStock = product.qty > 0;
      if (!filterInStock && filterOutStock) matchesStock = product.qty === 0;
      if (filterInStock && filterOutStock) matchesStock = true;

      return matchesSearch && matchesStock;
    });
  }, [products, debouncedSearch, filterInStock, filterOutStock]);

  // Export to Excel with images
  const exportToExcelWithImages = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Products");

    worksheet.addRow([
      "No",
      "Image",
      "Title",
      "Price",
      "Cost",
      "Selling Price",
      "Qty",
      "SKU",
      "Status",
      "Created At",
      "Updated At",
    ]);

    for (let i = 0; i < filteredProducts.length; i++) {
      const product = filteredProducts[i];
      const row = worksheet.addRow([
        i + 1,
        "",
        product.title,
        product.price,
        product.cost,
        product.selling_price,
        product.qty,
        product.sku,
        product.status === 1 ? "Active" : "Inactive",
        product.created_at
          ? format(parseISO(product.created_at), "dd MMM yyyy HH:mm", {
              timeZone: "Asia/Jakarta",
            })
          : "N/A",
        product.updated_at
          ? format(parseISO(product.updated_at), "dd MMM yyyy HH:mm", {
              timeZone: "Asia/Jakarta",
            })
          : "N/A",
      ]);

      if (product.image_url) {
        try {
          const res = await fetch(product.image_url);
          const blob = await res.blob();

          const reader = new FileReader();
          const base64 = await new Promise((resolve, reject) => {
            reader.onloadend = () => resolve(reader.result.split(",")[1]);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });

          const ext = product.image_url.split(".").pop().toLowerCase();
          const extension = ext === "jpg" ? "jpeg" : ext;

          const imageId = workbook.addImage({
            base64,
            extension,
          });

          worksheet.addImage(imageId, {
            tl: { col: 1, row: row.number - 1 },
            ext: { width: 60, height: 60 },
          });
        } catch (err) {
          console.error("Image load failed:", err);
        }
      }
    }

    worksheet.columns.forEach((col, index) => {
      if (index === 1) col.width = 15;
      else col.width = 20;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "products.xlsx");
  };

  // Pagination handlers
  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  // Handle image preview
  const openPreview = (imageUrl) => {
    setPreviewImage(imageUrl);
  };

  const closePreview = () => {
    setPreviewImage(null);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <div className="flex gap-1 font-semibold items-center text-sm sm:text-base">
              <Link to="/admin/dashboard" className="flex items-center gap-1">
                <HomeIcon className="h-5 w-5 sm:h-6 sm:w-6 mb-1 mr-1" />
                <span className="hover:text-red-500">Dashboard</span>
              </Link>
              <span>/</span>
              <Link to="/admin/products" className="flex items-center">
                <span className="hover:text-red-500 text-red-600">
                  Products
                </span>
              </Link>
            </div>
            <div className="flex gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={exportToExcelWithImages}
                className="inline-flex items-center border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white focus:ring-4 focus:ring-blue-300 px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition duration-300 shadow-md"
              >
                <ArrowDownTrayIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Export
              </button>
              <Link
                to="/admin/products/create"
                className="inline-flex items-center border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white focus:ring-4 focus:ring-blue-300 px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition duration-300 shadow-md"
              >
                Create
              </Link>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="relative w-full sm:w-1/5">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <MagnifyingGlassIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </span>
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-200 text-sm sm:text-base"
              />
            </div>
            <div className="flex gap-3 flex-wrap">
              <label className="flex items-center gap-2 text-sm sm:text-base">
                <span className="text-gray-500 font-semibold hidden sm:inline">
                  Filter by:
                </span>
                <input
                  type="checkbox"
                  checked={filterInStock}
                  onChange={(e) => setFilterInStock(e.target.checked)}
                  className="w-4 h-4 cursor-pointer accent-blue-600 rounded"
                />
                <span className="text-gray-700">In Stock</span>
              </label>
              <label className="flex items-center gap-2 text-sm sm:text-base">
                <input
                  type="checkbox"
                  checked={filterOutStock}
                  onChange={(e) => setFilterOutStock(e.target.checked)}
                  className="w-4 h-4 cursor-pointer accent-blue-600 rounded"
                />
                <span className="text-gray-700">Out Stock</span>
              </label>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
              <table className="min-w-full table-auto divide-y divide-gray-200 font-semibold">
                <thead className="bg-gray-200">
                  <tr>
                    {[
                      "NO.",
                      "Image",
                      "Title",
                      "Cost",
                      "Selling",
                      "Qty",
                      "SKU",

                      "Create At",
                      "Update At",
                      "Status",
                      "Action",
                    ].map((header) => (
                      <th
                        key={header}
                        className={`px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide select-none ${
                          ["SKU", "Create At", "Update At"].includes(header)
                            ? "hidden sm:table-cell"
                            : ""
                        }`}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-50">
                  {loading || filtering ? (
                    <tr>
                      <td colSpan={12} className="text-center py-10">
                        <Loading />
                      </td>
                    </tr>
                  ) : filteredProducts.length > 0 ? (
                    filteredProducts.map((product, index) => (
                      <tr
                        key={product.id}
                        className="bg-gray-50 hover:bg-blue-50 transition-colors duration-200"
                      >
                        <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm font-medium text-gray-900 whitespace-nowrap">
                          {(currentPage - 1) * perPage + index + 1}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-700">
                          {product.image_url ? (
                            <button
                              onClick={() => openPreview(product.image_url)}
                              className="focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md"
                              aria-label={`Preview image of ${product.title}`}
                            >
                              <img
                                src={product.image_url}
                                alt={`Image of ${product.title}`}
                                className="h-10 w-10 sm:h-12 sm:w-12 object-cover rounded-md border border-gray-200 max-w-full"
                                loading="lazy"
                                onError={(e) => {
                                  e.target.src =
                                    "https://placehold.co/50x50?text=No+Image";
                                  e.target.alt = "Failed to load image";
                                }}
                              />
                            </button>
                          ) : (
                            <div className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center bg-gray-100 rounded-md border border-gray-200 text-gray-400">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 15l4-4a2 2 0 012 0l5 5a2 2 0 002 0l3-3a2 2 0 012 0l2 2"
                                />
                              </svg>
                            </div>
                          )}
                        </td>

                        <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-700 truncate max-w-[150px] sm:max-w-xs">
                          {product.title}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-700">
                          ${product.cost}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-700">
                          ${product.selling_price}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-700">
                          {product.qty}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-700 hidden sm:table-cell">
                          {product.sku}
                        </td>

                        <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-600 whitespace-nowrap hidden sm:table-cell">
                          {product.created_at ? (
                            <time
                              dateTime={product.created_at}
                              title={format(
                                parseISO(product.created_at),
                                "PPpp",
                                { timeZone: "Asia/Jakarta" }
                              )}
                              className="cursor-default"
                            >
                              {format(
                                parseISO(product.created_at),
                                "dd MMM yyyy HH:mm a",
                                { timeZone: "Asia/Jakarta" }
                              )}
                            </time>
                          ) : (
                            <span className="text-gray-400 italic">N/A</span>
                          )}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-600 whitespace-nowrap hidden sm:table-cell">
                          {product.updated_at ? (
                            <time
                              dateTime={product.updated_at}
                              title={format(
                                parseISO(product.updated_at),
                                "PPpp",
                                { timeZone: "Asia/Jakarta" }
                              )}
                              className="cursor-default"
                            >
                              {format(
                                parseISO(product.updated_at),
                                "dd MMM yyyy HH:mm a",
                                { timeZone: "Asia/Jakarta" }
                              )}
                            </time>
                          ) : (
                            <span className="text-gray-400 italic">N/A</span>
                          )}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-block px-3 py-1 rounded-md text-xs sm:text-sm font-semibold select-none ${
                              product.status === 1
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {product.status === 1 ? "In Stock" : "Out Stock"}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-7 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                          <Link
                            to={`/admin/products/show/view/${product.id}`}
                            aria-label={`View ${product.title}`}
                            className="text-green-600 hover:text-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 rounded transition-colors duration-200"
                          >
                            <EyeIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                          </Link>
                          <Link
                            to={`/admin/products/edit/${product.id}`}
                            aria-label={`Edit ${product.title}`}
                            className="text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded transition-colors duration-200"
                          >
                            <PencilSquareIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                          </Link>
                          <button
                            type="button"
                            aria-label="Delete"
                            onClick={() =>
                              deleteProduct(product.id, product.title)
                            }
                            className="text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 rounded transition-colors duration-200 cursor-pointer"
                            disabled={deletingId === product.id}
                          >
                            <TrashIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={12}
                        className="text-center px-4 sm:px-6 py-10 text-gray-500 italic text-sm sm:text-base"
                      >
                        No products found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Image Preview Modal */}
          {previewImage && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="relative bg-white rounded-lg p-4 max-w-3xl w-full mx-4">
                <button
                  onClick={closePreview}
                  className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded"
                  aria-label="Close preview"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
                <img
                  src={previewImage}
                  alt="Product preview"
                  className="w-full h-auto max-h-[70vh] object-contain rounded-md"
                  onError={(e) => {
                    e.target.src = "https://placehold.co/300x300?text=No+Image";
                    e.target.alt = "Failed to load image";
                  }}
                />
              </div>
            </div>
          )}

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 px-4 sm:px-6 gap-3">
            <div className="text-sm sm:text-base text-gray-600">
              Showing {filteredProducts.length} | Page {currentPage} of{" "}
              {totalPages}
            </div>
            <div className="flex gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className="inline-flex items-center border-2 border-gray-300 text-gray-600 hover:bg-gray-200 focus:ring-4 focus:ring-gray-300 px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-semibold text-sm sm:text-base transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous page"
              >
                <ChevronLeftIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
                Previous
              </button>
              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="inline-flex items-center border-2 border-gray-300 text-gray-600 hover:bg-gray-200 focus:ring-4 focus:ring-gray-300 px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-semibold text-sm sm:text-base transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Next page"
              >
                Next
                <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ShowProduct;
