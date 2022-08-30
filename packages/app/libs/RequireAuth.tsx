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
    if (!user) {
      toast.error("Sua sessão expirou. Por favor, faça login novamente");
      router.push(Routes.home);
      return null;
    }
    return <WrappedComponent {...props} />;
  };
};

export default RequireAuth;
