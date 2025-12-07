import React from "react";
import { FaFilter } from "react-icons/fa";
import { useTranslation } from "react-i18next";

const MobileFilter = ({
  openFilter,
  setOpenFilter,
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  categoryOnlyData,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <div className="bg-gray-100 flex justify-between items-center md:hidden px-4 p-2 mt-5">
        <h1 className="font-semibold text-xl">{t("Filters")}</h1>
        <button
          onClick={() => setOpenFilter(!openFilter)}
          aria-label={t("Toggle Filters")}
          className="text-gray-800"
        >
          <FaFilter />
        </button>
      </div>

      {openFilter && (
        <div className="bg-gray-100 p-2 md:hidden">
          {/* Search Input */}
          <input
            type="text"
            aria-label={t("Search")}
            placeholder={t("searchPlaceholder")}
            className="bg-white p-2 rounded-md border border-gray-300 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Category Filter */}
          <div className="mt-4">
            <h2 className="font-semibold text-xl text-gray-800 mb-2">
              {t("Category")}
            </h2>
            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
              {/* All Option */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="category"
                  value="All"
                  checked={selectedCategory === "All"}
                  onChange={() => setSelectedCategory("All")}
                  tabIndex="0"
                />
                <span className="uppercase text-sm text-gray-700">
                  {t("All")}
                </span>
              </label>

              {/* Dynamic Categories */}
              {categoryOnlyData?.map((curElem, index) => (
                <label
                  key={index}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="category"
                    value={curElem}
                    checked={selectedCategory === curElem}
                    onChange={() => setSelectedCategory(curElem)}
                  />
                  <span className="uppercase text-sm text-gray-700">
                    {curElem}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileFilter;
