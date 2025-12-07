import { createContext, useState } from "react";

export const AdminAuthContext = createContext();
export const AdminAuthProivder = ({ children }) => {
  const adminInfo = localStorage.getItem("adminInfo");
  const [user, setUser] = useState(adminInfo);
  const LoginDashbord = (user) => {
    setUser(user);
    localStorage.setItem("adminInfo", JSON.stringify(user));
  };
  const logout = () => {
    localStorage.removeItem("adminInfo");
    setUser(null);
  };
  return (
    <AdminAuthContext.Provider value={{ user, LoginDashbord, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};
