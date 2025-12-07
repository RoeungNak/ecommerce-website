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
import Loading from "../category/Loading";

const ShowBrand = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Fetch brands
  const fetchBrands = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/brands`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${adminToken()}`,
        },
      });
      const result = await res.json();
      setBrands(result.data);
    } catch (error) {
      console.error("Failed to fetch brands:", error);
      setBrands([]);
      Swal.fire({
        title: "Error",
        text: "Failed to fetch brands",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete brand
  const deleteBrand = async (id, name) => {
    const result = await Swal.fire({
      title: `Are you sure?`,
      text: `You want to delete brand: ${name}`,
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
        const res = await fetch(`${apiUrl}/brands/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${adminToken()}`,
          },
        });
        await res.json();

        // Remove deleted brand from list
        setBrands((prev) => prev.filter((brand) => brand.id !== id));

        Swal.fire({
          title: "Deleted!",
          text: "Brand deleted successfully.",
          icon: "success",
        });
      } catch (error) {
        console.error("Failed to delete brand:", error);
        Swal.fire({
          title: "Error",
          text: "Failed to delete brand",
          icon: "error",
        });
      } finally {
        setDeletingId(null);
      }
    }
  };

  useEffect(() => {
    fetchBrands();
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
              <Link to="/admin/brands" className="flex items-center">
                <span className="hover:text-red-500 text-red-600">Brand</span>
              </Link>
            </div>
            <Link
              to="/admin/brands/create"
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
                  ) : brands && brands.length > 0 ? (
                    brands.map((brand, index) => (
                      <tr
                        key={brand.id}
                        className="bg-gray-50 hover:bg-blue-50 transition-colors duration-200"
                      >
                        <td className="px-8 py-5 text-sm font-medium text-gray-900 whitespace-nowrap">
                          {index + 1}
                        </td>
                        <td className="px-8 py-5 text-sm text-gray-700 truncate max-w-xs">
                          {brand.name}
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap">
                          <span
                            className={`inline-block px-4 py-1.5 rounded-md text-sm font-semibold select-none ${
                              brand.status === 1
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {brand.status === 1 ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-8 py-6 flex items-center">
                          <Link
                            to={`/admin/brands/edit/${brand.id}`}
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
                            onClick={() => deleteBrand(brand.id, brand.name)}
                            className="text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 rounded transition-colors duration-200 cursor-pointer"
                            disabled={deletingId === brand.id}
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
                        No brands found.
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

export default ShowBrand;
