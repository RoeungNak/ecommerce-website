import { useNavigate, Link } from "react-router-dom";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import React, { useState, useContext } from "react";
import { useForm } from "react-hook-form";
import { apiUrl } from "../../context/http";
import { AuthContext } from "../../context/Auth";
import Swal from "sweetalert2";

const Login = () => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { LoginDashbordUser } = useContext(AuthContext);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.status === 200) {
        const userInfo = {
          token: result.token,
          id: result.id,
          name: result.name,
          email: result.email,
          avatar: result.avatar,
        };

        LoginDashbordUser(userInfo);

        navigate("/");
      } else {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "error",
          title: result.message || t("Invalid_credentials"),
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
      }
    } catch (error) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: t("Something_went_wrong"),
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="border border-gray-500 p-6 rounded w-full max-w-md">
        <h1 className="text-3xl font-bold text-blue-500 mb-2 text-center">
          {t("ZORA_LOGIN")}
        </h1>
        <h6 className="text-center text-sm mb-9">{t("information")}</h6>
        {errors.email || errors.password ? (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">
            {errors.email?.message || errors.password?.message}
          </div>
        ) : null}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email field */}
          <div className="flex items-center border rounded px-3 py-2">
            <FaEnvelope className="mr-2 text-gray-500" aria-hidden="true" />
            <input
              type="email"
              placeholder={t("Email")}
              className="w-full outline-none"
              {...register("email", {
                required: t("Email_required"),
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: t("Invalid_email_format"),
                },
              })}
              aria-invalid={errors.email ? "true" : "false"}
            />
          </div>

          {/* Password field */}
          <div className="flex items-center border rounded px-3 py-2 relative">
            <FaLock className="mr-2 text-gray-500" aria-hidden="true" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder={t("Password")}
              className="w-full outline-none pr-10"
              {...register("password", {
                required: t("Password_required"),
                minLength: {
                  value: 6,
                  message: t("Password_min_length"),
                },
              })}
              aria-invalid={errors.password ? "true" : "false"}
            />
            <button
              type="button"
              className="absolute right-3 text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={
                showPassword ? t("Hide_password") : t("Show_password")
              }
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* Remember me */}
          <div className="flex items-center space-x-2 mt-7 mb-3">
            <input
              type="checkbox"
              id="keepMe"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="keepMe" className="text-sm text-gray-700">
              {t("Remember_me")}
            </label>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? t("Logging_in") : t("Login")}
          </button>
        </form>

        {/* Link to Register */}
        <p className="mt-4 text-center text-sm">
          {t("noAccount")}{" "}
          <Link
            to="/account/register"
            className="text-blue-600 hover:underline"
          >
            {t("SignIn")}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
