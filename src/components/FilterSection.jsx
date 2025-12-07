import React from "react";
import { useTranslation } from "react-i18next";

const FilterSection = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedBrand,
  setSelectedBrand,
  categories,
  brands,
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-gray-100 mt-6 lg:mt-10 rounded-md p-4 h-full lg:h-auto overflow-y-auto">
      {/* Search Box */}
      <div className="mb-6">
        <h2 className="font-semibold text-xl text-gray-800 mb-2">
          {t("Search")}
        </h2>
        <input
          type="text"
          aria-label={t("Search")}
          placeholder={t("searchPlaceholder")}
          className="bg-white p-2 rounded-md border border-gray-300 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Category Filter */}
      <div>
        <h2
          className="font-semibold text-xl text-gray-800 mb-2"
          id="category-filter"
        >
          {t("Category")}
        </h2>
        <div
          className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1"
          role="radiogroup"
          aria-labelledby="category-filter"
        >
          {/* All Option */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="category"
              value="All"
              checked={selectedCategory === "All"}
              onChange={() => setSelectedCategory("All")}
            />
            <span className="uppercase text-sm text-gray-700">{t("All")}</span>
          </label>

          {/* Dynamic Categories */}
          {categories.map((curElem, index) => (
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
              <span className="uppercase text-sm text-gray-700">{curElem}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterSection;
