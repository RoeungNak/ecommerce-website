import React from "react";
import Carousel from "../components/Carousel";
import { useTranslation } from "react-i18next";
import ProductCart from "../components/ProductCart";

const Home = () => {
  const { t } = useTranslation();
  return (
    <div>
      <Carousel />
      <div className="mt-6 mb-7">
        <div className="text-center">
          <h1 className="font-bold text-3xl text-cyan-600 mb-5 ">
            {t("Welcom_to_ZORASTORE")}
          </h1>
          <p>{t("discription1")}</p>
          <p>{t("discription2")}</p>
        </div>
      </div>
      <ProductCart />
    </div>
  );
};

export default Home;
