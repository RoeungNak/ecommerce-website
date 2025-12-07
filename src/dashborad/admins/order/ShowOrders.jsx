import React, { useEffect, useState, useMemo, useContext } from "react";
import { Link } from "react-router-dom";
import Layout from "../../component_dashboard/Layout";
import Swal from "sweetalert2";
import { HomeIcon, EyeIcon } from "@heroicons/react/24/outline";
import { adminToken, apiUrl } from "../../../context/http";
import { AuthContext } from "../../../context/Auth";

const ShowOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPayment, setFilterPayment] = useState("");

  // -------------------------------
  // Calculations
  // -------------------------------

  const calculateGrandTotal = (ord) => {
    // Sum of all items after discount
    const subtotal =
      ord.items?.reduce(
        (acc, item) =>
          acc +
          item.product?.price *
            item.qty *
            (1 - (item.product?.discount || 0) / 100),
        0
      ) || 0;

    // Shipping cost
    const shipping = Number(ord.shipping) || 0;

    // Final total = subtotal + shipping
    return subtotal + shipping;
  };

  // -------------------------------
  // Fetch Orders
  // -------------------------------
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append("start_date", startDate);
      if (endDate) queryParams.append("end_date", endDate);

      const url = `${apiUrl}/orders?${queryParams.toString()}`;
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${adminToken()}`,
        },
      });

      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      const result = await res.json();
      const ordersData = result.data?.data || result.data || result || [];
      setOrders(ordersData);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      setOrders([]);
      Swal.fire({
        title: "Error",
        text: `Failed to fetch orders: ${error.message}`,
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // -------------------------------
  // Filtered Orders
  // -------------------------------
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      const orderDate = new Date(ord.created_at);
      const start = startDate ? new Date(startDate + "T00:00:00") : null;
      const end = endDate ? new Date(endDate + "T23:59:59") : null;
      if (end) end.setHours(23, 59, 59, 999);

      const matchesDate =
        (!start || orderDate >= start) && (!end || orderDate <= end);

      const matchesStatus = filterStatus
        ? ord.status?.toLowerCase() === filterStatus.toLowerCase()
        : true;

      const matchesPayment = filterPayment
        ? ord.payment_status?.toLowerCase() === filterPayment.toLowerCase()
        : true;

      return matchesDate && matchesStatus && matchesPayment;
    });
  }, [orders, startDate, endDate, filterStatus, filterPayment]);

  // -------------------------------
  // Helpers
  // -------------------------------
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusClasses = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "cancelled":
      case "failed":
        return "bg-red-100 text-red-700";
      case "shipped":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPaymentClasses = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-700";
      case "unpaid":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // -------------------------------
  // Render
  // -------------------------------
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
              <Link to="/admin/orders" className="flex items-center">
                <span className="hover:text-red-500 text-red-600">Orders</span>
              </Link>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            {/* Date Filters */}
            <form className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex flex-col">
                <label htmlFor="startDate" className="text-sm font-semibold">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border rounded-md px-3 py-2 mt-1"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="endDate" className="text-sm font-semibold">
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border rounded-md px-3 py-2 mt-1"
                />
              </div>
              <div className="flex flex-col">
                <label className="invisible">Clear</label>
                <button
                  type="button"
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                    setFilterStatus("");
                    setFilterPayment("");
                  }}
                  className="border mt-1 bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-md text-sm font-semibold cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </form>

            {/* Dropdown Filters */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <div className="flex flex-col">
                <label htmlFor="orderStatus" className="text-sm font-semibold">
                  Delivery Status
                </label>
                <select
                  id="orderStatus"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border rounded-md px-3 py-2 mt-1"
                >
                  <option value="">All</option>
                  <option value="pending">Pending</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label
                  htmlFor="paymentStatus"
                  className="text-sm font-semibold"
                >
                  Payment Status
                </label>
                <select
                  id="paymentStatus"
                  value={filterPayment}
                  onChange={(e) => setFilterPayment(e.target.value)}
                  className="border rounded-md px-3 py-2 mt-1"
                >
                  <option value="">All</option>
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                </select>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto divide-y divide-gray-200 font-semibold">
                <thead className="bg-gray-200">
                  <tr>
                    {[
                      "NO.",
                      "Customer",
                      "Email",
                      "Amount USD",
                      "Date",
                      "Delivery",
                      "Payment",
                      "Actions",
                    ].map((header) => (
                      <th
                        key={header}
                        className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-50">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="text-center py-10">
                        Loading...
                      </td>
                    </tr>
                  ) : filteredOrders.length > 0 ? (
                    filteredOrders.map((ord, index) => (
                      <tr
                        key={ord.id}
                        className="hover:bg-blue-50 transition-colors"
                      >
                        <td className="px-8 py-5">{index + 1}</td>
                        <td className="px-8 py-5">
                          {ord.customer_name || "N/A"}
                        </td>
                        <td className="px-8 py-5">
                          {ord.customer_email || "N/A"}
                        </td>
                        <td className="px-8 py-5">
                          ${calculateGrandTotal(ord).toFixed(2)}
                        </td>
                        <td className="px-8 py-5">
                          {formatDate(ord.created_at)}
                        </td>
                        <td className="px-8 py-5">
                          <span
                            className={`px-3 py-1 rounded-md text-xs font-semibold ${getStatusClasses(
                              ord.status
                            )}`}
                          >
                            {ord.status || "Unknown"}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <span
                            className={`px-3 py-1 rounded-md text-xs font-semibold ${getPaymentClasses(
                              ord.payment_status
                            )}`}
                          >
                            {ord.payment_status || "Unknown"}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <Link
                            to={`/admin/orders/${ord.id}`}
                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            <EyeIcon className="h-5 w-5" /> View
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={8}
                        className="text-center py-10 text-gray-500 italic"
                      >
                        No orders found.
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

export default ShowOrders;
