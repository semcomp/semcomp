import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import { Card } from '@mui/material';

import GameConfig, { GameRoutes } from "../../../libs/game-config";
import Navbar from '../../../components/navbar';
import Sidebar from '../../../components/sidebar';
import Footer from '../../../components/Footer';
import { useAppContext } from "../../../libs/contextLib";
import CreateGroup from '../../../components/game/create-group';
import Lobby from '../../../components/game/lobby';
import API from "../../../api";
import { useSocket } from '../../../libs/hooks/useSocket';
import { useGameAccess } from '../../../libs/hooks/useGameAccess';
import GameAccessLoader from '../../../components/game/GameAccessLoader';

export default function GamePage({children}) {
  const router = useRouter();
  const [gameConfig, setGameConfig] = useState(null);
  const { game } =  router.query;
  
  // Verifica se os jogos estão abertos
  const { isGameOpen, isLoading: isCheckingAccess } = useGameAccess();
  
  async function fetchGameConfig() {
    try {
      const result = await API.game.getConfig(game as string);
      
      if(result.data){
        const gameConfigInstance = new GameConfig(result.data);
        setGameConfig(gameConfigInstance);
      }
    } catch (e) {
      console.error(e);
    }
  }

  const [isFetchingTeam, setIsFetchingTeam] = useState(true);
  const [team, setTeam] = useState(null);

  const { emit, on, off, isConnected } = useSocket();
  const { token } = useAppContext();

  const [component, setComponent] = useState(null);

  function handleGoToGame() {
    router.push(gameConfig.getRoutes()[GameRoutes.PLAY]);
  }

  function handleGoToCreateTeam() {
    setComponent(<CreateGroup gameConfig={gameConfig} />);
  }

  function handleNewGroupInfo(info) {
    if (info) {
      setTeam(info);
    } else {
      setTeam(null);
    }
    
    setComponent(<Lobby
      gameConfig={gameConfig}
      team={info}
      goToGame={handleGoToGame}
      goToCreateTeam={handleGoToCreateTeam}
    />)
    setIsFetchingTeam(false);
  }

  // Limpa o estado quando muda de jogo
  useEffect(() => {
    setTeam(null);
    setComponent(null);
    setIsFetchingTeam(true);
  }, [game]);

  useEffect(() => {
    if (!gameConfig) {
      return;
    }

    on(`${gameConfig.getEventPrefix()}-group-info`, handleNewGroupInfo);

    return () => {
      off(`${gameConfig.getEventPrefix()}-group-info`, handleNewGroupInfo);
    };
  }, [team, gameConfig, on, off]);

  useEffect(() => {
    emit(`${gameConfig.getEventPrefix()}-broadcast-user-info`, token);
  }, [team]);

  useEffect(() => {
    if (!gameConfig || component || !token || !isConnected) {
      return;
    }
    emit(`${gameConfig.getEventPrefix()}-join-group-room`, {token});
    setComponent(<Lobby
      gameConfig={gameConfig}
      team={team}
      goToGame={handleGoToGame}
      goToCreateTeam={handleGoToCreateTeam}
    />);
  }, [gameConfig, token, isConnected, emit]);

  if (isCheckingAccess || !isGameOpen) {
    return <GameAccessLoader isCheckingAccess={isCheckingAccess} isGameOpen={isGameOpen} />;
  }

  return (
    <>
      <Navbar />
      <Sidebar />
        <div className='p-6'>
          <Card className='p-6'>
            {
              !isFetchingTeam && component
            }
          </Card>
        </div>
      <Footer />
    </>
  );
}
