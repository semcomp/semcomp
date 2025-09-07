import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';

import IOSocket from "socket.io-client";
import { Card } from '@mui/material';

import GameConfig from "../../../libs/game-config";
import Navbar from '../../../components/navbar';
import Sidebar from '../../../components/sidebar';
import { baseURL } from "../../../constants/api-url";
import { useAppContext } from "../../../libs/contextLib";
import GameCard from '../../../components/game/game';
import API from "../../../api";
import SimpleBackground from '../../../components/home/SimpleBackground';
import NewFooter from '../../newFooter';
import Spinner from '../../../components/spinner';

export default function GamePage({children}) {
  const router = useRouter();
  const { game } = router.query;

  const [isFetchingTeam, setIsFetchingTeam] = useState(true);
  const [isFetchingConfig, setIsFetchingConfig] = useState(true);
  const [gameConfig, setGameConfig] = useState(null);
  const [team, setTeam] = useState(null);

  const socket = IOSocket(baseURL, {
    withCredentials: true,
    transports: ["websocket"],
  });
  const { token } = useAppContext();

  function handleNewGroupInfo(info) {
    setTeam(info);
    setIsFetchingTeam(false);
  }

  useEffect(() => {
    if(game){
      fetchGameConfig();
    }
  }, [game])

  async function fetchGameConfig() {
    setIsFetchingConfig(true);
    try {
      const result = await API.game.getConfig(game as string);
      
      if(result.data){
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
    if (gameConfig) {
      socket.on(`${gameConfig.getEventPrefix()}-group-info`, handleNewGroupInfo);

      return () => {
        socket.off(`${gameConfig.getEventPrefix()}-group-info`, handleNewGroupInfo);
      };
    }
  }, [gameConfig]);

  useEffect(() => {
    if (!gameConfig || !token) {
      return;
    }
    socket.emit(`${gameConfig.getEventPrefix()}-join-group-room`, {token});
  }, [gameConfig]);

  return (
  <div className="flex flex-col min-h-screen md:h-full">
  <Navbar />
  <Sidebar />
    <SimpleBackground />
      <main className="flex justify-center flex-1 w-full md:h-full md:text-sm tablet:text-xl phone:text-xs md:items-center relative z-10">
        <div className='flex flex-col items-center justify-center md:w-[50%] mobile:w-full backdrop-brightness-95 backdrop-blur z-20 rounded-lg'>      
          <div className='items-center justify-center h-fit md:w-[70%] md:p-9 tablet:p-12 phone:p-9 font-secondary tablet:rounded-lg phone:w-full backdrop-brightness-90 backdrop-blur z-20 text-white'>
          {
              !isFetchingTeam ? (
                <GameCard
              team={team}
              setTeam={setTeam}
              socket={socket}
              gameConfig={gameConfig}
              token={token}
                />
              ) : (
                <div className='z-20 h-full w-full flex flex-col items-center justify-center'>
                <div className='flex flex-col items-center justify-center text-xl font-secondary py-16'>
                  <p className='pb-4'>Tentando encontrar grupo</p>
                  <Spinner size="large"/>
                </div>
              </div>
              )
          }
        </div>
      </div>
      </main>
    <NewFooter />
  </div>
  );
}
