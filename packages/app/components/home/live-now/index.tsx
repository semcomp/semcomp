import { useEffect, useState } from "react";
import Link from 'next/link'

import Routes from "../../../routes";
import API from "../../../api";

function LiveNow() {
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    async function fetchCurrentEvent() {
      try {
        const response = await API.events.getCurrent();
        return response.data;
      } catch (e) {
        console.error(e);
        return null;
      }
    }

    async function fetchAndSetCurrentEvent() {
      const response = await fetchCurrentEvent();
      setIsLive(response !== "");
    }

    fetchAndSetCurrentEvent();
  }, []);

  return (
    <>
      {isLive && (
        <Link href={Routes.live}>
          <div className="home-live-now">
            Estamos ao vivo agora!
            <br />
            Clique para assistir.
          </div>
        </Link>
      )}
    </>
  );
}

export default LiveNow;
