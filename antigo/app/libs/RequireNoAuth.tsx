import { useRouter } from 'next/router';

import Routes from "../routes";
import { useAppContext } from './contextLib';

const RequireNoAuth = (WrappedComponent) => {
  // eslint-disable-next-line react/display-name
  return (props) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { user } = useAppContext();
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const router = useRouter();
    if (user) {
      router.push(Routes.profile);
      return null;
    }
    return <WrappedComponent {...props} />;
  };
};

export default RequireNoAuth;
