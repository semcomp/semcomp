import React from "react";
import { Link } from "react-router-dom";
import { Routes } from "../../../router";

import API from "../../../api";
import "./style.css";

function LiveNow() {
  const [isLive, setIsLive] = React.useState(false);

  React.useEffect(() => {
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
        <Link to={Routes.live}>
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
