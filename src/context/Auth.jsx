import { createContext, useState } from "react";

export const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const userInfo = localStorage.getItem("userInfo");
  const [user, setUser] = useState(userInfo ? JSON.parse(userInfo) : null);
  const LoginDashbordUser = (user) => {
    setUser(user);
    localStorage.setItem("userInfo", JSON.stringify(user));
  };
  const logout = () => {
    localStorage.removeItem("userInfo");
    setUser(null);
  };
  return (
    <AuthContext.Provider value={{ user, LoginDashbordUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
