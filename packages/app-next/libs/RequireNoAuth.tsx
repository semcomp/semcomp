import { useRouter } from 'next/router';

import { useSelector } from "react-redux";

import Routes from "../routes";

function isLoggedIn(token) {
  return Boolean(token);
}

function RequireNoAuth({ children }) {
  const token = useSelector((state: any) => state.auth && state.auth.token);
  const router = useRouter();

  if (isLoggedIn(token)) {
    router.push(Routes.profile);
  }

  return children;
};

export default RequireNoAuth;
