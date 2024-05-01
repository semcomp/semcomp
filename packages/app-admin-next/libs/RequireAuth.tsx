import { useRouter } from 'next/router';

import { toast } from "react-toastify";

import Routes from "../routes";
import { useAppContext } from './contextLib';

const RequireAuth = (WrappedComponent) => {
  // eslint-disable-next-line react/display-name
  return (props) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { user } = useAppContext();
    const { adminRole } = useAppContext();
    const nameComp = WrappedComponent.name.toUpperCase();
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const router = useRouter();
    if (typeof window !== "undefined") {
      if (!user) {
        toast.error("Sua sessão expirou. Por favor, faça login novamente");
        router.push(Routes.login);
        return null;
      } else if (nameComp !== "HOME" && !!adminRole && !adminRole.find((role) => role === nameComp)){
        toast.error("Você não possui permissão para acessar a essa página.");
        router.push(Routes.home);
        return null;
      }

      return <WrappedComponent {...props} />;
    }
    return null;
  };
};

export default RequireAuth;
