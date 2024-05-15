import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { toast } from "react-toastify";

import Routes from "../routes";
import { useAppContext } from './contextLib';
import SemcompApi from '../api/semcomp-api';
import { SemcompApiAdminUser } from '../models/SemcompApiModels';

const RequireAuth = (WrappedComponent) => {
  return (props) => {
    const { user, semcompApi }: { user: SemcompApiAdminUser, semcompApi: SemcompApi } = useAppContext();
    const [rolesLoaded, setRolesLoaded] = useState(false); 
    const router = useRouter();

    const nameComp = WrappedComponent.name.toUpperCase();
    const fetchRoles = async () => {
      if (user) {
        const roles = await semcompApi.getAdminRole(user.id);
        if (nameComp !== "HOME" && !roles.includes(nameComp)) {
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

    if (typeof window !== "undefined" && (rolesLoaded || nameComp === "HOME")) {
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