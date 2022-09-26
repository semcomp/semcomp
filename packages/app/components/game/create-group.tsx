import { useRef, useState } from "react";
import { TextField } from "@mui/material";
import { toast } from "react-toastify";
import { useRouter } from 'next/router';

import LoadingButton from "../loading-button";
import API from "../../api";
import { EVENTS_PREFIX } from "../../constants/riddlethon";
import GameConfig, { GameRoutes } from "../../libs/game-config";

export default function CreateGroup({
  socket, gameConfig, handleCreateGroup,
}: {
  socket: any, gameConfig: GameConfig, handleCreateGroup: (name: string) => void,
}) {
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const teamNameRef: any = useRef();
  const router = useRouter();

  async function submit(event) {
    event.preventDefault();
    if (isCreatingTeam) return;

    const name = teamNameRef.current.value.trim();

    if (!name) return toast.error("Você deve fornecer um nome não vazio");

    handleCreateGroup(name);
  }

  return (
    <div className="riddlethon-create-page">
      <h1>Criar Equipe</h1>
      <form onSubmit={submit}>
        <TextField
          inputRef={teamNameRef}
          label="Nome da equipe"
          style={{ marginBottom: 16 }}
        />
        <LoadingButton isLoading={isCreatingTeam} type="submit">
          Criar
        </LoadingButton>
      </form>
    </div>
  );
}
