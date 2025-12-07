import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { apiUrl } from "../../context/http";
import { AuthContext } from "../../context/Auth";
import Swal from "sweetalert2";

const SignUp = () => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { LoginDashbordUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.status === 200) {
        const userInfo = {
          token: result.token,
          id: result.id,
          name: result.name,
          email: result.email,
        };

        LoginDashbordUser(userInfo);
        navigate("/");
      } else if (response.status === 422 && result.errors) {
        // Laravel validation errors
        Object.keys(result.errors).forEach((field) => {
          setError(field, {
            type: "server",
            message: result.errors[field][0],
          });
        });
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
      <div className="border border-black-500 p-6 rounded w-full max-w-md">
        <h1 className="text-3xl font-bold text-blue-500 mb-2 text-center">
          {t("Create_Account")}
        </h1>
        <h6 className="text-center text-sm mb-9">{t("information")}</h6>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name field */}
          <div className="flex items-center border rounded px-3 py-2">
            <FaUser className="mr-2 text-gray-500" />
            <input
              {...register("name", {
                required: t("Name_required"),
                pattern: {
                  value: /^[a-zA-Z0-9_]+$/,
                  message: t("Invalid_username_format"),
                },
              })}
              type="text"
              placeholder={t("username")}
              className="w-full outline-none"
              autoComplete="username"
            />
          </div>
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name.message}</p>
          )}

          {/* Email field */}
          <div className="flex items-center border rounded px-3 py-2">
            <FaEnvelope className="mr-2 text-gray-500" />
            <input
              {...register("email", {
                required: t("Email_required"),
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: t("Invalid_email_format"),
                },
              })}
              type="email"
              placeholder={t("Email")}
              className="w-full outline-none"
              autoComplete="email"
            />
          </div>
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}

          {/* Password field */}
          <div className="flex items-center border rounded px-3 py-2 relative">
            <FaLock className="mr-2 text-gray-500" />
            <input
              {...register("password", {
                required: t("Password_required"),
                minLength: { value: 6, message: t("Password_min_length") },
              })}
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder={t("Password")}
              className="w-full outline-none pr-10"
            />
            <div
              className="absolute right-3 text-gray-500 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </div>
          </div>
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition disabled:opacity-50"
          >
            {loading ? t("Loading...") : t("Sign_Up")}
          </button>
        </form>

        {/* Link to Login */}
        <p className="mt-4 text-center text-sm">
          {t("linktologin")}{" "}
          <Link to="/account/login" className="text-blue-600 hover:underline">
            {t("herelogin")}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
