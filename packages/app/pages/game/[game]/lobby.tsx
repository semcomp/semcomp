import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import IOSocket from "socket.io-client";
import { Card } from '@mui/material';

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

export default function GamePage({ children }) {
  const router = useRouter();
  const { game } = router.query;

  const [isFetchingTeam, setIsFetchingTeam] = useState(true);
  const [team, setTeam] = useState(null);
  const [isHappening, setIsHappening] = useState(null);
  const [isFetchingConfig, setIsFetchingConfig] = useState(true);
  const [gameConfig, setGameConfig] = useState(null);
  
  async function fetchGameConfig() {
    setIsFetchingConfig(true);
    try {
      const result = await API.game.getConfig(game as string);
      
      if(result.data){
        // Mapeia o resultado da API na classe GameConfig
        const gameConfigInstance = new GameConfig(result.data);
        setGameConfig(gameConfigInstance);  // Agora você passa a instância da classe
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsFetchingConfig(false);
    }
  }

  useEffect(() => {
    if(game){
      fetchGameConfig();
    }
  }, [game])

  const [socket] = useState(() =>
    IOSocket(baseURL, {
      withCredentials: true,
      transports: ["websocket"],
    })
  );

  const { token } = useAppContext();

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

  // Atualizar informações do grupo (apenas para jogos em equipe)
  function handleNewGroupInfo(info) {
    if (info) {
      setTeam(info);
    }
    setIsFetchingTeam(false);
  }

  // Configuração de sockets e grupo apenas para jogos em equipe
  useEffect(() => {
    if (!gameConfig) {
      return;
    }

    socket.on(`${gameConfig.getEventPrefix()}-group-info`, handleNewGroupInfo);

    return () => {
      socket.off(`${gameConfig.getEventPrefix()}-group-info`, handleNewGroupInfo);
    };
  }, [gameConfig]);

  // Entrar na sala do grupo apenas para jogos em equipe
  useEffect(() => {
    if (!gameConfig || !token) {
      return;
    }

    socket.emit(`${gameConfig.getEventPrefix()}-join-group-room`, { token });
  }, [gameConfig, token]);

  // Verificar se o jogo já começou
  useEffect(() => {
    console.log(gameConfig);
    console.log(gameConfig?.verifyIfIsHappening());
    if(gameConfig){
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
          <div className='flex justify-center h-fit md:w-[70%] md:p-9 tablet:p-12 phone:p-9 font-secondary tablet:rounded-lg phone:w-full backdrop-brightness-90 backdrop-blur z-20 text-white'>
            {
              !isFetchingConfig ? (
                <>
                  {gameConfig && gameConfig.hasGroups() ? (  
                    !isFetchingTeam ? (
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
