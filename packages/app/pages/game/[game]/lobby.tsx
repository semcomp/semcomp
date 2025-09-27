import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import IOSocket from "socket.io-client";
import { Card } from '@mui/material';
import { toast } from 'react-toastify';

import GameConfig, { GameRoutes } from "../../../libs/game-config";
import Navbar from '../../../components/navbar';
import Sidebar from '../../../components/sidebar';
import { baseURL } from "../../../constants/api-url";
import { useAppContext } from "../../../libs/contextLib";
import Lobby from '../../../components/game/lobby';
import SimpleBackground from '../../../components/home/SimpleBackground';
import NewFooter from '../../newFooter';
import API from "../../../api";
import GameLoadingState from '../../../components/game/GameLoadingState';
import Spinner from '../../../components/spinner';

export default function GamePage({ children }) {
  const router = useRouter();
  const { game } = router.query;

  const [isFetchingTeam, setIsFetchingTeam] = useState(true);
  const [team, setTeam] = useState(null);
  const [isHappening, setIsHappening] = useState(null);
  const [isFetchingConfig, setIsFetchingConfig] = useState(true);
  const [gameConfig, setGameConfig] = useState(null);
  const [isCreatingAutoGroup, setIsCreatingAutoGroup] = useState(false);
  const [currentGame, setCurrentGame] = useState(null);
  
  const [socket] = useState(() =>
    IOSocket(baseURL, {
      withCredentials: true,
      transports: ["websocket"],
    })
  );

  const { user, token } = useAppContext();

  // Função para criar grupo automaticamente
  async function createAutoGroup(gameConfigInstance: GameConfig) {
    if (isCreatingAutoGroup) return;
    
    setIsCreatingAutoGroup(true);
    
    try {
      const groupName = `Jogador_${Date.now()}`;
      let timeout: ReturnType<typeof setTimeout>;
      
      socket.emit(`${gameConfigInstance.getEventPrefix()}-create-group`, { 
        name: groupName, 
        token 
      });
      
      // Aguarda a confirmação via group-created
      await new Promise((resolve, reject) => {
      
        const handleGroupCreated = (group) => {
          clearTimeout(timeout);
          socket.off(`${gameConfigInstance.getEventPrefix()}-group-created`, handleGroupCreated);
          
          if (group) {
            setTeam(group);
            toast.success("Grupo criado automaticamente!");
            resolve(group);
          } else {
            reject(new Error('No group created'));
          }
        };
      
        timeout = setTimeout(() => {
          console.log('Timeout na criação de grupo');
          socket.off(`${gameConfigInstance.getEventPrefix()}-group-created`, handleGroupCreated);
          reject(new Error('Timeout creating auto group'));
        }, 10000);
      
        socket.on(`${gameConfigInstance.getEventPrefix()}-group-created`, handleGroupCreated);
      });
      
    } catch (e) {
      console.error('Erro ao criar grupo automático:', e);
      toast.error("Erro ao criar grupo automaticamente");
    } finally {
      setIsCreatingAutoGroup(false);
    }
  }

  // Função principal que executa quando o jogo muda
  async function initializeGame() {
    if (!game || !token) return;

    // Limpa estado anterior
    setTeam(null);
    setIsCreatingAutoGroup(false);
    setIsFetchingTeam(true);
    setIsFetchingConfig(true);
    setCurrentGame(game);

    try {
      // Busca configuração do jogo
      const result = await API.game.getConfig(game as string);
      if (result.data) {
        const gameConfigInstance = new GameConfig(result.data);
        setGameConfig(gameConfigInstance);
        setIsFetchingConfig(false);

        const group = await API.game.getGroupByUserIdAndGame(user.id, game as string);
        if (group.data) {
          setTeam(group.data);
          setIsFetchingTeam(false);
        }

        // Verifica se deve criar grupo automaticamente
        const shouldCreateAutoGroup = !gameConfigInstance.hasGroups() || 
                                     gameConfigInstance.getMaximumNumberOfMembersInGroup() === 1;
        
        if (!group.data && shouldCreateAutoGroup) {
          await createAutoGroup(gameConfigInstance);
        } else {
          // Para jogos com grupos, busca equipe existente
          socket.emit(`${gameConfigInstance.getEventPrefix()}-join-group-room`, { token });
        }
      }
    } catch (e) {
      console.error('Erro ao inicializar jogo:', e);
      setIsFetchingConfig(false);
    } finally {
      setIsFetchingTeam(false);
    }
  }

  // Atualizar informações do grupo
  function handleNewGroupInfo(info) {    
    if (info) {
      setTeam(info);
    } else {
      setTeam(null);
    }
    setIsFetchingTeam(false);
  }

  // Funções de navegação
  function handleGoToGame() {
    router.push(gameConfig.getRoutes()[GameRoutes.PLAY]);
  }

  function handleGoToCreateTeam() {
    router.push(gameConfig.getRoutes()[GameRoutes.CREATE_TEAM]);
  }

  function handleGoToJoinTeam() {
    router.push(gameConfig.getRoutes()[GameRoutes.JOIN_TEAM]);
  }

  useEffect(() => {
    initializeGame();
  }, [game, token]);


  // Verificar se o jogo já começou
  useEffect(() => {
    if (gameConfig) {
      const handler = setInterval(() => {
        if (!gameConfig.verifyIfIsHappening()) {
          setIsHappening(false);
          clearInterval(handler);
        } else {
          setIsHappening(true);
          clearInterval(handler);
        }
      }, 1000);
      return () => clearInterval(handler);
    }
  }, [gameConfig]);

  return (
    <div className="flex flex-col min-h-screen md:h-full">
      <Navbar className="z-20"/>
      <Sidebar />
      <SimpleBackground />
      <main className="flex justify-center flex-1 w-full md:h-full md:text-sm tablet:text-xl phone:text-xs md:items-center relative z-10">
        <div className='flex flex-col items-center justify-center md:w-[50%] mobile:w-full backdrop-brightness-95 backdrop-blur z-20 rounded-lg'>
          <div className='flex justify-center h-fit md:w-[70%] tablet:p-12 phone:p-9 font-secondary tablet:rounded-lg phone:w-full backdrop-brightness-90 backdrop-blur z-20 text-white'>
            {
              !isFetchingConfig ? (
                <>
                  {isCreatingAutoGroup ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Spinner size="large" />
                      <p className="mt-4 text-white">Criando grupo automaticamente...</p>
                    </div>
                  ) : (
                    gameConfig && !isFetchingTeam ? (
                      <Lobby
                        gameConfig={gameConfig}
                        setTeam={setTeam}
                        team={team}
                        goToGame={handleGoToGame}
                        goToCreateTeam={handleGoToCreateTeam}
                        goToJoinTeam={handleGoToJoinTeam}
                      />
                    ) : (
                      <GameLoadingState message="Tentando encontrar grupo" />
                    )
                  )}
                </>
              ) : (
                <GameLoadingState message="Tentando encontrar Jogo" />
              )
            }
          </div>
        </div>
      </main>
      <NewFooter />
    </div>
  );
}
