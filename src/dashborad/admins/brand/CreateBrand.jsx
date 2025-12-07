import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../../component_dashboard/Layout";
import { useForm } from "react-hook-form";
import { adminToken, apiUrl } from "../../../context/http";
import Swal from "sweetalert2";

const CreateBrand = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmitBtn = async (data) => {
    setLoading(true);
    setMessage("");

    try {
      // Ensure status is a number
      data.status = Number(data.status);

      const res = await fetch(`${apiUrl}/brands`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${adminToken()}`,
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        reset();
        Swal.fire({
          title: "Success",
          text: "Brand created successfully!",
          icon: "success",
        }).then(() => {
          navigate("/admin/brands");
        });
      } else {
        Swal.fire({
          title: "Error",
          text: result.message || "Something went wrong",
          icon: "error",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.message,
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-0 sm:items-center mb-8">
          <div className="flex flex-wrap gap-2 font-semibold items-center text-gray-700 text-lg">
            <Link to="/admin/brands" className="hover:text-red-600 transition">
              Brand
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-red-500 hover:text-red-600 transition">
              Create
            </span>
          </div>
        </div>

        {/* Form Card */}
        <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-6 sm:p-8 border border-gray-100">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">
            Create Brand
          </h2>

          {message && (
            <p className="mb-4 text-sm font-medium text-center text-gray-700">
              {message}
            </p>
          )}

          <form onSubmit={handleSubmit(handleSubmitBtn)} className="space-y-6">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block mb-2 text-gray-700 font-medium"
              >
                Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Enter brand name"
                {...register("name", { required: "Name is required" })}
                className={`w-full border ${
                  errors.name ? "border-red-500" : "border-gray-300"
                } rounded-md px-4 py-2 sm:py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition`}
              />
              {errors.name && (
                <p className="text-red-500 mt-1 text-sm">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Status */}
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
                } rounded-md px-4 py-2 sm:py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none cursor-pointer transition`}
                defaultValue=""
              >
                <option value="" disabled>
                  Select status
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

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className={`w-full sm:w-auto ${
                  loading ? "bg-gray-400" : "bg-indigo-500 hover:bg-indigo-600"
                } text-white font-semibold rounded-md px-6 py-3 transition-colors shadow-md cursor-pointer`}
              >
                {loading ? "Saving..." : "Save Brand"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default CreateBrand;
