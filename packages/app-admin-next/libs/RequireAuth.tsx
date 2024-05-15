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
    console.log('nome componente; ', nameComp);

    const fetchRoles = async () => {
      if (user) {
        const roles = await semcompApi.getAdminRole(user.id);
        console.log('roles: ', roles);
        console.log('tem role? ', roles.includes(nameComp));
        if (nameComp !== "HOME" && !roles.includes(nameComp)) {
          toast.error("Você não possui permissão para acessar a essa página.");
          router.push(Routes.home);
        }
        setRolesLoaded(true);
      }
    };

    useEffect(() => {
      if (semcompApi !== null) {
        console.log('nome componente antes fetchRoles: ', nameComp);

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