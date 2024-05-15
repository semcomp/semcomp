import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { toast } from "react-toastify";

import Routes from "../routes";
import { useAppContext } from './contextLib';
import SemcompApi from '../api/semcomp-api';
import { SemcompApiAdminUser } from '../models/SemcompApiModels';

const RequireAuth = (WrappedComponent, nameComponent) => {
  return (props) => {
    const { user, semcompApi }: { user: SemcompApiAdminUser, semcompApi: SemcompApi } = useAppContext();
    const [rolesLoaded, setRolesLoaded] = useState(false); 
    const router = useRouter();

    const fetchRoles = async () => {
      if (user) {
        const roles = await semcompApi.getAdminRole(user.id);

        if (nameComponent !== "HOME" && !roles.includes(nameComponent)) {
          toast.error("Você não possui permissão para acessar a essa página.");
          router.push(Routes.home);
        }
        setRolesLoaded(true);
      }
    };

    useEffect(() => {
      if (semcompApi !== null) {
        fetchRoles();
      }
    }, [semcompApi]);

    if (typeof window !== "undefined" && (rolesLoaded || nameComponent === "HOME")) {
      if (!user) {
        toast.error("Sua sessão expirou. Por favor, faça login novamente");
        router.push(Routes.login);
        return null;
      }

      return <WrappedComponent {...props} />;
    }
    return null;
  };
};

export default RequireAuth;