import React from "react";
import { useTranslation } from "react-i18next";

const Contact = () => {
  const { t } = useTranslation();
  return (
    <div>
      <div className="min-h-screen bg-gradient-to-r from-[#2b2d42] to-[#3b3f58] text-white flex items-center justify-center px-6">
        <div className="bg-[#1e1f2e] rounded-xl shadow-lg p-8 md:p-12 w-full max-w-4xl flex flex-col md:flex-row gap-10">
          {/* Left: Contact Info */}
          <div className="md:w-1/2 space-y-6">
            <h2 className="text-3xl font-bold text-white">
              {t("Get_in_Touch_with")}{" "}
              <span className="text-[#ff3c57]">ZORA</span>
            </h2>
            <p className="text-gray-300">{t("text")}</p>
            <div className="space-y-3 text-sm text-gray-300">
              <p>
                📍 <strong>{t("Address")}</strong> Phnom Pehn
              </p>
              <p>
                📧 <strong>{t("Email")}</strong> zorastore@gmail.com
              </p>
              <p>
                📞 <strong>{t("Phone")}</strong> 099 888 777
              </p>
            </div>
          </div>

          {/* Right: Form */}
          <form className="md:w-1/2 space-y-6">
            <div>
              <label className="block mb-1 text-sm">{t("YourName")}</label>
              <input
                type="text"
                placeholder=""
                className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-600 focus:outline-none focus:border-pink-500"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm">{t("Email_Address")}</label>
              <input
                type="email"
                placeholder=""
                className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-600 focus:outline-none focus:border-pink-500"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm">{t("YourMessage")}</label>
              <textarea
                rows="4"
                placeholder={t("Message")}
                className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-600 focus:outline-none focus:border-pink-500"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-pink-600 to-purple-600 py-2 rounded text-white font-semibold hover:opacity-90 transition cursor-pointer"
            >
              {t("sendMessage")} ✉️
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
