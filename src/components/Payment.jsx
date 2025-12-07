import React, { useState, useEffect, useMemo, useContext } from "react";
import { useTranslation } from "react-i18next";
import { CartContext } from "../context/CartContext";
import EmptyBox from "../assets/Empty_Box.mp4";
import QRcodeDollar from "../img/QRcodeDollar.png";
import QRcodeRiel from "../img/QRcodeRiel.png";
import { useForm } from "react-hook-form";
import { apiUrl, userToken } from "../context/http";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { AuthContext } from "../context/Auth";
import { IoRefresh } from "react-icons/io5";

const Payment = () => {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [order, setOrder] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [shipping, setShipping] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const RIEL_RATE = 4100;
  const { cartItem } = useContext(CartContext);
  const [paymentMethod, setPaymentMethod] = useState("KHQR");
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      location: "",
      phone_number: "",
      delivery: "J&T",
    },
  });

  const total = useMemo(
    () =>
      cartItem.reduce(
        (sum, item) => sum + item.price * (item.quantity || 1),
        0
      ),
    [cartItem]
  );

  const discount = useMemo(() => {
    return cartItem.reduce((sum, item) => {
      const discountPercent = item.discount > 0 ? item.discount : 0;
      return sum + item.price * (item.quantity || 1) * (discountPercent / 100);
    }, 0);
  }, [cartItem]);

  const discountedTotal = useMemo(() => {
    return total - discount;
  }, [total, discount]);

  useEffect(() => {
    if (total === 0 || total >= 50) setShipping(0);
    else setShipping(2.5);
  }, [total]);

  useEffect(() => {
    return () => {
      if (previewImage) URL.revokeObjectURL(previewImage);
    };
  }, [previewImage]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/") && file.size < 5 * 1024 * 1024) {
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
      setSelectedFile(file);
    } else {
      alert(t("Please upload a valid image under 5MB"));
    }
  };

  // ---------------------------
  // Send data + image to Telegram
  // ---------------------------
  const sendToTelegram = async (orderId, imageFile, userInfo) => {
    const formData = new FormData();

    const itemsText = cartItem
      .map(
        (item, index) =>
          `Item Product: ${index + 1}
Product: ${item.title}  
Qty: ${item.quantity} 
Size: (${item.size})
Original Price: $${(item.price * item.quantity).toFixed(2)}`
      )
      .join("\n\n");

    const message = `
--------------------------------------------------------
     Customer Order Information                     
--------------------------------------------------------
New Payment Order ID: ${orderId}  
Name: ${user.name}
Phone: ${userInfo.phone_number}
Location: ${userInfo.location}
Delivery: ${userInfo.delivery}
--------------------------------------------------------
Product Customer Item Purchase :
${itemsText}
--------------------------------------------------------
TOTAL PRICE PRODUCT:
Shipping: $${shipping.toFixed(2)}
Total USD: $${(discountedTotal + shipping).toFixed(2)}
Total Riel: ${((discountedTotal + shipping) * RIEL_RATE).toLocaleString()}៛
--------------------------------------------------------`;

    formData.append("message", message);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      const res = await fetch(`${apiUrl}/send-telegram`, {
        method: "POST",
        headers: { Authorization: `Bearer ${userToken()}` },
        body: formData,
      });
      const data = await res.json();
      console.log("Telegram response:", data);
    } catch (err) {
      console.error("Telegram send failed:", err);
    }
  };

  const uploadPayment = async (orderId) => {
    if (!selectedFile || !orderId) return null;

    const formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("order_id", orderId);

    try {
      const res = await fetch(`${apiUrl}/upload-payment`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken()}`,
        },
        body: formData,
      });
      const data = await res.json();
      console.log("Upload response:", data);

      if (res.ok) {
        return data.payment?.image_path || null;
      } else {
        console.error("Upload failed:", data);
        return null;
      }
    } catch (err) {
      console.error("Error uploading image:", err);
      return null;
    }
  };

  const saveOrder = async (formData, paymentStatus) => {
    const orderData = {
      ...formData,
      total_usd: Number(total.toFixed(2)),
      total_riel: Number(((discountedTotal + shipping) * RIEL_RATE).toFixed(2)),
      shipping: Number(shipping.toFixed(2)),
      discount: Number(discount.toFixed(2)),
      payment_status: paymentStatus,
      status: "pending",
      cart: cartItem.map((item) => ({
        product_id: item.id,
        name: item.title,
        qty: item.quantity,
        unit_price: item.price,
        price: item.price * item.quantity,
        size: item.size,
      })),
    };

    try {
      const res = await fetch(`${apiUrl}/save-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${userToken()}`,
        },
        body: JSON.stringify(orderData),
      });

      const result = await res.json();

      if (res.ok && result.id) {
        console.log("Order saved:", result);

        // Upload payment image
        if (selectedFile) {
          await uploadPayment(result.id);
          await sendToTelegram(result.id, selectedFile, formData);
        } else {
          await sendToTelegram(result.id, null, formData);
        }

        localStorage.removeItem("cart");
        navigate(`/order/confirmation/${result.id}`);
        Swal.fire("Success", "Product created successfully!", "success");
      } else {
        console.error("Save order failed:", result);
      }
    } catch (err) {
      console.error("Save order failed:", err);
    }
  };

  const handleFormSubmit = async (data) => {
    setIsLoading(true);
    try {
      if (paymentMethod === "cod") {
        await saveOrder(data, "unpaid");
      } else {
        await saveOrder(data, "paid");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (cartItem.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <video src={EmptyBox} autoPlay loop muted className="w-64 h-64" />
        <p className="text-gray-500 mt-4">{t("Your cart is empty")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row justify-center items-start p-6 gap-10 mb-40">
      {/* Left: QR Codes + Image Upload */}
      <div className="flex flex-col gap-6 max-w-md">
        <h2 className="text-xl font-semibold">{t("PaymentMethod")}</h2>
        <h3 className="text-lg font-semibold text-gray-700 text-center">
          Roeung Nak
        </h3>

        <div className="border p-4 rounded flex justify-center">
          <img
            src={QRcodeDollar}
            alt="QR Code USD"
            className="w-40 h-40 object-contain"
          />
        </div>
        <p className="text-center text-gray-500">{t("Or")}</p>
        <div className="border p-4 rounded flex justify-center">
          <img
            src={QRcodeRiel}
            alt="QR Code Riel"
            className="w-40 h-40 object-contain"
          />
        </div>

        <label className="mt-4 flex items-center gap-3 bg-gray-100 border border-gray-300 rounded-lg px-4 py-2 cursor-pointer hover:bg-gray-200 transition">
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5V19a2 2 0 002 2h14a2 2 0 002-2v-2.5M16 12l-4-4m0 0l-4 4m4-4v12"
            />
          </svg>
          <span className="text-sm text-gray-700">{t("upload_image")}</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>

        {previewImage && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">{t("Preview")}</p>
            <img
              src={previewImage}
              alt="Preview"
              className="w-32 h-32 object-cover border rounded"
            />
          </div>
        )}
      </div>

      {/* Center: Step Progress */}
      <div className="w-full max-w-md space-y-8 mt-25">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                  step >= n ? "bg-amber-600" : "bg-gray-300"
                }`}
              >
                {n}
              </div>
              {n < 3 && <div className="h-full w-1 bg-gray-300 flex-1"></div>}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">{t(`step${n}`)}</h3>
              <p className="text-gray-500">{t(`Step${n}`)}</p>
            </div>
          </div>
        ))}
        <p>
          <span className="border-b-2 text-red-500 font-bold">{t("Note")}</span>{" "}
          {t("Step4")}
        </p>
      </div>

      {/* Right: Form */}
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="space-y-4 mt-6 md:mt-21 max-w-md w-full"
      >
        <div>
          <label htmlFor="location" className="text-sm">
            {t("Location")}
          </label>
          <textarea
            {...register("location", {
              required: t("location_required"),
            })}
            id="location"
            className="w-full border rounded px-3 py-2"
            rows={2}
          />
          {errors.location && (
            <p className="text-red-500 text-sm mt-1">
              {errors.location.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="phone_number" className="text-sm">
            {t("Phone_Number")}
          </label>
          <input
            {...register("phone_number", {
              required: t("phone_number_required"),
              pattern: {
                value: /^[0-9]{9,12}$/,
                message: t("phone_number_invalid"),
              },
            })}
            id="phone_number"
            type="text"
            className="w-full border rounded px-3 py-2"
          />
          {errors.phone_number && (
            <p className="text-red-500 text-sm mt-1">
              {errors.phone_number.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="delivery" className="text-sm">
            {t("Delivery")}
          </label>
          <select
            {...register("delivery", {
              required: t("delivery_required"),
            })}
            id="delivery"
            className="w-full border rounded px-3 py-2"
          >
            <option value="Select Delivery" readOnly>
              Select Delivery
            </option>
            <option value="J&T">J&T</option>
            <option value="VET">VET</option>
            <option value="ZTO">ZTO</option>
            <option value="CE">CE</option>
          </select>
          {errors.delivery && (
            <p className="text-red-500 text-sm mt-1">
              {errors.delivery.message}
            </p>
          )}
        </div>

        <hr />
        <h1 className="text-xl font-semibold">{t("Order_information")}</h1>

        <div className="space-y-2">
          {cartItem.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center border p-2 rounded"
            >
              <div className="flex items-center gap-3">
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-16 h-16 object-cover rounded"
                />
                <div>
                  <h4 className="font-semibold">{item.title}</h4>
                  <p className="text-red-700 mb-1">
                    ${item.price} x {item.quantity}
                  </p>
                  <p>
                    {t("size")}: {item.size}
                  </p>
                </div>
              </div>
              <span className="font-semibold">
                ${(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <hr />

        <div className="flex justify-between font-bold text-black">
          <span>{t("original_price")}:</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-bold">{t("Shipping")}:</span>
          <span className="font-bold">
            {shipping === 0 ? t("Free") : `$${shipping.toFixed(2)}`}
          </span>
        </div>

        <div className="flex justify-between font-bold text-black">
          <span>{t("TotalUSD")}:</span>
          <span>${(discountedTotal + shipping).toFixed(2)}</span>
        </div>

        <div className="flex justify-between font-bold text-black">
          <span>{t("TotalRiel")}:</span>
          <span>
            {((discountedTotal + shipping) * RIEL_RATE).toLocaleString()} ៛
          </span>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 bg-amber-500 hover:bg-amber-700 disabled:bg-amber-300 disabled:cursor-not-allowed text-white rounded flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 h-5 w-5 text-white"
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
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>{t("Processing...")}</span>
            </>
          ) : (
            <span>{t("Payments")}</span>
          )}
        </button>
      </form>
    </div>
  );
};

export default Payment;
