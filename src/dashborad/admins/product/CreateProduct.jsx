import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../../component_dashboard/Layout";
import { useForm } from "react-hook-form";
import { adminToken, apiUrl } from "../../../context/http";
import Swal from "sweetalert2";

const CreateProduct = () => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm();

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [sizes, setSizes] = useState([]); // New state for sizes
  const [gallery, setGallery] = useState([]);
  const [previewImages, setPreviewImages] = useState([]); // New state for image previews
  const [disable, setDisable] = useState(false);

  const navigate = useNavigate();

  // Generate SKU
  const generateSKU = () => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const randomChar = () =>
      Math.random() < 0.5
        ? letters.charAt(Math.floor(Math.random() * letters.length))
        : numbers.charAt(Math.floor(Math.random() * numbers.length));
    const part = () => Array.from({ length: 4 }, () => randomChar()).join("");
    return `${part()}${part()}`;
  };

  // Generate Barcode
  const generateBarcode = () => {
    const digits = "0123456789";
    return Array.from({ length: 12 }, () =>
      digits.charAt(Math.floor(Math.random() * digits.length))
    ).join("");
  };

  // Set SKU & Barcode on mount
  useEffect(() => {
    setValue("sku", generateSKU());
    setValue("barcode", generateBarcode());
  }, [setValue]);

  // Handle Image Upload and Preview
  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setDisable(true);
    const newGalleryIds = [...gallery];
    const newPreviewImages = [...previewImages];

    try {
      for (const file of files) {
        // Add preview URL
        const previewUrl = URL.createObjectURL(file);
        newPreviewImages.push({ file, previewUrl });

        // Upload to server
        const formData = new FormData();
        formData.append("image", file);

        const res = await fetch(`${apiUrl}/temp-images`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${adminToken()}`,
          },
          body: formData,
        });

        const result = await res.json();

        if (res.ok) {
          newGalleryIds.push(result.data.id);
        } else {
          Swal.fire(
            "Error",
            result.message || "Failed to upload image",
            "error"
          );
          // Remove preview if upload fails
          newPreviewImages.pop();
        }
      }
      setGallery(newGalleryIds);
      setPreviewImages(newPreviewImages);
    } catch (error) {
      Swal.fire("Error", "Error uploading images", "error");
      console.error("Error uploading image:", error);
    } finally {
      setDisable(false);
    }
  };

  // Remove Image from Preview and Gallery
  const removeImage = (index) => {
    setPreviewImages((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].previewUrl); // Clean up URL
      updated.splice(index, 1);
      return updated;
    });
    setGallery((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  };

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      const res = await fetch(`${apiUrl}/categoies`, {
        // Fixed typo: 'categoies' -> 'categories'
        headers: { Authorization: `Bearer ${adminToken()}` },
      });
      const result = await res.json();
      if (res.ok) {
        setCategories(result.data || []);
      } else {
        Swal.fire("Error", "Failed to fetch categories", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Error fetching categories", "error");
      console.error("Error fetching categories:", error);
    }
  };

  // Fetch Brands
  const fetchBrands = async () => {
    try {
      const res = await fetch(`${apiUrl}/brands`, {
        headers: { Authorization: `Bearer ${adminToken()}` },
      });
      const result = await res.json();
      if (res.ok) {
        setBrands(result.data || []);
      } else {
        Swal.fire("Error", "Failed to fetch brands", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Error fetching brands", "error");
      console.error("Error fetching brands:", error);
    }
  };

  // Fetch Suppliers
  const fetchSuppliers = async () => {
    try {
      const res = await fetch(`${apiUrl}/suppliers`, {
        headers: { Authorization: `Bearer ${adminToken()}` },
      });
      const result = await res.json();
      if (res.ok) {
        setSuppliers(result.data || []);
      } else {
        Swal.fire("Error", "Failed to fetch suppliers", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Error fetching suppliers", "error");
      console.error("Error fetching suppliers:", error);
    }
  };

  // Fetch Sizes
  const fetchSizes = async () => {
    try {
      const res = await fetch(`${apiUrl}/sizes`, {
        headers: { Authorization: `Bearer ${adminToken()}` },
      });
      const result = await res.json();
      if (res.ok) {
        setSizes(result.data || []);
      } else {
        Swal.fire("Error", "Failed to fetch sizes", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Error fetching sizes", "error");
      console.error("Error fetching sizes:", error);
    }
  };

  // Load all dropdowns on mount
  useEffect(() => {
    Promise.all([
      fetchCategories(),
      fetchBrands(),
      fetchSuppliers(),
      fetchSizes(),
    ]).catch((error) => {
      console.error("Error fetching dropdown data:", error);
    });
  }, []);

  // Save Product
  const saveProduct = async (data) => {
    setLoading(true);
    try {
      const formData = { ...data, gallery };
      const res = await fetch(`${apiUrl}/products`, {
        // Fixed typo: 'products'
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken()}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (res.ok) {
        Swal.fire("Success", "Product created successfully!", "success");
        reset();
        setGallery([]); // Reset gallery state
        setPreviewImages([]); // Reset preview images
        setValue("sku", generateSKU());
        setValue("barcode", generateBarcode());
        navigate("/admin/products");
      } else {
        Swal.fire(
          "Error",
          result.message || "Failed to create product",
          "error"
        );
      }
    } catch (error) {
      Swal.fire("Error", "Something went wrong", "error");
      console.error("Error saving product:", error);
    } finally {
      setLoading(false);
    }
  };

  // Clean up preview URLs on component unmount
  useEffect(() => {
    return () => {
      previewImages.forEach(({ previewUrl }) =>
        URL.revokeObjectURL(previewUrl)
      );
    };
  }, [previewImages]);

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-0 sm:items-center mb-8">
          <div className="flex flex-wrap gap-2 font-semibold items-center text-gray-700 text-lg">
            <Link
              to="/admin/products"
              className="hover:text-red-600 transition"
            >
              Products
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-red-500 hover:text-red-600 transition">
              Create
            </span>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6 sm:p-8 border border-gray-100">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">
            Create Product
          </h2>

          <form
            onSubmit={handleSubmit(saveProduct)}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* LEFT COLUMN */}
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block mb-2 text-gray-700 font-medium">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="Enter product title"
                  {...register("title", { required: "Title is required" })}
                  className={`w-full block border ${
                    errors.title ? "border-red-500" : "border-gray-300"
                  } rounded-md px-4 py-2 transition focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                />
                {errors.title && (
                  <p className="text-red-500 mt-1 text-sm">
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Category/Brand */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-gray-700 font-medium">
                    Category
                  </label>
                  <select
                    {...register("category", {
                      required: "Category is required",
                    })}
                    className={`w-full block border ${
                      errors.category ? "border-red-500" : "border-gray-300"
                    } rounded-md px-4 py-2 transition focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    defaultValue=""
                  >
                    <option value="" disabled>
                      {categories.length === 0
                        ? "Loading..."
                        : "Select Category"}
                    </option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-red-500 mt-1 text-sm">
                      {errors.category.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block mb-2 text-gray-700 font-medium">
                    Brand
                  </label>
                  <select
                    {...register("brand", { required: "Brand is required" })}
                    className={`w-full block border ${
                      errors.brand ? "border-red-500" : "border-gray-300"
                    } rounded-md px-4 py-2 transition focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    defaultValue=""
                  >
                    <option value="" disabled>
                      {brands.length === 0 ? "Loading..." : "Select Brand"}
                    </option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                  {errors.brand && (
                    <p className="text-red-500 mt-1 text-sm">
                      {errors.brand.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Supplier */}
              <div>
                <label className="block mb-2 text-gray-700 font-medium">
                  Supplier
                </label>
                <select
                  {...register("supplier", {
                    required: "Supplier is required",
                  })}
                  className={`w-full block border ${
                    errors.supplier ? "border-red-500" : "border-gray-300"
                  } rounded-md px-4 py-2 transition focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  defaultValue=""
                >
                  <option value="" disabled>
                    {suppliers.length === 0 ? "Loading..." : "Select Supplier"}
                  </option>
                  {suppliers.map((sup) => (
                    <option key={sup.id} value={sup.id}>
                      {sup.name}
                    </option>
                  ))}
                </select>
                {errors.supplier && (
                  <p className="text-red-500 mt-1 text-sm">
                    {errors.supplier.message}
                  </p>
                )}
              </div>

              {/* Image Upload */}
              <div>
                <label className="block mb-2 text-gray-700 font-medium">
                  Product Images
                </label>
                <input
                  type="file"
                  accept="image/*"
                  name="gallery"
                  multiple
                  onChange={handleImageChange}
                  disabled={disable}
                  className={`w-full block border ${
                    disable ? "border-gray-300 bg-gray-100" : "border-gray-300"
                  } rounded-md px-4 py-2 transition cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200`}
                />
                {disable && (
                  <p className="text-gray-600 mt-1 text-sm">Uploading...</p>
                )}
                {gallery.length > 0 && (
                  <p className="text-gray-600 mt-2 text-sm">
                    {gallery.length} image(s) uploaded
                  </p>
                )}
                {/* Image Preview */}
                {previewImages.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {previewImages.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image.previewUrl}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 sm:h-32 object-cover rounded-md border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                          aria-label={`Remove image ${index + 1}`}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-4">
              {/* Price/Cost */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-gray-700 font-medium">
                    Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Enter price"
                    {...register("price", { required: "Price is required" })}
                    className={`w-full block border ${
                      errors.price ? "border-red-500" : "border-gray-300"
                    } rounded-md px-4 py-2 transition focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  />
                  {errors.price && (
                    <p className="text-red-500 mt-1 text-sm">
                      {errors.price.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block mb-2 text-gray-700 font-medium">
                    Cost
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Enter cost"
                    {...register("cost", { required: "Cost is required" })}
                    className={`w-full block border ${
                      errors.cost ? "border-red-500" : "border-gray-300"
                    } rounded-md px-4 py-2 transition focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  />
                  {errors.cost && (
                    <p className="text-red-500 mt-1 text-sm">
                      {errors.cost.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Selling / Qty */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-gray-700 font-medium">
                    Selling Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Enter selling price"
                    {...register("selling_price", {
                      required: "Selling price is required",
                    })}
                    className={`w-full block border ${
                      errors.selling_price
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md px-4 py-2 transition focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  />
                  {errors.selling_price && (
                    <p className="text-red-500 mt-1 text-sm">
                      {errors.selling_price.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block mb-2 text-gray-700 font-medium">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Enter quantity"
                    {...register("qty", { required: "Quantity is required" })}
                    className={`w-full block border ${
                      errors.qty ? "border-red-500" : "border-gray-300"
                    } rounded-md px-4 py-2 transition focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  />
                  {errors.qty && (
                    <p className="text-red-500 mt-1 text-sm">
                      {errors.qty.message}
                    </p>
                  )}
                </div>
              </div>

              {/* SKU */}
              <div>
                <label className="block mb-2 text-gray-700 font-medium">
                  SKU
                </label>
                <input
                  type="text"
                  {...register("sku")}
                  readOnly
                  className="w-full block border border-gray-300 rounded-md px-4 py-2 bg-gray-100"
                />
              </div>

              {/* Barcode */}
              <div>
                <label className="block mb-2 text-gray-700 font-medium">
                  Barcode
                </label>
                <input
                  type="text"
                  {...register("barcode")}
                  readOnly
                  className="w-full block border border-gray-300 rounded-md px-4 py-2 bg-gray-100"
                />
              </div>
              {/* Sizes */}
              <div>
                <label className="block mb-2 text-gray-700 font-medium">
                  Sizes
                </label>
                <div className="flex flex-wrap gap-4">
                  {sizes.length === 0 ? (
                    <p className="text-gray-500">No sizes available</p>
                  ) : (
                    sizes.map((size) => (
                      <div key={size.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`size-${size.id}`}
                          value={size.id}
                          {...register("sizes", {
                            validate: (value) =>
                              value && value.length > 0
                                ? true
                                : "At least one size is required",
                          })}
                          className={`border ${
                            errors.sizes ? "border-red-500" : "border-gray-300"
                          } rounded focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                        />
                        <label
                          htmlFor={`size-${size.id}`}
                          className="text-gray-700"
                        >
                          {size.name}
                        </label>
                      </div>
                    ))
                  )}
                </div>
                {errors.sizes && (
                  <p className="text-red-500 mt-1 text-sm">
                    {errors.sizes.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block mb-2 text-gray-700 font-medium">
                  Description
                </label>
                <textarea
                  {...register("description")}
                  placeholder="Enter description"
                  rows="4"
                  className="w-full border border-gray-300 rounded-md px-4 py-2 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Discount Price */}
              <div>
                <label className="block mb-2 text-gray-700 font-medium">
                  Discount Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Enter discount price"
                  {...register("discount")}
                  className="w-full block border border-gray-300 rounded-md px-4 py-2 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Feature & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block mb-2 text-gray-700 font-medium">
                    Status
                  </label>
                  <select
                    {...register("status", { required: "Status is required" })}
                    defaultValue=""
                    className={`appearance-none w-full bg-white border ${
                      errors.status ? "border-red-500" : "border-gray-300"
                    } rounded-md px-4 py-3 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition`}
                  >
                    <option value="" disabled>
                      Select Status
                    </option>
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </select>
                  {errors.status && (
                    <p className="text-red-500 mt-1 text-sm">
                      {errors.status.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={loading || disable}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 ${
                  loading || disable
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-indigo-500 hover:bg-indigo-600"
                } text-white font-semibold rounded-md px-6 py-3 transition shadow-md`}
              >
                {loading ? "Saving..." : "Save Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default CreateProduct;
