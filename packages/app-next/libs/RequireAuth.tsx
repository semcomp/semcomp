import { useRouter } from 'next/router';

import { useSelector } from "react-redux";
import { toast } from "react-toastify";

import Routes from "../routes";

function isLoggedIn(token) {
  return Boolean(token);
}

function RequireAuth({ children }) {
  const token = useSelector((state: any) => state.auth && state.auth.token);
  const router = useRouter();

  if (!isLoggedIn(token)) {
    toast.error("Sua sessão expirou. Por favor, faça login novamente");
    router.push(Routes.home);
  }

  return children;
};

export default RequireAuth;
