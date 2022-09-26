import { useRef, useState } from "react";
import { TextField } from "@mui/material";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

import LoadingButton from "../loading-button";
import API from "../../api";
import { EVENTS_PREFIX } from "../../constants/riddlethon";
import GameConfig, { GameRoutes } from "../../libs/game-config";

export default function CreateGroup({
  socket,
  gameConfig,
  handleCreateGroup,
}: {
  socket: any;
  gameConfig: GameConfig;
  handleCreateGroup: (name: string) => void;
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
    <div className="flex items-center flex-col text-center">
      <h1>Insira seu nome</h1>
      <form
        className="flex items-center flex-col text-center"
        onSubmit={submit}
      >
        <TextField
          inputRef={teamNameRef}
          label="Seu nome"
          style={{ marginBottom: 16 }}
        />
        <LoadingButton
          className="bg-tertiary text-white p-4 rounded-xl m-0"
          isLoading={isCreatingTeam}
          type="submit"
        >
          Acessar
        </LoadingButton>
      </form>
    </div>
  );
}
