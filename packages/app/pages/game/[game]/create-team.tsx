import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import IOSocket from "socket.io-client";
import { Card } from '@mui/material';

import GameConfig, { GameRoutes } from "../../../libs/game-config";
import Game from "../../../libs/constants/game-enum";
import Navbar from '../../../components/navbar';
import Footer from '../../../components/Footer';
import { baseURL } from "../../../constants/api-url";
import { useAppContext } from "../../../libs/contextLib";
import CreateGroup from '../../../components/game/create-group';

export default function GamePage({children}) {
  const router = useRouter();

  const { game } = router.query;

  const gameConfig = new GameConfig(game as Game);

  const [isFetchingTeam, setIsFetchingTeam] = useState(true);
  const [team, setTeam] = useState(null);

  const [socket] = useState(() =>
    IOSocket(baseURL, {
      withCredentials: true,
      transports: ["websocket"],
    })
  );
  const { token } = useAppContext();

  function handleCreateGroup(name: string) {
    setIsFetchingTeam(true);
    socket.emit(`${gameConfig.getGame()}-create-group`, {token, name});
  }

  function handleNewGroupInfo(info) {
    if (info) {
      router.push(gameConfig.getRoutes()[GameRoutes.LOBBY]);
    }
    setIsFetchingTeam(false);
  }

  useEffect(() => {
    if (!gameConfig.getGame()) {
      return;
    }

    socket.on(`${gameConfig.getGame()}-group-info`, handleNewGroupInfo);

    return () => {
      socket.off(`${gameConfig.getGame()}-group-info`, handleNewGroupInfo);
    };
  }, [team, gameConfig]);

  return (<>
    <Navbar />
      <div className='p-6'>
        <Card className='p-6'>
          <CreateGroup gameConfig={gameConfig} socket={socket} handleCreateGroup={handleCreateGroup}></CreateGroup>
        </Card>
      </div>
    <Footer />
  </>);
}
