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
import Game1 from '../../../components/game/game';
import Lobby from '../../../components/game/lobby';
import JoinTeam from '../../../components/game/join-team';

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

//   const [isHappening, setIsHappening] = useState(verifyIfIsHappening());

//   function verifyIfIsHappening() {
//     console.log(new Date(Math.max(Date.now() - gameConfig.getStartDate().getTime(), 0)).getTime() > 0)
//     if (new Date(Math.max(Date.now() - gameConfig.getStartDate().getTime(), 0)).getTime() > 0) {
//       return false;
//     }
//     return true;
//   }

//   useEffect(() => {
//     const handler = setInterval(() => {
//       if (!verifyIfIsHappening) {
//         setIsHappening(false);
//         clearInterval(handler);
//       }
//     }, 1000);
//     return () => clearInterval(handler);
//   }, []);

  // if (isHappening && router.asPath !== gameConfig.getRoutes()[GameRoutes.LOBBY]) {
  //   router.push(gameConfig.getRoutes()[GameRoutes.LOBBY]);
  // } else if (router.asPath !== gameConfig.getRoutes()[GameRoutes.GAME_OVER]) {
  //   router.push(gameConfig.getRoutes()[GameRoutes.GAME_OVER]);
  // }

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
      team={team}
      socket={socket}
      gameConfig={gameConfig}
      token={token}
    ></Game1>)
    router.push(gameConfig.getRoutes()[GameRoutes.PLAY]);
  }

  function handleCreateGroup(name: string) {
    setIsFetchingTeam(true);
    socket.emit(`${gameConfig.getGame()}-create-group`, {token, name});
  }

  function handleGoToCreateTeam() {
    setComponent(<CreateGroup gameConfig={gameConfig} socket={socket} handleCreateGroup={handleCreateGroup}></CreateGroup>);
  }

  function handleGoToJoinTeam() {
    setComponent(<JoinTeam></JoinTeam>);
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

  useEffect(() => {
    if (!gameConfig.getGame() || component || !token) {
      return;
    }
    socket.emit(`${gameConfig.getGame()}-join-group-room`, {token});
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
