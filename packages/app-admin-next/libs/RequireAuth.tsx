import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { toast } from "react-toastify";

import Routes from "../routes";
import { useAppContext } from './contextLib';
import SemcompApi from '../api/semcomp-api';
import { SemcompApiAdminUser } from '../models/SemcompApiModels';

const RequireAuth = (WrappedComponent) => {
  return (props) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { user } = useAppContext();
    const { adminRole } = useAppContext();
    const nameComp = WrappedComponent.name.toUpperCase();
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const router = useRouter();
    const nameComp = WrappedComponent.name.toUpperCase();

    useEffect(() => {
      const fetchRoles = async () => {
        if (user) {
          const roles = await semcompApi.getAdminRole(user.id);
          if (typeof window !== "undefined" && nameComp !== "HOME" && !!roles && !roles.includes(nameComp)) {
            toast.error("Você não possui permissão para acessar a essa página.");
            router.push(Routes.home);
            return;
          }
          setRolesLoaded(true);
        }
      }

      fetchRoles();
    }, [user, semcompApi]);

    if (typeof window !== "undefined" && (rolesLoaded || nameComp === "HOME")) {
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
