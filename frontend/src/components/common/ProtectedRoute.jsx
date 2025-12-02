import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({ requiredPermission }) => {
  const { user } = useAuth(); // Dapatkan user dari context
  const location = useLocation(); // Dapatkan lokasi saat ini
  // Cek apakah token ada di localStorage
  const token = localStorage.getItem("sirico-token");

  if (!token) {
    return <Navigate to="/" state={{ from: location }} replace />; // Simpan lokasi asal
  }

  // 2. Jika ADA token DAN ada requiredPermission
  if (requiredPermission) {
    const isAdmin = user?.role === "admin";
    const hasRequiredPermission = user?.permissions?.includes(requiredPermission);

    // Jika user BUKAN admin DAN TIDAK punya permission, redirect ke Dashboard (atau halaman 'Unauthorized')
    if (!isAdmin && !hasRequiredPermission) {
      console.warn(`Access denied to ${location.pathname}. Missing permission: ${requiredPermission}`);
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // 3. Jika ada token DAN (tidak ada requiredPermission ATAU user punya permission/admin), tampilkan halaman
  return <Outlet />;
};

export default ProtectedRoute;
