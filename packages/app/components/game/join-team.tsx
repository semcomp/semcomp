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
    <div className="flex items-center flex-col text-center">
      <h1 className="text-lg mb-5">Insira o ID do grupo para entrar</h1>
      <form
        className="flex items-center flex-col text-center"
        onSubmit={submit}
      >
        <TextField
          inputRef={teamIdRef}
          label="ID do Grupo"
          style={{ marginBottom: 16 }}
        />
        <Button
          style={{
            backgroundColor: "#045079",
            color: "white",
            margin: "0 8px",
          }}
          type="submit"
        >
          Entrar
        </Button>
      </form>
    </div>
  );
}

export default JoinTeam;
