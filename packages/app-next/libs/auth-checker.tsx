import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { useRouter } from 'next/router';

import Routes from "../routes";

function isLoggedIn(token) {
  return Boolean(token);
}

export function RequireAuth({ children }) {
  const token = useSelector((state: any) => state.auth && state.auth.token);
  const router = useRouter();

  if (!isLoggedIn(token)) {
    toast.error("Sua sessão expirou. Por favor, faça login novamente");
    router.push(Routes.home)
  }

  return children;
}

export function RequireNoAuth({ children }) {
  const token = useSelector((state: any) => state.auth && state.auth.token);
  const router = useRouter();

  if (isLoggedIn(token)) {
    router.push(Routes.profile)
  }

  return children;
}
