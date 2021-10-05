import React from "react";

import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import { Routes } from "../router";

function isLoggedIn(token) {
  return Boolean(token);
}

export function withAuth(Component) {
  return (props) => {
    const token = useSelector((state) => state.auth && state.auth.token);
    const user = useSelector((state) => state.auth && state.auth.user);
    const history = useHistory();

    if (!isLoggedIn(token)) {
      toast.error("Sua sessão expirou. Por favor, faça login novamente");
      // setTimeout is here to prevent changing state at a render function
      setTimeout(() => history.push(Routes.home));
      return null;
    }

    return <Component user={user} {...props} />;
  };
}

export function withNoAuth(Component) {
  return (props) => {
    const token = useSelector((state) => state.auth && state.auth.token);
    const user = useSelector((state) => state.auth && state.auth.user);
    const history = useHistory();

    if (isLoggedIn(token)) {
      // setTimeout is here to prevent changing state at a render function
      setTimeout(() => history.replace(Routes.profile));
      return null;
    }

    return <Component user={user} {...props} />;
  };
}
