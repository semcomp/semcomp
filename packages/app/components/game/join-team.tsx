import { Button, TextField } from "@mui/material";
import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import GameConfig, { GameRoutes } from "../../libs/game-config";
import API from "../../api";

function JoinTeam() {

  const teamIdRef: any = useRef();
  const router = useRouter();
  
  const [gameConfig, setGameConfig] = useState(null);
  const { game } =  router.query;
  async function fetchGameConfig() {
    try {
      const result = await API.game.getConfig(game as string);
      
      if(result.data){
        const gameConfigInstance = new GameConfig(result.data);
        setGameConfig(gameConfigInstance);  // Agora você passa a instância da classe
      }
    } catch (e) {
      console.error(e);
    } finally {
    }
  }
  
  async function submit(event) {
    event.preventDefault();
    
    const teamid = teamIdRef.current.value.trim();
    
    if (!teamid) return toast.error("Você deve fornecer um id não vazio");
  
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
