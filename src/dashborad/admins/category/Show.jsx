import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../../component_dashboard/Layout";
import Swal from "sweetalert2";
import {
  HomeIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { adminToken, apiUrl } from "../../../context/http";
import Loading from "./LoadingPage";

const Show = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/categoies`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${adminToken()}`,
        },
      });
      const result = await res.json();
      setCategories(result.data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      setCategories([]);
      Swal.fire({
        title: "Error",
        text: "Failed to fetch categories",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete category
  const deleteCategory = async (id, name) => {
    const result = await Swal.fire({
      title: `Are you sure?`,
      text: `You want to delete category: ${name}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      cancelButtonText: "Cancel",
      confirmButtonText: "Yes, delete it!",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      setDeletingId(id);
      try {
        const res = await fetch(`${apiUrl}/categoies/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${adminToken()}`,
          },
        });
        await res.json();

        // Remove deleted category from list
        setCategories((prev) => prev.filter((cat) => cat.id !== id));

        Swal.fire({
          title: "Deleted!",
          text: "Category deleted successfully.",
          icon: "success",
        });
      } catch (error) {
        console.error("Failed to delete category:", error);
        Swal.fire({
          title: "Error",
          text: "Failed to delete category",
          icon: "error",
        });
      } finally {
        setDeletingId(null);
      }
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <Layout>
      <div className="container mx-auto px-6 sm:px-8 py-2">
        <div className="w-full max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-10">
            <div className="flex gap-1 font-semibold items-center">
              <Link to="/admin/dashboard" className="flex items-center gap-1">
                <HomeIcon className="h-6 w-6 mb-2 mr-1" />
                <span className="hover:text-red-500">Dashboard</span>
              </Link>
              <span>/</span>
              <Link to="/admin/categories" className="flex items-center">
                <span className="hover:text-red-500 text-red-600">
                  Categories
                </span>
              </Link>
            </div>
            <Link
              to="/admin/categories/create"
              className="inline-flex items-center border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white focus:ring-4 focus:ring-blue-300 px-6 py-3 rounded-lg font-semibold transition duration-300 shadow-md"
            >
              Create
            </Link>
          </div>

          {/* Table */}
          <div className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto divide-y divide-gray-200 font-semibold">
                <thead className="bg-gray-200">
                  <tr>
                    {["NO.", "Name", "Status", "Action"].map((header) => (
                      <th
                        key={header}
                        className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide select-none"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-50">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="text-center py-10">
                        <Loading />
                      </td>
                    </tr>
                  ) : categories && categories.length > 0 ? (
                    categories.map((category, index) => (
                      <tr
                        key={category.id}
                        className="bg-gray-50 hover:bg-blue-50 transition-colors duration-200"
                      >
                        <td className="px-8 py-5 text-sm font-medium text-gray-900 whitespace-nowrap">
                          {index + 1}
                        </td>
                        <td className="px-8 py-5 text-sm text-gray-700 truncate max-w-xs">
                          {category.name}
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap">
                          <span
                            className={`inline-block px-4 py-1.5 rounded-md text-sm font-semibold select-none ${
                              category.status === 1
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {category.status === 1 ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-8 py-5 flex items-center">
                          <Link
                            to={`/admin/categories/edit/${category.id}`}
                            aria-label="Edit"
                            className="text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded transition-colors duration-200"
                          >
                            <PencilSquareIcon className="h-6 w-6" />
                          </Link>
                          <span className="mx-2 text-gray-400 select-none">
                            ||
                          </span>
                          <button
                            aria-label="Delete"
                            onClick={() =>
                              deleteCategory(category.id, category.name)
                            }
                            className="text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 rounded transition-colors duration-200 cursor-pointer"
                            disabled={deletingId === category.id}
                          >
                            <TrashIcon className="h-6 w-6" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-center px-8 py-10 text-gray-500 italic"
                      >
                        No categories found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Show;
