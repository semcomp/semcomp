import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';

import IOSocket from "socket.io-client";
import { Card } from '@mui/material';

import GameConfig from "../../../libs/game-config";
import Navbar from '../../../components/navbar';
import Footer from '../../../components/Footer';
import { baseURL } from "../../../constants/api-url";
import { useAppContext } from "../../../libs/contextLib";
import Game1 from '../../../components/game/game';

export default function GamePage({children}) {
  const router = useRouter();

  const { game } = router.query;

  const gameConfig = useRef(new GameConfig(game as string));

  const [isFetchingTeam, setIsFetchingTeam] = useState(true);
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
    if (!gameConfig.current) {
      return;
    }

    socket.on(`${gameConfig.current.getEventPrefix()}-group-info`, handleNewGroupInfo);

    return () => {
      socket.off(`${gameConfig.current.getEventPrefix()}-group-info`, handleNewGroupInfo);
    };
  }, [gameConfig]);

  useEffect(() => {
    if (!gameConfig || !token) {
      return;
    }
    socket.emit(`${gameConfig.current.getEventPrefix()}-join-group-room`, {token});
  }, [gameConfig.current]);

  return (<>
    <Navbar />
      <div className='p-6'>
        <Card className='p-6'>
          {
            !isFetchingTeam && <Game1
              team={team}
              setTeam={setTeam}
              socket={socket}
              gameConfig={gameConfig.current}
              token={token}
            ></Game1>
          }
        </Card>
      </div>
    <Footer />
  </>);
}
