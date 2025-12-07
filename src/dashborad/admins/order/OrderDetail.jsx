import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Layout from "../../component_dashboard/Layout";
import { apiUrl, adminToken } from "../../../context/http";

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("Pending");
  const [paymentStatus, setPaymentStatus] = useState("Pending");
  const navigate = useNavigate();
  const EXCHANGE_RATE = 4100;
  // Calculations
  const calculateItemDiscount = (item) => {
    const price = item.product?.price || 0;
    const qty = item.qty || 1;
    const discount = item.product?.discount || 0;
    return parseFloat((price * qty * (discount / 100)).toFixed(2));
  };

  const calculateItemTotal = (item) => {
    const price = item.product?.price || item.unit_price || 0;
    const qty = item.qty || 1;
    const discount = item.product?.discount || 0;
    const shipping = item.shipping || 0;
    const totalAfterDiscount = price * qty * (1 - discount / 100) + shipping;
    return parseFloat(totalAfterDiscount.toFixed(2));
  };

  const calculateSubtotal = () =>
    order.items?.reduce(
      (acc, item) =>
        acc + (item.product?.price || item.unit_price || 0) * (item.qty || 1),
      0
    ) || 0;

  const calculateTotalDiscount = () =>
    order.items?.reduce((acc, item) => acc + calculateItemDiscount(item), 0) ||
    0;

  const calculateTotalShipping = () =>
    order.items?.reduce((acc, item) => acc + (item.shipping || 0), 0) || 0;

  const calculateGrandTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateTotalDiscount();
    const shipping = calculateTotalShipping() || Number(order.shipping) || 0;
    return parseFloat((subtotal - discount + shipping).toFixed(2));
  };

  // ======================
  // Helpers
  // ======================
  const formatDate = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "-";

  const formatUSD = (amount) => `$${(amount || 0).toFixed(2)}`;

  const getStatusClasses = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-500 text-white";
      case "pending":
        return "bg-yellow-500 text-white";
      case "cancelled":
      case "failed":
        return "bg-red-500 text-white";
      case "shipped":
        return "bg-blue-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  // ======================
  // Fetch order
  // ======================
  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/orders/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${adminToken()}`,
        },
      });
      const result = await res.json();
      if (result.status === 200) {
        setOrder(result.data);
        setStatus(result.data.status || "Pending");
        setPaymentStatus(result.data.payment_status || "Pending");
      } else {
        Swal.fire("Error", result.message || "Failed to fetch order", "error");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      Swal.fire("Error", "Failed to fetch order", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  // ======================
  // Update order status
  // ======================
  const handleUpdate = async () => {
    try {
      const res = await fetch(`${apiUrl}/orders/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${adminToken()}`,
        },
        body: JSON.stringify({ status, payment_status: paymentStatus }),
      });

      const result = await res.json();

      if (result.status === 200) {
        setOrder(result.data);
        Swal.fire("Success", "Order updated successfully", "success");
        navigate("/admin/orders");
      } else if (result.status === 422) {
        const errors = Object.values(result.errors).flat().join("\n");
        Swal.fire("Validation Error", errors, "error");
      } else {
        Swal.fire("Error", result.message || "Failed to update order", "error");
      }
    } catch (error) {
      console.error("Update error:", error);
      Swal.fire("Error", "Failed to update order", "error");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center py-10">
        <div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin mt-80 mb-150"></div>
      </div>
    );

  if (!order) return <div className="text-center py-10">Order not found</div>;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-lg">
        {/* Breadcrumbs */}
        <div className="flex gap-1 font-semibold items-center mb-6">
          <Link to="/admin/dashboard" className="hover:text-red-500">
            Dashboard
          </Link>
          <span>/</span>
          <Link to="/admin/orders" className="hover:text-red-500">
            Orders
          </Link>
          <span>/</span>
          <span className="text-red-600">Detail #{order.id}</span>
        </div>

        {/* Order Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-semibold">Order: #{order.id}</h2>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusClasses(
                order.status
              )}`}
            >
              {order.status}
            </span>
          </div>
          <div>
            <p>Date: {formatDate(order.created_at)}</p>
            <p>
              Payment Status:{" "}
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusClasses(
                  order.payment_status
                )}`}
              >
                {order.payment_status}
              </span>
            </p>
          </div>
        </div>

        {/* Customer Info */}
        <div className="mb-6">
          <h3 className="font-semibold">Customer Info</h3>
          <p>Name: {order.customer_name || "-"}</p>
          <p>Email: {order.customer_email || "-"}</p>
          <p>Location: {order.location || "-"}</p>
          <p>Phone: {order.phone_number || "-"}</p>
          <p>Payment Method: KHQR</p>
        </div>

        {/* Items Table */}
        <div className="mb-6 overflow-x-auto">
          <h3 className="font-semibold mb-2">Items</h3>
          <table className="w-full border border-gray-200 divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Product</th>
                <th className="px-4 py-2 text-center">Qty</th>
                <th className="px-4 py-2 text-center">Original Price</th>
                <th className="px-4 py-2 text-center">Shipping</th>
                <th className="px-4 py-2 text-center">Discount</th>
                <th className="px-4 py-2 text-center">Total Price</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.length > 0 ? (
                order.items.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-4 py-2 flex items-center gap-3">
                      <img
                        src={item.image_url || "/placeholder.png"}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div>
                        <p>{item.name || "N/A"}</p>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {item.size || "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-center">{item.qty || 0}</td>
                    <td className="px-4 py-2 text-center">
                      {formatUSD(item.product?.price || item.unit_price || 0)}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {formatUSD(item.shipping || 0)}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {formatUSD(calculateItemDiscount(item))}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {formatUSD(calculateItemTotal(item))}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-2">
                    No items found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="text-right mb-6">
          <p>Subtotal: {formatUSD(calculateSubtotal())}</p>
          <p>Shipping: {formatUSD(calculateTotalShipping())}</p>
          <p>Discount: {formatUSD(calculateTotalDiscount())}</p>
          <p className="font-semibold">
            Grand Total USD: {formatUSD(calculateGrandTotal())}
          </p>
          <p className="font-semibold">
            Grand Total KHR:{" "}
            {(calculateGrandTotal() * EXCHANGE_RATE).toLocaleString()} ៛
          </p>
        </div>

        {/* Update Status */}
        <div className="flex gap-4 items-end">
          <div>
            <label className="block font-semibold">Status</label>
            <select
              className="border rounded px-3 py-2"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="Pending">Pending</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold">Payment Status</label>
            <select
              className="border rounded px-3 py-2"
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
            >
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
            </select>
          </div>
          <button
            onClick={handleUpdate}
            className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600"
          >
            Update
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default OrderDetail;
