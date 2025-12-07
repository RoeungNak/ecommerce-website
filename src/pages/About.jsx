// src/components/About.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const About = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 text-gray-800">
      <h1 className="text-3xl font-bold text-center mb-6">
        {t("about")} Zora Store
      </h1>
      <p className="text-lg mb-10">
        {t("Welcome_to")}{" "}
        <span className="text-red-600 font-semibold">Zaro Store</span>
        {t("ds1")}
      </p>

      <div className="mb-10">
        <h2 className="text-xl font-semibold text-red-600 mb-2">
          {t("Our_Mission")}
        </h2>
        <p>{t("ds2")}</p>
      </div>

      <div className="mb-10">
        <h2 className="text-xl font-semibold text-red-600 mb-2">
          {t("Why_Choose")}
        </h2>
        <ul className="list-disc list-inside space-y-2">
          <li>{t("ds3")}</li>
          <li>{t("ds4")}</li>
          <li>{t("ds5")}</li>
          <li>{t("ds6")}</li>
        </ul>
      </div>

      <div className="mb-10">
        <h2 className="text-xl font-semibold text-red-600 mb-2">
          {t("OurVision")}
        </h2>
        <p>{t("ds7")}</p>
      </div>
      <div>
        <h2 className="text-center text-xl font-semibold text-red-600 mb-2">
          {t("join")}
        </h2>
        <p className="mb-7">{t("ds8")}</p>
      </div>
      <div className="mb-10 flex justify-center align-center">
        <button
          className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition duration-300 cursor-pointer"
          onClick={() => navigate("/products")}
        >
          {t("Start_Shopping")}
        </button>
      </div>
    </div>
  );
};

export default About;
