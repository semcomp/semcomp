import { useRouter } from 'next/router';

import { toast } from "react-toastify";

import Routes from "../routes";
import { useAppContext } from './contextLib';

const RequireAuth = (WrappedComponent) => {
  // eslint-disable-next-line react/display-name
  return (props) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { user } = useAppContext();
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const router = useRouter();
    if (typeof window !== "undefined") {
      if (!user) {
        toast.error("Sua sessão expirou. Por favor, faça login novamente");
        router.push(Routes.home);
      } else if (!user.verified) {
        toast.error("Você precisa confirmar seu email!");
        router.push(Routes.home);
      }
      return <WrappedComponent {...props} />;
    }
    return null;
  };
};

export default RequireAuth;
