// src/context/DataContext.js
import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useMemo,
} from "react";
import axios from "axios";

export const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const [data, setData] = useState([]);

  const fetchAllProducts = async () => {
    try {
      const response = await axios.get(
        "https://fakestoreapi.com/products?limit=20"
      );
      setData(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const getUniqueCategory = (items, property) => {
    return [...new Set(items.map((item) => item[property]))];
  };

  // Define getUniqueBrand similarly
  const getUniqueBrand = (items, property) => {
    return [...new Set(items.map((item) => item[property]))];
  };

  const categoryOnlyData = useMemo(
    () => getUniqueCategory(data, "category"),
    [data]
  );
  const brandOnlyData = useMemo(() => getUniqueBrand(data, "brand"), [data]);

  return (
    <DataContext.Provider
      value={{ data, fetchAllProducts, categoryOnlyData, brandOnlyData }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
