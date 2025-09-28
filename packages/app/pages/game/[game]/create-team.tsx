import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import GameConfig, { GameRoutes } from "../../../libs/game-config";
import Navbar from '../../../components/navbar';
import Sidebar from '../../../components/sidebar';
import CreateGroup from '../../../components/game/create-group';
import SimpleBackground from '../../../components/home/SimpleBackground';
import NewFooter from '../../newFooter';
import API from "../../../api";
import { useSocket } from '../../../libs/hooks/useSocket';
import GameLoadingState from '../../../components/game/GameLoadingState';
import GameConfigError from '../../../components/game/GameConfigError';
import { useAppContext } from "../../../libs/contextLib";
import { useGameAccess } from '../../../libs/hooks/useGameAccess';
import GameAccessLoader from '../../../components/game/GameAccessLoader';

export default function GamePage({children}) {
  const router = useRouter();

  // Verifica se os jogos estão abertos
  const { isGameOpen, isLoading: isCheckingAccess } = useGameAccess();

  const [isFetchingConfig, setIsFetchingConfig] = useState(true);
  const [gameConfig, setGameConfig] = useState(null);
  const { game } = router.query;
  
  async function fetchGameConfig() {
    setIsFetchingConfig(true);
    try {
      const result = await API.game.getConfig(game as string);
      
      if(result.data){
        const gameConfigInstance = new GameConfig(result.data);
        setGameConfig(gameConfigInstance);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsFetchingConfig(false);
    }
  }

  const [isFetchingTeam, setIsFetchingTeam] = useState(true);
  const [team, setTeam] = useState(null);

  const { on, off } = useSocket();
  const { token } = useAppContext();

  function handleNewGroupCreated(group) {
    if (group) {
      router.push(gameConfig.getRoutes()[GameRoutes.LOBBY]);
    }
    setIsFetchingTeam(false);
  }

  useEffect(() => {
    if(game){
      fetchGameConfig();
    }
  }, [game])

  useEffect(() => {
    if (gameConfig) {
      on(`${gameConfig.getEventPrefix()}-group-created`, handleNewGroupCreated);

      return () => {
        off(`${gameConfig.getEventPrefix()}-group-created`, handleNewGroupCreated);
      };
    }
  }, [gameConfig, on, off]);

  // Se está verificando acesso ou os jogos não estão abertos, mostra loading
  if (isCheckingAccess || !isGameOpen) {
    return <GameAccessLoader isCheckingAccess={isCheckingAccess} isGameOpen={isGameOpen} />;
  }

  function renderContent() {
    if (isFetchingConfig) {
      return <GameLoadingState message="Carregando configuração do jogo..." />;
    }

    if (!gameConfig) {
      return <GameConfigError onRetry={fetchGameConfig} />;
    }

    return (
      <div className="w-full max-w-md">
        <CreateGroup gameConfig={gameConfig} />
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col justify-between font-secondary text-sm mobile:mt-10 tablet:mt-0">
    <Navbar />
    <Sidebar />
      
      <div className="flex-1 relative">
        <SimpleBackground />
        
        <div className="relative z-10 flex items-center justify-center h-full p-6">
          {renderContent()}
        </div>
      </div>
      
      <NewFooter />
    </div>
  );
}
