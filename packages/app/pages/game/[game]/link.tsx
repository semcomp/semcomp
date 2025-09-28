import { useEffect, useState } from "react";
import { useRouter } from 'next/router';

import { Button } from "@mui/material";

import API from "../../../api";
import GameConfig, { GameRoutes } from "../../../libs/game-config";
import Spinner from "../../../components/spinner";
import Navbar from '../../../components/navbar';
import Sidebar from '../../../components/sidebar';
import SimpleBackground from '../../../components/home/SimpleBackground';
import NewFooter from '../../newFooter';
import GameLoadingState from '../../../components/game/GameLoadingState';
import GameConfigError from '../../../components/game/GameConfigError';
import { useSocket } from '../../../libs/hooks/useSocket';
import themeColors from '../../../styles/themeColors';

export default function JoinLinkPage() {
  const [isFetchingTeam, setIsFetchingTeam] = useState(true);
  const [isFetchingConfig, setIsFetchingConfig] = useState(true);
  const [team, setTeam] = useState(null);
  const [error, setError] = useState("");
  const [gameConfig, setGameConfig] = useState(null as GameConfig);

  const router = useRouter();
  const { game, teamid } = router.query;
  const { emit, isConnected } = useSocket();

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

  async function joinTeam() {
    if (!teamid) {
      setError(
        "Parece que este link está quebrado. Por favor, tente novamente com um novo link."
      );
      setIsFetchingTeam(false);
      return;
    }

    setIsFetchingTeam(true);
    try {
      const { data: team } = await API.game.joinTeam(gameConfig.getEventPrefix(), teamid);
      setTeam(team);
      
      if (isConnected) {
        emit(`${gameConfig.getEventPrefix()}-broadcast-user-info`);
      }
      
      goToLobby();
    } catch (e) {
      console.error(e);
      goToJoinTeam();
    } finally {
      setIsFetchingTeam(false);
    }
  }

  function goToLobby() {
    router.push(gameConfig?.getRoutes()[GameRoutes.LOBBY]);
  }
  
  function goToJoinTeam() {
    router.push(gameConfig?.getRoutes()[GameRoutes.JOIN_TEAM]);
  }

  useEffect(() => {
    if(game){
      fetchGameConfig();
    }
  }, [game]);

  useEffect(() => {
    if(gameConfig && teamid) {
      joinTeam();
    }
  }, [gameConfig, teamid]);

  function renderContent() {
    if (isFetchingConfig) {
      return <GameLoadingState message="Carregando configuração do jogo..." />;
    }

    if (!gameConfig) {
      return <GameConfigError onRetry={fetchGameConfig} />;
    }

    if (isFetchingTeam) {
      return (
        <div className="w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-primary mb-4">{gameConfig.getTitle()}</h1>
          <p className="text-gray-600 mb-6">Estamos colocando você em uma equipe...</p>
          <div className="flex justify-center">
            <Spinner size="large" />
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-primary mb-4">{gameConfig.getTitle()}</h1>
          <div className="text-red-600 mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
            <p>{error}</p>
          </div>
          <Button
            variant="contained"
            onClick={goToJoinTeam}
            className="w-full py-3 text-lg font-bold rounded-lg"
            sx={{
              backgroundColor: themeColors.primary,
              '&:hover': {
                backgroundColor: themeColors.hoverPrimary,
              }
            }}
          >
            Tentar Novamente
          </Button>
        </div>
      );
    }

    return (
      <div className="w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-primary mb-4">{gameConfig.getTitle()}</h1>
        <div className="mb-6">
          <p className="text-lg text-gray-700 mb-4">Parabéns! Você entrou em uma equipe!</p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-medium text-lg">{team && team.name}</p>
          </div>
        </div>
        <Button
          variant="contained"
          onClick={goToLobby}
          className="w-full py-3 text-lg font-bold rounded-lg"
          sx={{
            backgroundColor: themeColors.primary,
            '&:hover': {
              backgroundColor: themeColors.hoverPrimary,
            }
          }}
        >
          Continuar para o Lobby
        </Button>
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
          <div className="w-full max-w-md flex items-center justify-center">
            {renderContent()}
          </div>
        </div>
      </div>
      
      <NewFooter />
    </div>
  );
}
