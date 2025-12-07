import { useContext } from "react";
import { AdminAuthContext } from "../../context/AdminAuth";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../context/Auth";
export const RequireAuth = ({ children }) => {
  const { user } = useContext(AuthContext);
  if (!user) {
    return <Navigate to={`/account/login`} />;
  }
  return children;
};
