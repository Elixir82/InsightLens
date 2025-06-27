import { useAuth } from "../context/authContext";
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
  const {user, loading} = useAuth();
  if(loading){
    return  <div className="text-center mt-20 text-gray-500">Checking authentication...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;

}