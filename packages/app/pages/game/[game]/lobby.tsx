import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import IOSocket from "socket.io-client";
import { Card } from '@mui/material';

import GameConfig, { GameRoutes } from "../../../libs/game-config";
import Navbar from '../../../components/navbar';
import Footer from '../../../components/Footer';
import { baseURL } from "../../../constants/api-url";
import { useAppContext } from "../../../libs/contextLib";
import Lobby from '../../../components/game/lobby';

export default function GamePage({children}) {
  const router = useRouter();

  const { game } = router.query;

  const gameConfig = new GameConfig(game as string);

  const [isFetchingTeam, setIsFetchingTeam] = useState(true);
  const [team, setTeam] = useState(null);

  const [socket] = useState(() =>
    IOSocket(baseURL, {
      withCredentials: true,
      transports: ["websocket"],
    })
  );
  const { token } = useAppContext();

  const [isHappening, setIsHappening] = useState(gameConfig.verifyIfIsHappening());

  function handleGoToGame() {
    router.push(gameConfig.getRoutes()[GameRoutes.PLAY]);
  }

  function handleGoToCreateTeam() {
    router.push(gameConfig.getRoutes()[GameRoutes.CREATE_TEAM]);
  }
  
  function handleGoToJoinTeam() {
    router.push(gameConfig.getRoutes()[GameRoutes.JOIN_TEAM]);
  }

  function handleNewGroupInfo(info) {
    if (info) {
      setTeam(info);
      setTimeout(() => console.log(team), 1000);
    }
    setIsFetchingTeam(false);
  }

  useEffect(() => {
    if (!gameConfig) {
      return;
    }

    socket.on(`${gameConfig.getEventPrefix()}-group-info`, handleNewGroupInfo);

    return () => {
      socket.off(`${gameConfig.getEventPrefix()}-group-info`, handleNewGroupInfo);
    };
  }, []);

  useEffect(() => {
    if (!gameConfig || !token) {
      return;
    }

    socket.emit(`${gameConfig.getEventPrefix()}-join-group-room`, {token});
  }, []);

  // function verifyIfIsHappening() {
  //   // console.log(gameConfig);
  //   console.log(gameConfig.getStartDate());
  //   if (Date.now() - gameConfig.getStartDate().getTime() < 0) {
  //     return false;
  //   }
  //   return true;
  // }

  useEffect(() => {
    const handler = setInterval(() => {
      if (!gameConfig.verifyIfIsHappening()) {
        setIsHappening(false);
        clearInterval(handler);
      }
    }, 1000);
    return () => clearInterval(handler);
  }, []);
  
  return (<>
    <Navbar />
      <div className='p-6'>
        <Card className='p-6'>
          {

            !isFetchingTeam ? <Lobby
              gameConfig={gameConfig}
              setTeam={setTeam}
              team={team}
              goToGame={handleGoToGame}
              goToCreateTeam={handleGoToCreateTeam}
              goToJoinTeam={handleGoToJoinTeam}
            ></Lobby>
            :
            <div className='flex content-center'>
            
              <p>Tentando encontrar grupo</p>
            </div>
          }
        </Card>
      </div>
    <Footer />
  </>);
}
