import { useRef, useState } from "react";
import { TextField, Button } from "@mui/material";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

import LoadingButton from "../loading-button";
import GameConfig from "../../libs/game-config";
import { useSocket } from "../../libs/hooks/useSocket";

export default function CreateGroup({
  gameConfig,
}: {
  gameConfig: GameConfig;
}) {
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const teamNameRef: any = useRef();
  const router = useRouter();
  const { emit, on, off, isConnected } = useSocket();

  async function submit(event) {
    event.preventDefault();
    if (isCreatingTeam || !isConnected) return;

    const name = teamNameRef.current.value.trim();

    if (!name) return toast.error("Você deve fornecer um nome não vazio");

    setIsCreatingTeam(true);
    
    try {
      // Emitir evento de criação de grupo
      emit(`${gameConfig.getEventPrefix()}-create-group`, { 
        name,
      });
      
      // Aguardar resposta do servidor
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Timeout creating group'));
        }, 10000); // 10 segundos

        on(`${gameConfig.getEventPrefix()}-group-created`, (group) => {
          clearTimeout(timeout);
          toast.success("Grupo criado com sucesso!");
          resolve(group);
        });

        on(`${gameConfig.getEventPrefix()}-error-message`, (error) => {
          clearTimeout(timeout);
          if (error.includes("já tem um grupo")) {
            toast.warning("Você já possui um grupo neste jogo");
          } else {
            toast.error(error);
          }
          reject(new Error(error));
        });
      });
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error("Erro ao criar grupo. Tente novamente.");
    } finally {
      setIsCreatingTeam(false);
    }
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-8 text-center">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary mb-2">
          Criar Equipe
        </h1>
        <p className="text-gray-600">
          Digite o nome da equipe para começar a jogar
        </p>
      </div>
      
      <form onSubmit={submit} className="space-y-6">
        <TextField
          inputRef={teamNameRef}
          label="Nome da Equipe"
          fullWidth
          variant="outlined"
          placeholder="Digite o nome da equipe"
          disabled={!isConnected || isCreatingTeam}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '0.5rem',
            }
          }}
        />
        
        <Button
          type="submit"
          variant="contained"
          disabled={!isConnected || isCreatingTeam}
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
          {isCreatingTeam ? 'Criando...' : !isConnected ? 'Conectando...' : 'Criar Equipe'}
        </Button>
      </form>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong> Dica:</strong> Escolha um nome criativo para sua equipe! Outros jogadores poderão se juntar usando o ID que será gerado.
        </p>
      </div>
    </div>
  );
}
