import React from "react";
import TextField from "@material-ui/core/TextField";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";

import { HardToClickRoutes, useSocket } from "..";
import LoadingButton from "../../../components/loading-button";
import API from "../../../api";
import { EVENTS_PREFIX } from "../../../constants/hard-to-click";

import "./style.css";

function CreateTeam() {
  const [isCreatingTeam, setIsCreatingTeam] = React.useState(false);
  const socket = useSocket();
  const teamNameRef = React.useRef();
  const history = useHistory();

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
      history.push(HardToClickRoutes.lobby);
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
