import { useEffect, useState } from "react";
import { useRouter } from 'next/router';

import IOSocket from "socket.io-client";
import { Button } from "@mui/material";


import API from "../../../api";
import GameConfig, { GameRoutes } from "../../../libs/game-config";
import Spinner from "../../../components/spinner";
import { baseURL } from "../../../constants/api-url";

const styles = {
  root: "w-full h-full flex flex-col justify-center items-center text-center",
  title: "text-3xl mb-8",
  container: "shadow bg-white rounded-lg max-w-xl p-8 w-full",
  form: "flex flex-col",
};

function JoinLink() {
  const [isFetchingTeam, setIsFetchingTeam] = useState(true);
  const [team, setTeam] = useState(null);
  const [error, setError] = useState("");

  const router = useRouter();
  const { game } = router.query;
  const gameConfig = new GameConfig(game as string);

  const [socket] = useState(() =>
    IOSocket(baseURL, {
      withCredentials: true,
      transports: ["websocket"],
    })
  );

  async function joinTeam() {
    const teamId = router.query.teamid;

    if (!teamId) {
      setError(
        "Parece que este link está quebrado. Por favor, tente novamente com um novo link."
      );
      setIsFetchingTeam(false);
      return;
    }

    setIsFetchingTeam(true);
    try {
      const { data: team } = await API.game.joinTeam(gameConfig.getEventPrefix(), teamId);
      setTeam(team);
      socket.emit(`${gameConfig.getEventPrefix()}-broadcast-user-info`);
    } catch (e) {
      console.error(e);
    } finally {
      goToLobby();
      setIsFetchingTeam(false);
    }
  }

  function goToLobby() {
    router.push(gameConfig.getRoutes()[GameRoutes.LOBBY]);
  }

  function renderContent() {
    if (isFetchingTeam)
      return (
        <div>
          <p>Estamos colocando você em uma equipe...</p>
          <Spinner size="large" className="mt-8" />
        </div>
      );

    if (error)
      return (
        <div>
          <p>{error}</p>
        </div>
      );

    return (
      <div>
        <p>Parabens! Você entrou em uma equipe!</p>
        <div className="border px-4 py-2 rounded-lg my-4">{team.name}</div>
        <Button
          style={{ color: "white", backgroundColor: "#045079" }}
          variant="contained"
          onClick={goToLobby}
        >
          Continuar
        </Button>
      </div>
    );
  }

  useEffect(() => {
    joinTeam();
  }, [router.query]);

  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <h1 className={styles.title}>{gameConfig.getName()}</h1>
        {renderContent()}
      </div>
    </div>
  );
}

export default JoinLink;