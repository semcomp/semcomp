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
import CreateGroup from '../../../components/game/create-group';
import Game1 from '../../../components/game/game';
import Lobby from '../../../components/game/lobby';
import JoinTeam from '../../../components/game/join-team';
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
    })
  );
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

  const [isHappening, setIsHappening] = useState(gameConfig.verifyIfIsHappening());

  // function verifyIfIsHappening() {
  //   console.log(new Date(Math.max(Date.now() - gameConfig.getStartDate().getTime(), 0)).getTime() > 0)
  //   if (new Date(Math.max(Date.now() - gameConfig.getStartDate().getTime(), 0)).getTime() > 0) {
  //     return false;
  //   }
  //   return true;
  // }

  useEffect(() => {
    const handler = setInterval(() => {
      if (!gameConfig.verifyIfIsHappening) {
        setIsHappening(false);
        clearInterval(handler);
      }
    }, 1000);
    return () => clearInterval(handler);
  }, []);

  // if (isHappening && router.asPath !== gameConfig.getRoutes()[GameRoutes.LOBBY]) {
  //   router.push(gameConfig.getRoutes()[GameRoutes.LOBBY]);
  // } else if (router.asPath !== gameConfig.getRoutes()[GameRoutes.GAME_OVER]) {
  //   router.push(gameConfig.getRoutes()[GameRoutes.GAME_OVER]);
  // }

  function handleNewCorrectAnswer({ index, correct }) {
    if (!correct) return;
    if (team.completedQuestions.length === gameConfig.getNumberOfQuestions()) {
      // router.push(gameConfig.getRoutes()[GameRoutes.GAME_OVER]);
    }
    setTeam({
      ...team,
      completedQuestions: [...team.completedQuestions, index],
    });
  }

  function handleGoToGame() {
    setComponent(<Game1
      setTeam={setTeam}
      team={team}
      socket={socket}
      gameConfig={gameConfig}
      token={token}
    ></Game1>)
    router.push(gameConfig.getRoutes()[GameRoutes.PLAY]);
  }

  function handleCreateGroup(name: string) {
    setIsFetchingTeam(true);
    socket.emit(`${gameConfig}-create-group`, {token, name});
  }

  function handleGoToCreateTeam() {
    setComponent(<CreateGroup gameConfig={gameConfig} socket={socket} handleCreateGroup={handleCreateGroup}></CreateGroup>);
  }

  function handleGoToJoinTeam() {
    setComponent(<JoinTeam></JoinTeam>);
  }

  function handleNewGroupInfo(info) {
    if (info) {
      setTeam(info);
      setTimeout(() => console.log(team), 1000)
    }
    setComponent(<Lobby
      gameConfig={gameConfig}
      team={info}
      goToGame={handleGoToGame}
      goToCreateTeam={handleGoToCreateTeam}
      goToJoinTeam={handleGoToJoinTeam}
    ></Lobby>)
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

  useEffect(() => {
    if (!gameConfig || component || !token) {
      return;
    }
    socket.emit(`${gameConfig.getEventPrefix()}-join-group-room`, {token});
    setComponent(<Lobby
      gameConfig={gameConfig}
      team={team}
      goToGame={handleGoToGame}
      goToCreateTeam={handleGoToCreateTeam}
      goToJoinTeam={handleGoToJoinTeam}
    ></Lobby>);
  }, [gameConfig]);

  return (<>
    <Navbar />
<Sidebar />
      <div className='p-6'>
        <Card className='p-6'>
          {
            !isFetchingTeam && component
          }
        </Card>
      </div>
    <Footer />
  </>);
}
