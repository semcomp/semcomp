import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';

import IOSocket from "socket.io-client";
import { Card } from '@mui/material';

import GameConfig from "../../../libs/game-config";
import Navbar from '../../../components/navbar';
import Sidebar from '../../../components/sidebar';
import Footer from '../../../components/Footer';
import { baseURL } from "../../../constants/api-url";
import { useAppContext } from "../../../libs/contextLib";
import GameCard from '../../../components/game/game';
import API from "../../../api";
import AnimatedBG from '../../animatedBG';
import NewFooter from '../../newFooter';
import Spinner from '../../../components/spinner';

export default function GamePage({children}) {
  const router = useRouter();
  const { game } = router.query;

  const [isFetchingTeam, setIsFetchingTeam] = useState(true);
  const [isFetchingConfig, setIsFetchingConfig] = useState(true);
  const [gameConfig, setGameConfig] = useState(null);
  const [team, setTeam] = useState(null);

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
  <div className="min-h-screen w-full flex flex-col">
  <Navbar />
  <Sidebar />
  <AnimatedBG imageIndex={imageIndex} />
      <div className="w-full flex flex-col z-50">
        <div className='p-6'>
          {
            !isFetchingTeam ? <GameCard
              team={team}
              setTeam={setTeam}
              socket={socket}
              gameConfig={gameConfig}
              token={token}
            ></GameCard>
            :
            <div className='z-20 h-full py-12 phone:pt-16 tablet:pt-34 w-full flex flex-col items-center justify-center'>
              <div className='flex flex-col h-full items-center justify-center w-[50%] mobile:w-full text-primary static rounded-lg z-20 bg-white'>      
                <div className='flex content-center'>
                <div className='flex flex-col items-center justify-center text-xl font-secondary py-16'>
                  <p className='pb-4'>Tentando encontrar grupo</p>
                  <Spinner size="large"/>
                </div>
              </div>
            </div>
        </div>
          }
        </div>
      </div>
    <NewFooter />
  </div>
  );
}
