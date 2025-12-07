import {
  FaUsers,
  FaShoppingCart,
  FaDollarSign,
  FaBoxOpen,
  FaUserTie,
  FaUserShield,
  FaFileAlt,
  FaTruck,
  FaList,
} from "react-icons/fa";
import Layout from "../component_dashboard/Layout";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { apiUrl, adminToken } from "../../context/http";
import Swal from "sweetalert2";

export default function Dashboard() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  // Counts
  const [goodsCount, setGoodsCount] = useState(0);
  const [suppliersCount, setSuppliersCount] = useState(0);
  const [categoriesCount, setCategoriesCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);
  const [adminsCount, setAdminsCount] = useState(0);
  const [customersCount, setCustomersCount] = useState(0);
  const [totalStock, setTotalStock] = useState(0);
  const [saleReport, setSaleReport] = useState(0);
  const [completedSales, setCompletedSales] = useState(0);

  // Finance
  const [expenses, setExpenses] = useState(0);
  const [revenue, setRevenue] = useState(0);

  // Helper to get total count from API response
  const getCount = (result) => result.meta?.total || result.data?.length || 0;

  // Generic fetch for counts
  const fetchData = async (endpoint, setter) => {
    try {
      const res = await fetch(`${apiUrl}/${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${adminToken()}`,
        },
      });
      const result = await res.json();
      setter(getCount(result));
    } catch (err) {
      console.error(`Failed to fetch ${endpoint}:`, err);
      setter(0);
      Swal.fire({
        title: "Error",
        text: `Failed to fetch ${endpoint}`,
        icon: "error",
      });
    }
  };
  const fetchCompletedSales = async () => {
    try {
      const res = await fetch(`${apiUrl}/completed-sales`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${adminToken()}`,
        },
      });
      const result = await res.json();
      setCompletedSales(result.data?.length ?? 0);
    } catch (err) {
      console.error("Failed to fetch completed sales:", err);
      setCompletedSales(0);
    }
  };

  const fetchSaleReport = async () => {
    try {
      const res = await fetch(`${apiUrl}/sales-report`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${adminToken()}`,
        },
      });
      const result = await res.json();
      // Adjust based on your API response
      setSaleReport(result.data?.totalSales ?? 0);
    } catch (err) {
      console.error("Failed to fetch sale report:", err);
      setSaleReport(0);
    }
  };

  // Fetch finance
  const fetchFinance = async () => {
    try {
      const res = await fetch(`${apiUrl}/finance`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${adminToken()}`,
        },
      });
      const result = await res.json();
      // Access data inside result.data
      setExpenses(result.data?.expenses ?? 0);
      setRevenue(result.data?.revenue ?? 0);
    } catch (err) {
      console.error("Failed to fetch finance:", err);
      setExpenses(0);
      setRevenue(0);
    }
  };

  // Fetch products and total stock
  const fetchProducts = async () => {
    try {
      const res = await fetch(`${apiUrl}/products`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${adminToken()}`,
        },
      });
      const result = await res.json();
      const products = result.data || [];
      setGoodsCount(products.length);
      const total = products.reduce(
        (sum, p) => sum + (p.stock ?? p.qty ?? 0),
        0
      );
      setTotalStock(total);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setGoodsCount(0);
      setTotalStock(0);
    }
  };

  // Fetch users and count admins/customers
  const fetchUsersCount = async () => {
    try {
      const res = await fetch(`${apiUrl}/users`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${adminToken()}`,
        },
      });
      const result = await res.json();
      const usersList = result.data || [];
      const admins = usersList.filter((u) => u.role === "admin").length;
      const customers = usersList.filter((u) => u.role !== "admin").length;
      setAdminsCount(admins);
      setCustomersCount(customers);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setAdminsCount(0);
      setCustomersCount(0);
    }
  };

  // Fetch all counts on load
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchProducts(),
      fetchData("suppliers", setSuppliersCount),
      fetchData("categoies", setCategoriesCount),
      fetchData("orders", setOrdersCount),
      fetchFinance(),
      fetchUsersCount(),
      fetchSaleReport(),
      fetchCompletedSales(),
    ]).finally(() => setLoading(false));
  }, []);

  // Main Stats
  const mainStats = [
    {
      title: t("Admins"),
      value: adminsCount.toString(),
      icon: FaUserTie,
      color: "bg-blue-600",
    },
    {
      title: t("Customers"),
      value: customersCount.toString(),
      icon: FaUsers,
      color: "bg-red-600",
    },
    {
      title: t("Completed Sales"),
      value: completedSales.toString(),
      icon: FaUserShield,
      color: "bg-green-600",
    },
    {
      title: t("Sale Report"),
      value: saleReport.toString(),
      icon: FaFileAlt,
      color: "bg-yellow-500",
    },
  ];

  // Product Stats
  const productStats = [
    {
      title: t("Suppliers"),
      value: suppliersCount.toString(),
      icon: FaTruck,
      color: "bg-green-600",
    },
    {
      title: t("Categories"),
      value: categoriesCount.toString(),
      icon: FaList,
      color: "bg-green-600",
    },
    {
      title: t("Goods"),
      value: goodsCount.toString(),
      icon: FaBoxOpen,
      color: "bg-green-600",
    },
    {
      title: t("Orders"),
      value: ordersCount.toString(),
      icon: FaShoppingCart,
      color: "bg-green-600",
    },
    {
      title: t("Total Stock"),
      value: totalStock.toString(),
      icon: FaBoxOpen,
      color: "bg-purple-600",
    },
  ];

  // Finance Stats
  const financeStats = [
    {
      title: t("Expenses"),
      value: `$${expenses.toLocaleString()}`,
      icon: FaDollarSign,
      color: "bg-green-600",
    },
    {
      title: t("Revenue"),
      value: `$${revenue.toLocaleString()}`,
      icon: FaDollarSign,
      color: "bg-green-600",
    },
  ];

  return (
    <Layout>
      <h6 className="mb-4 text-lg font-semibold">{t("Welcome, Admin ")}</h6>
      <>
        {/* Main Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {mainStats.map((stat, idx) => (
            <StatCard key={idx} {...stat} />
          ))}
        </div>

        {/* Product & Finance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CardSection title="Product Information" stats={productStats} />
          <CardSection title="Revenue and Expenses" stats={financeStats} />
        </div>
      </>
    </Layout>
  );
}

// Card Section Component
function CardSection({ title, stats }) {
  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow">
      <h5 className="text-lg font-semibold mb-2">{title}</h5>
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div
      className={`${color} text-white p-4 rounded-lg shadow hover:-translate-y-1 transition transform`}
    >
      <div className="flex justify-between items-center">
        <div>
          <h5 className="text-lg">{title}</h5>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <Icon className="text-3xl" />
      </div>
    </div>
  );
}
