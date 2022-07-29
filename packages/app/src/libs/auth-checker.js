import React from "react";

import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

import { Routes } from "../router";

function isLoggedIn(token) {
  return Boolean(token);
}

export function RequireAuth({ children }) {
  const token = useSelector((state) => state.auth && state.auth.token);

  if (!isLoggedIn(token)) {
    toast.error("Sua sessão expirou. Por favor, faça login novamente");
    return <Navigate to={Routes.home} replace />;
  }

  return children;
}

export function RequireNoAuth({ children }) {
  const token = useSelector((state) => state.auth && state.auth.token);

  if (isLoggedIn(token)) {
    return <Navigate to={Routes.profile} replace />;
  }

  return children;
}
