import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import IOSocket from "socket.io-client";
import { Card } from '@mui/material';

import GameConfig from "../../../libs/game-config";
import Game from "../../../libs/constants/game-enum";
import Navbar from '../../../components/navbar';
import Footer from '../../../components/Footer';
import { baseURL } from "../../../constants/api-url";
import { useAppContext } from "../../../libs/contextLib";
import Game1 from '../../../components/game/game';

export default function GamePage({children}) {
  const router = useRouter();

  const { game } = router.query;

  const gameConfig = new GameConfig(game as Game);

  const [isFetchingTeam, setIsFetchingTeam] = useState(true);
  const [team, setTeam] = useState(null);

  const socket = IOSocket(baseURL, {
    withCredentials: true,
    transports: ["websocket"],
  });
  const { token } = useAppContext();

  const [component, setComponent] = useState(null);

  function send(eventType, ...args) {
    return socket.emit(eventType, token, ...args);
  }

  async function once(eventName) {
    return new Promise((resolve) => {
      socket.once(eventName, resolve);
    });
  }

  const on = socket.on.bind(socket);
  const off = socket.off.bind(socket);

  function handleNewGroupInfo(info) {
    setTeam(info);
    setIsFetchingTeam(false);
  }

  useEffect(() => {
    if (team) {
      setComponent(<Game1
        team={team}
        socket={socket}
        gameConfig={gameConfig}
        token={token}
      ></Game1>);
    }
  }, [team]);

  useEffect(() => {
    if (!gameConfig.getGame()) {
      return;
    }

    socket.on(`${gameConfig.getGame()}-group-info`, handleNewGroupInfo);

    return () => {
      socket.off(`${gameConfig.getGame()}-group-info`, handleNewGroupInfo);
    };
  }, [gameConfig]);

  useEffect(() => {
    if (!gameConfig.getGame() || component || !token) {
      return;
    }
    socket.emit(`${gameConfig.getGame()}-join-group-room`, {token});
  }, [gameConfig]);

  return (<>
    <Navbar />
      {/* <div className='p-6'>
        <Card className='p-6'>
          {
            !isFetchingTeam && component
          }
        </Card>
      </div> */}
    <Footer />
  </>);
}
