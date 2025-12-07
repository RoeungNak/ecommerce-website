import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Breadcrums = ({ title }) => {
  const navigate = useNavigate();

  // Capitalize the first letter of each word
  const formatTitle = (str) =>
    str.replace(/\b\w/g, (char) => char.toUpperCase());
  const { t } = useTranslation();
  return (
    <nav className="max-w-7xl mx-auto px-4 py-6" aria-label="breadcrumb">
      <ol className="flex flex-wrap text-sm text-gray-600 font-medium">
        <li className="mr-2 flex items-center">
          <span
            onClick={() => navigate("/")}
            className="cursor-pointer hover:text-red-600 transition"
          >
            {t("Home")}
          </span>
          <span className="mx-2 text-gray-400">/</span>
        </li>

        <li className="mr-2 flex items-center">
          <span
            onClick={() => navigate("/products")}
            className="cursor-pointer hover:text-red-600 transition"
          >
            {t("Product")}
          </span>
          <span className="mx-2 text-gray-400">/</span>
        </li>

        <li className="text-gray-800 capitalize">{formatTitle(title)}</li>
      </ol>
    </nav>
  );
};

export default Breadcrums;
