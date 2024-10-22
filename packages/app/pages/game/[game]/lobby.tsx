import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import IOSocket from "socket.io-client";
import { Card } from '@mui/material';

import GameConfig, { GameRoutes } from "../../../libs/game-config";
import Navbar from '../../../components/navbar';
import Sidebar from '../../../components/sidebar';
import Footer from '../../../components/Footer';
import { baseURL } from "../../../constants/api-url";
import { useAppContext } from "../../../libs/contextLib";
import Lobby from '../../../components/game/lobby';
import AnimatedBG from '../../animatedBG';
import NewFooter from '../../newFooter';
import API from "../../../api";
import Spinner from '../../../components/spinner';

export default function GamePage({ children }) {
  const router = useRouter();
  const { game } = router.query;

  const [isFetchingTeam, setIsFetchingTeam] = useState(true);
  const [team, setTeam] = useState(null);
  const [isHappening, setIsHappening] = useState(null);
  const [isFetchingConfig, setIsFetchingConfig] = useState(true);
  const [gameConfig, setGameConfig] = useState(null);
  
  // TIRAR ISSO DEPOIS DA SEMCOMP 27
  const [imageIndex, setImageIndex] = useState<number>(10);
  const timeToImage = [
    { start: 5, end: 7, imgIndex: 0 },
    { start: 7, end: 8, imgIndex: 1 },
    { start: 8, end: 10, imgIndex: 2 },
    { start: 10, end: 12, imgIndex: 3 },
    { start: 12, end: 14, imgIndex: 4 },
    { start: 14, end: 16, imgIndex: 5 },
    { start: 16, end: 17, imgIndex: 6 },
    { start: 17, end: 18, imgIndex: 7 },
    { start: 18, end: 19, imgIndex: 8 },
    { start: 19, end: 22, imgIndex: 9 },
    { start: 0, end: 5, imgIndex: 10 },
  ];
  useEffect(() => {
    const currentHour = new Date().getHours();
    const matchedImage = timeToImage.find(
      ({ start, end }) => currentHour >= start && currentHour < end
    );
    setImageIndex(matchedImage?.imgIndex ?? 10);
  }, []);


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


  useEffect(() => {
    if(gameConfig){
      setIsHappening(gameConfig.verifyIfIsHappening());
    }
  }, [gameConfig])

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
    if(gameConfig){
        const handler = setInterval(() => {
          if (!gameConfig.verifyIfIsHappening()) {
            setIsHappening(false);
            clearInterval(handler);
          }
        }, 1000);
        return () => clearInterval(handler);
    }
  }, [gameConfig]);

  return (
    <div className="min-h-screen w-full flex flex-col bg-blue">
      <Navbar className="z-20"/>
      <Sidebar />
      <AnimatedBG imageIndex={imageIndex} />
      <div className='z-20 h-full py-12 phone:pt-16 tablet:pt-34 w-full flex flex-col items-center justify-center'>
      <div className='flex flex-col h-full items-center justify-center w-[50%] mobile:w-full text-primary static rounded-lg z-20 bg-white'>
      {
      !isFetchingConfig ?
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
              <div className='flex content-center'>
            <div className='flex flex-col items-center justify-center text-xl font-secondary py-16'>
              <p className='pb-4'>Tentando encontrar grupo</p>
              <Spinner size="large"/>
            </div>
        </div>
            )
          ) : (
            gameConfig && !isFetchingTeam && <Lobby
            gameConfig={gameConfig}
            setTeam={setTeam}
            team={team}
            goToGame={handleGoToGame}
            goToCreateTeam={handleGoToCreateTeam}
            goToJoinTeam={handleGoToJoinTeam}
              />
            )}
        </>
        :
        <div className='flex content-center'>
            <div className='flex flex-col items-center justify-center text-xl font-secondary py-16'>
              <p className='pb-4'>Tentando encontrar Jogo</p>
              <Spinner size="large"/>
            </div>
        </div>
        }
        </div>
      </div>
      <NewFooter />
    </div>
  );
}
