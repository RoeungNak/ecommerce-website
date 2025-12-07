import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Layout from "../../component_dashboard/Layout";
import { useForm } from "react-hook-form";
import { adminToken, apiUrl } from "../../../context/http";
import Swal from "sweetalert2";

const EditProduct = () => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [productImages, setProductImages] = useState([]);
  const [imageUploading, setImageUploading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  const showError = (title, message) =>
    Swal.fire({ title, text: message || "An error occurred", icon: "error" });

  useEffect(() => {
    const fetchData = async () => {
      setFetchLoading(true);
      try {
        const [productRes, categoriesRes, brandsRes, suppliersRes, sizesRes] =
          await Promise.all([
            fetch(`${apiUrl}/products/${id}`, {
              headers: { Authorization: `Bearer ${adminToken()}` },
            }),
            fetch(`${apiUrl}/categoies`, {
              headers: { Authorization: `Bearer ${adminToken()}` },
            }),
            fetch(`${apiUrl}/brands`, {
              headers: { Authorization: `Bearer ${adminToken()}` },
            }),
            fetch(`${apiUrl}/suppliers`, {
              headers: { Authorization: `Bearer ${adminToken()}` },
            }),
            fetch(`${apiUrl}/sizes`, {
              headers: { Authorization: `Bearer ${adminToken()}` },
            }),
          ]);

        const [
          productResult,
          categoriesResult,
          brandsResult,
          suppliersResult,
          sizesResult,
        ] = await Promise.all([
          productRes.json(),
          categoriesRes.json(),
          brandsRes.json(),
          suppliersRes.json(),
          sizesRes.json(),
        ]);

        // Log API responses for debugging
        console.log({
          productResult,
          categoriesResult,
          brandsResult,
          suppliersResult,
          sizesResult,
        });

        if (productRes.ok) {
          const product = productResult.data;
          setProductImages(
            Array.isArray(product.product_images)
              ? product.product_images.map((img) => ({
                  id: img.id,
                  image_url: img.image_url,
                  is_default: product.image === img.image_url.split("/").pop(),
                  isNew: false,
                }))
              : []
          );

          const {
            product_images,
            product_sizes,
            category_id,
            brand_id,
            supplier_id,
            ...restOfProduct
          } = product;
          for (const [key, value] of Object.entries(restOfProduct)) {
            setValue(key, value);
          }
          setValue("category", String(category_id));
          setValue("brand", String(brand_id));
          setValue("supplier", String(supplier_id));
          setValue(
            "sizes",
            Array.isArray(product_sizes)
              ? product_sizes.map((ps) => String(ps.size_id))
              : []
          );
        } else {
          showError(
            "Error",
            productResult.message || "Failed to fetch product"
          );
        }

        setCategories(
          categoriesRes.ok && Array.isArray(categoriesResult.data)
            ? categoriesResult.data
            : []
        );
        if (!categoriesRes.ok) {
          showError(
            "Error",
            categoriesResult.message || "Failed to fetch categories"
          );
        }

        setBrands(
          brandsRes.ok && Array.isArray(brandsResult.data)
            ? brandsResult.data
            : []
        );
        if (!brandsRes.ok) {
          showError("Error", brandsResult.message || "Failed to fetch brands");
        }

        setSuppliers(
          suppliersRes.ok && Array.isArray(suppliersResult.data)
            ? suppliersResult.data
            : []
        );
        if (!suppliersRes.ok) {
          showError(
            "Error",
            suppliersResult.message || "Failed to fetch suppliers"
          );
        }

        setSizes(
          sizesRes.ok && Array.isArray(sizesResult.data) ? sizesResult.data : []
        );
        if (!sizesRes.ok) {
          showError("Error", sizesResult.message || "Failed to fetch sizes");
        }
      } catch (error) {
        showError("Error", "Error fetching data");
        console.error(error);
      } finally {
        setFetchLoading(false);
      }
    };

    fetchData();
  }, [id, setValue]);

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setImageUploading(true);
    const newProductImages = [...productImages];

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append("image", file);
        formData.append("product_id", id);

        const res = await fetch(`${apiUrl}/save-product-image`, {
          method: "POST",
          headers: { Authorization: `Bearer ${adminToken()}` },
          body: formData,
        });

        const result = await res.json();
        if (res.ok) {
          return {
            id: result.data.id, // Ensure the ID is correctly returned from the backend
            image_url: result.data.image_url,
            is_default: false,
            isNew: true,
          };
        } else {
          throw new Error(result.message || "Failed to upload image");
        }
      });

      const uploadedImages = await Promise.all(uploadPromises);
      setProductImages([...newProductImages, ...uploadedImages]);
    } catch (error) {
      showError("Error", error.message || "Error uploading images");
    } finally {
      setImageUploading(false);
    }
  };

  const removeImage = async (index) => {
    const image = productImages[index];
    if (!image) return;

    const originalImages = [...productImages];
    const newProductImages = productImages.filter((_, i) => i !== index);
    setProductImages(newProductImages);

    if (!image.isNew) {
      const res = await fetch(`${apiUrl}/product-delete-image/${image.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken()}` },
      });
      if (!res.ok) {
        setProductImages(originalImages); // Revert on failure
        const result = await res.json();
        showError("Error", result.message || "Failed to remove image");
      }
    }
  };

  const setDefaultImage = async (index) => {
    const imageToSetDefault = productImages[index];
    if (!imageToSetDefault || imageToSetDefault.is_default) return;

    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/change-product-default-image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${adminToken()}`,
        },
        body: JSON.stringify({
          product_id: id,
          image: imageToSetDefault.image_url.split("/").pop(),
        }),
      });

      const result = await res.json();

      if (res.ok) {
        const newDefaultFilename = result.data.image;
        setProductImages(
          productImages.map((img) => ({
            ...img,
            is_default: img.image_url.endsWith(newDefaultFilename),
          }))
        );
        navigate("/admin/products");
        Swal.fire({
          title: "Success",
          text: `Default image set successfully!`,
          icon: "success",
        });
      } else {
        showError("Error", result.message || "Failed to update default image");
      }
    } catch (error) {
      showError("Error", error.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const saveProduct = async (data) => {
    if (productImages.length === 0) {
      showError("Validation Error", "At least one product image is required.");
      return;
    }

    setLoading(true);
    try {
      const formData = {
        ...data,
        sizes: data.sizes || [],
      };
      const res = await fetch(`${apiUrl}/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken()}`,
        },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (res.ok) {
        Swal.fire("Success", "Product updated successfully", "success");
        navigate("/admin/products");
      } else {
        showError("Error", result.message || "Failed to update product");
      }
    } catch (error) {
      showError("Error", error.message || "Error updating product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-0 sm:items-center mb-8">
          <div className="flex flex-wrap gap-2 font-semibold items-center text-gray-700 text-lg">
            <Link
              to="/admin/products"
              className="hover:text-red-600 transition"
            >
              Products
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-red-500">Edit</span>
          </div>
        </div>

        <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6 sm:p-8 border border-gray-100">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">
            Edit Product
          </h2>

          {fetchLoading ? (
            <div className="flex justify-center py-10">
              <div className="w-10 h-10 border-4 border-t-indigo-600 border-gray-200 rounded-full animate-spin"></div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit(saveProduct)}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* LEFT COLUMN */}
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="title"
                    className="block mb-2 text-gray-700 font-medium"
                  >
                    Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    placeholder="Enter product title"
                    {...register("title", { required: "Title is required" })}
                    className={`w-full border ${
                      errors.title ? "border-red-500" : "border-gray-300"
                    } rounded-md px-4 py-2 transition focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    aria-invalid={errors.title ? "true" : "false"}
                    aria-describedby={errors.title ? "title-error" : undefined}
                  />
                  {errors.title && (
                    <p id="title-error" className="text-red-500 mt-1 text-sm">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="category"
                      className="block mb-2 text-gray-700 font-medium"
                    >
                      Category
                    </label>
                    <select
                      id="category"
                      {...register("category", {
                        required: "Category is required",
                      })}
                      className={`w-full border ${
                        errors.category ? "border-red-500" : "border-gray-300"
                      } rounded-md px-4 py-2 transition focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                      aria-invalid={errors.category ? "true" : "false"}
                      aria-describedby={
                        errors.category ? "category-error" : undefined
                      }
                    >
                      <option value="" disabled>
                        {categories.length === 0
                          ? "No categories available"
                          : "Select Category"}
                      </option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p
                        id="category-error"
                        className="text-red-500 mt-1 text-sm"
                      >
                        {errors.category.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="brand"
                      className="block mb-2 text-gray-700 font-medium"
                    >
                      Brand
                    </label>
                    <select
                      id="brand"
                      {...register("brand", { required: "Brand is required" })}
                      className={`w-full border ${
                        errors.brand ? "border-red-500" : "border-gray-300"
                      } rounded-md px-4 py-2 transition focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                      aria-invalid={errors.brand ? "true" : "false"}
                      aria-describedby={
                        errors.brand ? "brand-error" : undefined
                      }
                    >
                      <option value="" disabled>
                        {brands.length === 0
                          ? "No brands available"
                          : "Select Brand"}
                      </option>
                      {brands.map((brand) => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name}
                        </option>
                      ))}
                    </select>
                    {errors.brand && (
                      <p id="brand-error" className="text-red-500 mt-1 text-sm">
                        {errors.brand.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="supplier"
                    className="block mb-2 text-gray-700 font-medium"
                  >
                    Supplier
                  </label>
                  <select
                    id="supplier"
                    {...register("supplier", {
                      required: "Supplier is required",
                    })}
                    className={`w-full border ${
                      errors.supplier ? "border-red-500" : "border-gray-300"
                    } rounded-md px-4 py-2 transition focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    aria-invalid={errors.supplier ? "true" : "false"}
                    aria-describedby={
                      errors.supplier ? "supplier-error" : undefined
                    }
                  >
                    <option value="" disabled>
                      {suppliers.length === 0
                        ? "No suppliers available"
                        : "Select Supplier"}
                    </option>
                    {suppliers.map((sup) => (
                      <option key={sup.id} value={sup.id}>
                        {sup.name}
                      </option>
                    ))}
                  </select>
                  {errors.supplier && (
                    <p
                      id="supplier-error"
                      className="text-red-500 mt-1 text-sm"
                    >
                      {errors.supplier.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block mb-2 text-gray-700 font-medium">
                    Sizes
                  </label>
                  <div className="flex flex-wrap gap-4">
                    {console.log("sizes:", sizes)}
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
                              errors.sizes
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                            aria-invalid={errors.sizes ? "true" : "false"}
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
                    <p id="sizes-error" className="text-red-500 mt-1 text-sm">
                      {errors.sizes.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="images"
                    className="block mb-2 text-gray-700 font-medium"
                  >
                    Product Images
                  </label>
                  <div className="relative">
                    <input
                      id="images"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      disabled={imageUploading}
                      className={`w-full border ${
                        imageUploading
                          ? "border-gray-300 bg-gray-100"
                          : "border-gray-300"
                      } rounded-md px-4 py-2 transition cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200`}
                    />
                    {imageUploading && (
                      <div className="absolute right-2 top-2">
                        <div className="w-6 h-6 border-4 border-t-indigo-600 border-gray-200 rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  {console.log("productImages:", productImages)}
                  {productImages.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 gap-4">
                      {productImages.map((image, index) => (
                        <div key={image.id} className="relative">
                          <img
                            src={
                              image.image_url ||
                              `https://via.placeholder.com/150?text=Image+${
                                index + 1
                              }`
                            }
                            alt={`Product image ${index + 1}`}
                            className={`w-full h-32 object-cover rounded-md ${
                              image.is_default ? "ring-4 ring-blue-500" : ""
                            }`}
                            onError={(e) => {
                              e.target.src = "https://via.placeholder.com/150";
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="bg-red-500 text-white rounded-md w-full mt-2 p-1.5 hover:bg-red-600 transition"
                          >
                            Delete
                          </button>
                          <button
                            type="button"
                            onClick={() => setDefaultImage(index)}
                            disabled={image.is_default}
                            className={`w-full mt-2 p-1.5 rounded-md transition ${
                              image.is_default
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-blue-500 hover:bg-blue-600 text-white"
                            }`}
                          >
                            {image.is_default ? "Default" : "Set as Default"}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="price"
                      className="block mb-2 text-gray-700 font-medium"
                    >
                      Price
                    </label>
                    <input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Enter price"
                      {...register("price", {
                        required: "Price is required",
                        min: { value: 0, message: "Price cannot be negative" },
                      })}
                      className={`w-full border ${
                        errors.price ? "border-red-500" : "border-gray-300"
                      } rounded-md px-4 py-2 transition focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                      aria-invalid={errors.price ? "true" : "false"}
                      aria-describedby={
                        errors.price ? "price-error" : undefined
                      }
                    />
                    {errors.price && (
                      <p id="price-error" className="text-red-500 mt-1 text-sm">
                        {errors.price.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="cost"
                      className="block mb-2 text-gray-700 font-medium"
                    >
                      Cost
                    </label>
                    <input
                      id="cost"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Enter cost"
                      {...register("cost", {
                        required: "Cost is required",
                        min: { value: 0, message: "Cost cannot be negative" },
                      })}
                      className={`w-full border ${
                        errors.cost ? "border-red-500" : "border-gray-300"
                      } rounded-md px-4 py-2 transition focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                      aria-invalid={errors.cost ? "true" : "false"}
                      aria-describedby={errors.cost ? "cost-error" : undefined}
                    />
                    {errors.cost && (
                      <p id="cost-error" className="text-red-500 mt-1 text-sm">
                        {errors.cost.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="selling_price"
                      className="block mb-2 text-gray-700 font-medium"
                    >
                      Selling Price
                    </label>
                    <input
                      id="selling_price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Enter selling price"
                      {...register("selling_price", {
                        required: "Selling price is required",
                        min: {
                          value: 0,
                          message: "Selling price cannot be negative",
                        },
                      })}
                      className={`w-full border ${
                        errors.selling_price
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md px-4 py-2 transition focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                      aria-invalid={errors.selling_price ? "true" : "false"}
                      aria-describedby={
                        errors.selling_price ? "selling-price-error" : undefined
                      }
                    />
                    {errors.selling_price && (
                      <p
                        id="selling-price-error"
                        className="text-red-500 mt-1 text-sm"
                      >
                        {errors.selling_price.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="qty"
                      className="block mb-2 text-gray-700 font-medium"
                    >
                      Quantity
                    </label>
                    <input
                      id="qty"
                      type="number"
                      min="0"
                      placeholder="Enter quantity"
                      {...register("qty", {
                        required: "Quantity is required",
                        min: {
                          value: 0,
                          message: "Quantity cannot be negative",
                        },
                      })}
                      className={`w-full border ${
                        errors.qty ? "border-red-500" : "border-gray-300"
                      } rounded-md px-4 py-2 transition focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                      aria-invalid={errors.qty ? "true" : "false"}
                      aria-describedby={errors.qty ? "qty-error" : undefined}
                    />
                    {errors.qty && (
                      <p id="qty-error" className="text-red-500 mt-1 text-sm">
                        {errors.qty.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="sku"
                    className="block mb-2 text-gray-700 font-medium"
                  >
                    SKU
                  </label>
                  <input
                    id="sku"
                    type="text"
                    {...register("sku", { required: "SKU is required" })}
                    readOnly
                    className="w-full border border-gray-300 rounded-md px-4 py-2 bg-gray-100"
                    aria-readonly="true"
                  />
                  {errors.sku && (
                    <p id="sku-error" className="text-red-500 mt-1 text-sm">
                      {errors.sku.message}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="barcode"
                    className="block mb-2 text-gray-700 font-medium"
                  >
                    Barcode
                  </label>
                  <input
                    id="barcode"
                    type="text"
                    {...register("barcode")}
                    readOnly
                    className="w-full border border-gray-300 rounded-md px-4 py-2 bg-gray-100"
                    aria-readonly="true"
                  />
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block mb-2 text-gray-700 font-medium"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    {...register("description", {
                      required: "Description is required",
                    })}
                    placeholder="Enter description"
                    rows="4"
                    className={`w-full border ${
                      errors.description ? "border-red-500" : "border-gray-300"
                    } rounded-md px-4 py-2 transition focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    aria-invalid={errors.description ? "true" : "false"}
                    aria-describedby={
                      errors.description ? "description-error" : undefined
                    }
                  />
                  {errors.description && (
                    <p
                      id="description-error"
                      className="text-red-500 mt-1 text-sm"
                    >
                      {errors.description.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="discount"
                    className="block mb-2 text-gray-700 font-medium"
                  >
                    Discount Price
                  </label>
                  <input
                    id="discount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Enter discount price"
                    {...register("discount", {
                      min: { value: 0, message: "Discount cannot be negative" },
                    })}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    aria-invalid={errors.discount ? "true" : "false"}
                    aria-describedby={
                      errors.discount ? "discount-error" : undefined
                    }
                  />
                  {errors.discount && (
                    <p
                      id="discount-error"
                      className="text-red-500 mt-1 text-sm"
                    >
                      {errors.discount.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="status"
                    className="block mb-2 text-gray-700 font-medium"
                  >
                    Status
                  </label>
                  <select
                    id="status"
                    {...register("status", { required: "Status is required" })}
                    className={`w-full border ${
                      errors.status ? "border-red-500" : "border-gray-300"
                    } rounded-md px-4 py-2 transition focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    aria-invalid={errors.status ? "true" : "false"}
                    aria-describedby={
                      errors.status ? "status-error" : undefined
                    }
                  >
                    <option value="" disabled>
                      Select Status
                    </option>
                    <option value="1">In Stock</option>
                    <option value="0">Out Stock</option>
                  </select>
                  {errors.status && (
                    <p id="status-error" className="text-red-500 mt-1 text-sm">
                      {errors.status.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={loading || imageUploading}
                  className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-md shadow-md transition ${
                    loading || imageUploading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-indigo-500 hover:bg-indigo-600 text-white"
                  }`}
                >
                  {loading ? "Saving..." : "Update Product"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default EditProduct;
