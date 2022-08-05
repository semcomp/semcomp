import { useState, useRef } from "react";
import { TextField } from "@mui/material";
import { toast } from "react-toastify";
import { useRouter } from 'next/router';

import { HardToClickRoutes, useSocket } from "..";
import LoadingButton from "../../../components/loading-button";
import API from "../../../api";
import { EVENTS_PREFIX } from "../../../constants/hard-to-click";

import "../../../styles/Hard-To-Click-Create.module.css";

function CreateTeam() {
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const socket = useSocket();
  const teamNameRef: any = useRef();
  const router = useRouter();

  async function submit(event) {
    event.preventDefault();
    if (isCreatingTeam) return;

    const name = teamNameRef.current.value.trim();

    if (!name) return toast.error("Você deve fornecer um nome não vazio");

    setIsCreatingTeam(true);
    try {
      await API.hardToClick.createTeam(name);
      toast.success(`Equipe '${name}' criada com sucesso`);
      socket.send(`${EVENTS_PREFIX}join-group-room`);
      router.push(HardToClickRoutes.lobby);
    } catch (e) {
      console.error(e);
    } finally {
      setIsCreatingTeam(false);
    }
  }

  return (
    <div className="hard-to-click-create-page">
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

export default CreateTeam;
