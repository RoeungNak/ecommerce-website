import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Layout from "../../component_dashboard/Layout";
import { useForm } from "react-hook-form";
import { adminToken, apiUrl } from "../../../context/http";
import Swal from "sweetalert2";
import Loading from "../category/Loading";

const EditUser = () => {
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

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${apiUrl}/users/${params.id}`, {
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
            role: result.data.role,
          });
        } else {
          Swal.fire({
            title: "Error",
            text: result.message || "Failed to fetch user",
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

    fetchUser();
  }, [params.id, reset]);

  // Handle form submit
  const handleSubmitBtn = async (data) => {
    setSubmitLoading(true);

    try {
      const res = await fetch(`${apiUrl}/users/${params.id}`, {
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
          text: "User updated successfully!",
          icon: "success",
        }).then(() => navigate("/admin/roles"));
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
            <Link to="/admin/users" className="hover:text-red-600 transition">
              Users
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
            Edit User
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
                  placeholder="Enter user name"
                  {...register("name", { required: "Name is required" })}
                  className={`w-full border ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  } rounded-md px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition`}
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
                  placeholder="Enter user email"
                  {...register("email", { required: "Email is required" })}
                  className={`w-full border ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  } rounded-md px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition`}
                />
                {errors.email && (
                  <p className="text-red-500 mt-1 text-sm">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Role */}
              <div>
                <label
                  htmlFor="role"
                  className="block mb-2 text-gray-700 font-medium"
                >
                  Role
                </label>
                <select
                  id="role"
                  {...register("role", { required: "Role is required" })}
                  className={`w-full border ${
                    errors.role ? "border-red-500" : "border-gray-300"
                  } rounded-md px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none cursor-pointer transition`}
                >
                  <option value="Select role" disabled>
                    Select role
                  </option>
                  <option value="customer">customer</option>
                  <option value="admin">admin</option>
                </select>
                {errors.role && (
                  <p className="text-red-500 mt-1 text-sm">
                    {errors.role.message}
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
                  } text-white font-semibold rounded-md px-6 py-3 transition-colors shadow-md`}
                >
                  {submitLoading ? "Saving..." : "Update User"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default EditUser;
