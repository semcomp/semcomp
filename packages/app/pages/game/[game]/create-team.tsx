import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import IOSocket from "socket.io-client";
import { Card } from '@mui/material';

import GameConfig, { GameRoutes } from "../../../libs/game-config";
import Game from "../../../libs/constants/games";
import Navbar from '../../../components/navbar';
import Sidebar from '../../../components/sidebar';
import Footer from '../../../components/Footer';
import { baseURL } from "../../../constants/api-url";
import { useAppContext } from "../../../libs/contextLib";
import CreateGroup from '../../../components/game/create-group';
import API from "../../../api";

export default function GamePage({children}) {
  const router = useRouter();

  const [gameConfig, setGameConfig] = useState(null);
  const { game } =  router.query;
  async function fetchGameConfig() {
    try {
      const result = await API.game.getConfig(game as string);
      
      if(result.data){
        const gameConfigInstance = new GameConfig(result.data);
        setGameConfig(gameConfigInstance);  // Agora você passa a instância da classe
      }
    } catch (e) {
      console.error(e);
    } finally {
    }
  }

  const [isFetchingTeam, setIsFetchingTeam] = useState(true);
  const [team, setTeam] = useState(null);

  const [socket] = useState(() =>
    IOSocket(baseURL, {
      withCredentials: true,
      transports: ["websocket"],
    }));
  const { token } = useAppContext();

  function handleCreateGroup(name: string) {
    setIsFetchingTeam(true);
    socket.emit(`${gameConfig.getEventPrefix()}-create-group`, {token, name});
  }

  function handleNewGroupInfo(info) {
    if (info) {
      router.push(gameConfig.getRoutes()[GameRoutes.LOBBY]);
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
  }, [team, gameConfig]);

  return (<>
    <Navbar />
    <Sidebar />
      <div className='p-6'>
        <Card className='p-6'>
          <CreateGroup gameConfig={gameConfig} socket={socket} handleCreateGroup={handleCreateGroup}></CreateGroup>
        </Card>
      </div>
    <Footer />
  </>);
}
