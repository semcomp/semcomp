/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { useRouter } from 'next/router';

import API from "../../../api";
import { RiddlethonRoutes, useSocket, useTeam } from "..";
import Spinner from "../../../components/spinner";
import { EVENTS_PREFIX } from "../../../constants/riddlethon";

const styles = {
  root: "w-full h-full flex flex-col justify-center items-center text-center",
  title: "text-3xl mb-8",
  container: "shadow bg-white rounded-lg max-w-xl p-8 w-full",
  form: "flex flex-col",
};

function JoinLink() {
  const [isJoiningTeam, setIsJoiningTeam] = useState(true);
  const { team, setTeam } = useTeam();
  const [error, setError] = useState("");
  const socket = useSocket();
  const router = useRouter();

  async function joinTeam() {
    const teamId = router.query.teamid;

    if (!teamId) {
      setError(
        "Parece que este link está quebrado. Por favor, tente novamente com um novo link."
      );
      setIsJoiningTeam(false);
      return;
    }

    setIsJoiningTeam(true);
    try {
      const { data: team } = await API.riddlethon.joinTeam(teamId);
      setTeam(team);
      socket.send(`${EVENTS_PREFIX}broadcast-user-info`);
    } catch (e) {
      console.error(e);
    } finally {
      goToLobby();
      setIsJoiningTeam(false);
    }
  }

  function goToLobby() {
    router.push(RiddlethonRoutes.lobby);
  }

  function renderContent() {
    if (isJoiningTeam)
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
  }, []);

  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <h1 className={styles.title}>Riddlethon</h1>
        {renderContent()}
      </div>
    </div>
  );
}

export default JoinLink;
