import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Layout from "../../component_dashboard/Layout";
import { useForm } from "react-hook-form";
import { adminToken, apiUrl } from "../../../context/http";
import Swal from "sweetalert2";
import Loading from "../category/Loading";

const EditSupplier = () => {
  const params = useParams();
  const navigate = useNavigate();

  // Loading states
  const [fetchLoading, setFetchLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  // Fetch supplier data
  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        const res = await fetch(`${apiUrl}/suppliers/${params.id}`, {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${adminToken()}`,
          },
        });
        const result = await res.json();
        if (res.ok) {
          reset({
            name: result.data.name,
            email: result.data.email,
            phone: result.data.phone,
            address: result.data.address,
            status: result.data.status,
          });
        } else {
          Swal.fire({
            title: "Error",
            text: result.message || "Failed to fetch supplier",
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
        setFetchLoading(false);
      }
    };

    fetchSupplier();
  }, [params.id, reset]);

  // Handle form submit
  const handleSubmitBtn = async (data) => {
    setSubmitLoading(true);

    try {
      data.status = Number(data.status);

      const res = await fetch(`${apiUrl}/suppliers/${params.id}`, {
        method: "PUT",
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
          text: "Supplier updated successfully!",
          icon: "success",
        }).then(() => navigate("/admin/suppliers"));
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
      setSubmitLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-0 sm:items-center mb-8">
          <div className="flex flex-wrap gap-2 font-semibold items-center text-gray-700 text-lg">
            <Link
              to="/admin/suppliers"
              className="hover:text-red-600 transition"
            >
              Suppliers
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-red-500 hover:text-red-600 transition">
              Edit
            </span>
          </div>
        </div>

        {/* Form Card */}
        <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-6 sm:p-8 border border-gray-100">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">
            Edit Supplier
          </h2>

          {/* Show loader while fetching data */}
          {fetchLoading ? (
            <div className="flex justify-center py-10">
              <Loading />
            </div>
          ) : (
            <form
              onSubmit={handleSubmit(handleSubmitBtn)}
              className="space-y-6"
            >
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
                  placeholder="Enter supplier name"
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

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-gray-700 font-medium"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter supplier email"
                  {...register("email", { required: "Email is required" })}
                  className={`w-full border ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  } rounded-md px-4 py-2 sm:py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition`}
                />
                {errors.email && (
                  <p className="text-red-500 mt-1 text-sm">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="block mb-2 text-gray-700 font-medium"
                >
                  Phone
                </label>
                <input
                  id="phone"
                  type="text"
                  placeholder="Enter supplier phone"
                  {...register("phone", { required: "Phone is required" })}
                  className={`w-full border ${
                    errors.phone ? "border-red-500" : "border-gray-300"
                  } rounded-md px-4 py-2 sm:py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition`}
                />
                {errors.phone && (
                  <p className="text-red-500 mt-1 text-sm">
                    {errors.phone.message}
                  </p>
                )}
              </div>
              {/* Address */}
              <div>
                <label
                  htmlFor="address"
                  className="block mb-2 text-gray-700 font-medium"
                >
                  Address
                </label>
                <textarea
                  id="address"
                  placeholder="Enter supplier address"
                  {...register("address", { required: "Address is required" })}
                  className={`w-full border ${
                    errors.address ? "border-red-500" : "border-gray-300"
                  } rounded-md px-4 py-2 sm:py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition`}
                  rows={4}
                ></textarea>
                {errors.address && (
                  <p className="text-red-500 mt-1 text-sm">
                    {errors.address.message}
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
                  disabled={submitLoading}
                  className={`w-full sm:w-auto ${
                    submitLoading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-indigo-500 hover:bg-indigo-600"
                  } text-white font-semibold rounded-md px-6 py-3 transition-colors shadow-md flex items-center justify-center gap-2`}
                >
                  {submitLoading && (
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      ></path>
                    </svg>
                  )}
                  {submitLoading ? "Saving..." : "Update Supplier"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default EditSupplier;
