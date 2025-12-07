import React, { useEffect, useState, useMemo, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../pages/user_profile/LayoutProfile";
import Swal from "sweetalert2";
import { EyeIcon } from "@heroicons/react/24/outline";
import { apiUrl } from "../context/http";
import { AuthContext } from "../context/Auth";

const MyOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPayment, setFilterPayment] = useState("");

  // Calculate per-item discount
  const calculateItemDiscount = (item) =>
    (item.product?.discount || 0) > 0
      ? (item.product?.price || 0) *
        (item.qty || 0) *
        ((item.product?.discount || 0) / 100)
      : 0;

  // Total discount for the order
  const calculateTotalDiscount = (ord) =>
    ord.items?.reduce((acc, item) => acc + calculateItemDiscount(item), 0) || 0;

  // Calculate grand total including shipping and discount
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

  // Fetch orders
  const fetchOrders = async () => {
    if (!user?.token) return;
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append("start_date", startDate);
      if (endDate) queryParams.append("end_date", endDate);

      const url = `${apiUrl}/get-orders?${queryParams.toString()}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      if (res.status === 401) {
        setUser(null);
        navigate("/account/login");
        Swal.fire({
          title: "Session Expired",
          text: "Please log in again.",
          icon: "warning",
        });
        return;
      }

      const result = await res.json();
      const ordersData = result.data?.data || result.data || result || [];
      setOrders(ordersData);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.message || "Failed to fetch orders", "error");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user?.token, startDate, endDate]);

  // Format date
  const formatDate = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      : "-";

  // Status / Payment badge classes
  const getStatusClasses = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "cancelled":
      case "failed":
        return "bg-red-100 text-red-700";
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

  // Filtered orders
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

  return (
    <Layout>
      <div className="container mx-auto px-6 py-4">
        <div className="w-full max-w-7xl mx-auto">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            My Orders
          </h2>

          {/* Filters */}
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <form className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex flex-col">
                <label>Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border rounded-md px-3 py-2 mt-1"
                />
              </div>
              <div className="flex flex-col">
                <label>End Date</label>
                <input
                  type="date"
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
                  className="border mt-1 bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-md"
                >
                  Clear
                </button>
              </div>
            </form>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <div className="flex flex-col">
                <label>Delivery Status</label>
                <select
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
                <label>Payment Status</label>
                <select
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
              <table className="min-w-full table-auto divide-y divide-gray-200 font-semibold text-sm">
                <thead className="bg-gray-200">
                  <tr>
                    {[
                      "NO.",
                      "Customer",
                      "Email",
                      "Amount USD",
                      "Discount",
                      "Date",
                      "Payment",
                      "Status",
                      "Actions",
                    ].map((header) => (
                      <th
                        key={header}
                        className="px-8 py-4 text-left text-xs font-semibold text-gray-700 uppercase"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={10} className="text-center py-10">
                        Loading...
                      </td>
                    </tr>
                  ) : filteredOrders.length === 0 ? (
                    <tr>
                      <td
                        colSpan={10}
                        className="text-center py-10 text-gray-500 italic"
                      >
                        No orders found.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((ord, index) => (
                      <tr
                        key={ord.id}
                        className="bg-gray-50 hover:bg-blue-50 transition-colors"
                      >
                        <td className="px-8 py-5">{index + 1}</td>
                        <td className="px-8 py-5">{ord.customer_name}</td>
                        <td className="px-8 py-5">{ord.customer_email}</td>
                        {/* Amount USD with discount and shipping */}
                        <td className="px-8 py-5">
                          ${calculateGrandTotal(ord).toFixed(2)}
                        </td>
                        {/* Total Discount */}
                        <td className="px-8 py-5">
                          ${calculateTotalDiscount(ord).toFixed(2)}
                        </td>
                        <td className="px-8 py-5">
                          {formatDate(ord.created_at)}
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
                          <span
                            className={`px-3 py-1 rounded-md text-xs font-semibold ${getStatusClasses(
                              ord.status
                            )}`}
                          >
                            {ord.status || "Unknown"}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <Link
                            to={`/account/order-details/${ord.id}`}
                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            <EyeIcon className="h-5 w-5" /> View
                          </Link>
                        </td>
                      </tr>
                    ))
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

export default MyOrder;
