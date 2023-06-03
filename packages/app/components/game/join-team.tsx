import { Button, TextField } from "@mui/material";
import { useRef } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import GameConfig, { GameRoutes } from "../../libs/game-config";

function JoinTeam() {

  const teamIdRef: any = useRef();
  const router = useRouter();
  
  
  async function submit(event) {
    event.preventDefault();
    
    const teamid = teamIdRef.current.value.trim();
    
    if (!teamid) return toast.error("Você deve fornecer um id não vazio");
    
    const { game } =  router.query;
    const gameConfig = new GameConfig(game as string);
    router.push(gameConfig.getRoutes()[GameRoutes.LINK] + '?teamid=' + teamid);
  }

  return (
    <div className="riddlethon-join-page">
      <form
        className="flex items-center flex-col text-center"
        onSubmit={submit}
      >
        <TextField
          inputRef={teamIdRef}
          label="Seu nome"
          style={{ marginBottom: 16 }}
        />
        <Button
          className="bg-tertiary text-white p-4 rounded-xl m-0"

          type="submit"
        >
          Acessar
        </Button>
      </form>
    </div>
  );
}

export default JoinTeam;
