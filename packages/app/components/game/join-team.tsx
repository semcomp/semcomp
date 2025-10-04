import { Button, TextField } from "@mui/material";
import { Lightbulb } from "@mui/icons-material";
import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import GameConfig, { GameRoutes } from "../../libs/game-config";

function JoinTeam({ gameConfig }: { gameConfig: GameConfig }) {
  const teamIdRef: any = useRef();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  async function submit(event) {
    event.preventDefault();
    
    if (isSubmitting) return;
    
    const teamid = teamIdRef.current.value.trim();
    
    if (!teamid) return toast.error("Você deve fornecer um ID não vazio");
  
    setIsSubmitting(true);
    try {
      router.push(gameConfig.getRoutes()[GameRoutes.LINK] + '?teamid=' + teamid);
    } catch (e) {
      console.error(e);
      toast.error("Erro ao entrar na equipe");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-8 text-center">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary mb-2">
          Entrar em Equipe
        </h1>
        <p className="text-gray-600">
          Digite o ID da equipe para se juntar ao grupo
        </p>
      </div>
      
      <form onSubmit={submit} className="space-y-6">
        <TextField
          inputRef={teamIdRef}
          label="ID da Equipe"
          fullWidth
          variant="outlined"
          placeholder="Digite o ID da equipe"
          disabled={isSubmitting}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '0.5rem',
            }
          }}
        />
        
        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting}
          className="w-full py-3 text-lg font-bold rounded-lg"
          sx={{
            backgroundColor: '#242D5C',
            '&:hover': {
              backgroundColor: '#1a2350',
            },
            '&:disabled': {
              backgroundColor: '#ccc',
            }
          }}
        >
          {isSubmitting ? 'Entrando...' : 'Entrar na Equipe'}
        </Button>
      </form>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800 flex items-center">
          <Lightbulb className="w-4 h-4 mr-2 text-yellow-600" />
          <strong>Dica:</strong> Peça o ID da equipe para o líder do grupo ou procure por equipes abertas.
        </p>
      </div>
    </div>
  );
}

export default JoinTeam;
