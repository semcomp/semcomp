import { useRouter } from 'next/router';

import Routes from "../routes";

const BlockPage = (props) => {
  // eslint-disable-next-line react/display-name
  return (props) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const router = useRouter();
    if (typeof window !== "undefined") {
      router.push(Routes.home);
      return null;
    }
    // If we are on server, return null
    return null;
  };
};

export default BlockPage;
