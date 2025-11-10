// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function ProtectedRoute({ children, onlyRole }) {
  const { user, userData, loading } = useAuth();
  if (loading) return <p className="text-center mt-5">Cargando...</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (onlyRole && userData?.rol !== onlyRole) return <Navigate to="/dashboard" replace />;
  return children;
}
