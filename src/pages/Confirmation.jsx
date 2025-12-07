import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiUrl, userToken } from "../context/http";
import { useContext } from "react";
import { AuthContext } from "../context/Auth";
import { useTranslation } from "react-i18next";

const Confirmation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`${apiUrl}/order/${id}`, {
          headers: {
            Authorization: `Bearer ${userToken()}`,
          },
        });
        const data = await res.json();
        if (res.ok) {
          setOrder(data);
          console.log("Fetched order:", data);
        } else {
          console.error("Failed to fetch order:", data.message);
        }
      } catch (err) {
        console.error("Failed to fetch order:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin mb-4"></div>
          <p>Loading order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Order not found</p>
      </div>
    );
  }

  // Calculate totals
  const subtotal = order.cart.reduce(
    (acc, item) => acc + item.product?.price * item.qty,
    0
  );
  const totalDiscount = order.cart.reduce(
    (acc, item) =>
      acc +
      item.product?.price * item.qty * ((item.product?.discount || 0) / 100),
    0
  );
  const totalUSD = order.cart.reduce(
    (acc, item) =>
      acc +
      item.product?.price *
        item.qty *
        (1 - (item.product?.discount || 0) / 100) +
      (item.shipping || 0),
    0
  );
  const totalRiel = (totalUSD * 4100).toLocaleString();

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center py-10 px-4">
      <div className="w-full max-w-5xl bg-white shadow-lg rounded-lg p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-green-600">{t("ThankYou")}</h1>
          <p className="text-gray-500 mt-2">{t("orderSuccess")}</p>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 p-6 rounded-lg shadow-inner mb-6">
          <h3 className="text-xl font-semibold mb-4">{t("OrderSummary")}</h3>
          <hr className="border-gray-300 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p>
                <span className="font-semibold">{t("OrderID")}</span> #
                {order.id}
              </p>
              <p>
                <span className="font-semibold">{t("Date")}</span>{" "}
                {new Date(order.created_at).toLocaleDateString()}
              </p>
              <p>
                <span className="font-semibold">Status:</span>{" "}
                <span
                  className={`inline-block px-2 py-1 text-sm rounded-full ${
                    order.status === "pending"
                      ? "text-green-700 bg-green-100"
                      : "text-gray-700 bg-gray-200"
                  }`}
                >
                  {order.status}
                </span>
              </p>
              <p>
                <span className="font-semibold">Payment Method:</span> KHQR
              </p>
            </div>

            <div className="space-y-2">
              <p>
                <span className="font-semibold">Customer:</span> {user.name}
              </p>
              <p>
                <span className="font-semibold">Address:</span> {order.location}
              </p>
              <p>
                <span className="font-semibold">Contact:</span>{" "}
                {order.phone_number}
              </p>
              <p>
                <span className="font-semibold">Delivery:</span>{" "}
                {order.delivery}
              </p>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 divide-y divide-gray-200 text-sm sm:text-base">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">
                  NO.
                </th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">
                  Image
                </th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">
                  Product
                </th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">
                  Original Price
                </th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">
                  Qty
                </th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">
                  Shipping
                </th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">
                  Discount
                </th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {order.cart.map((item, index) => (
                <tr key={item.product_id}>
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  </td>
                  <td className="px-4 py-2">{item.name}</td>
                  <td className="px-4 py-2">
                    ${item.product?.price.toFixed(2)}
                  </td>
                  <td className="px-4 py-2">{item.qty}</td>
                  <td className="px-4 py-2">
                    ${(order.shipping / order.cart.length).toFixed(2)}
                  </td>
                  <td className="px-4 py-2">
                    $
                    {(
                      item.product?.price *
                      item.qty *
                      ((item.product?.discount || 0) / 100)
                    ).toFixed(2)}
                  </td>
                  <td className="px-4 py-2">
                    $
                    {(
                      item.product?.price *
                        item.qty *
                        (1 - (item.product?.discount || 0) / 100) +
                      (item.shipping || 0)
                    ).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Total Summary */}
          <div className="mt-4 flex flex-col md:flex-col justify-end items-end gap-1 font-bold">
            <p className="text-sm text-gray-500">
              Shipping: ${order.shipping.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500">
              Discount: ${""}
              {totalDiscount.toFixed(2)}
            </p>
            <p className="text-sm text-bold font-semibold">
              Subtotal: ${subtotal.toFixed(2)}
            </p>
            <p className="text-sm text-bold font-semibold">
              Total USD: ${totalUSD.toFixed(2)}
            </p>
            <p className="text-sm text-bold font-semibold">
              Total Riel: {totalRiel} ៛
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-4 mt-6 justify-center">
            <button
              onClick={() => navigate(`/account/orders`)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Order Details
            </button>
            <button
              onClick={() => navigate("/products")}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Confirmation;
