/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from 'next/router';

import IOSocket from "socket.io-client";

import RiddleStart from "./start";
import RiddleLobby from "./lobby";
import RiddleGame from "./game";
import RiddleEnd from "./end";

import Header from "../../components/header";
import Footer from "../../components/footer";
import { baseURL } from "../../constants/api-url";
import { useSelector } from "react-redux";
import {
  EVENTS_PREFIX,
  END_DATE,
  NUMBER_OF_QUESTIONS,
} from "../../constants/riddle";

import "./style.css";

export const RiddleRoutes = {
  start: "/riddle/inicio",
  lobby: "/riddle/lobby",
  game: "/riddle/jogo",
  end: "/riddle/fim",
};

const socketContext = createContext(null);
const teamContext = createContext(null);

export function useSocket() {
  const socketInstance = useContext(socketContext);
  return socketInstance;
}

function SocketProvider(props) {
  const [socket] = useState(() =>
    IOSocket(baseURL, {
      withCredentials: true,
      transports: ["websocket"],
    })
  );
  const token = useSelector((state: any) => state.auth.token);

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

  // Debugging tools
  // useEffect(() => {
  // 	socket.on('message', message => console.log('RECEBI MENSAGEM', message));
  // 	socket.on('error-message', message => console.log('RECEBI ERRO', message));
  // }, []);

  return (
    <socketContext.Provider
      {...props}
      value={{ send, on, once, off, raw: socket }}
    />
  );
}

function TeamProvider(props) {
  const socket = useSocket();
  const [isFetchingTeam, setIsFetchingTeam] = useState(true);
  const [team, setTeam] = useState(null);
  const router = useRouter();

  useEffect(() => {
    function handleNewGroupInfo(info) {
      setTeam(info);
      setIsFetchingTeam(false);
    }

    function handleNewCorrectAnswer({ index, correct }) {
      if (!correct) return;
      let teamCurrentQuestionIndex = 0;
      if (team.completedQuestionsIndexes.length > 0) {
        teamCurrentQuestionIndex =
          team.completedQuestionsIndexes.reduce((a, b) =>
            a.index > b.index ? a : b
          ).index + 1;
      }
      if (teamCurrentQuestionIndex === NUMBER_OF_QUESTIONS)
        router.push(RiddleRoutes.end);
      setTeam({
        ...team,
        completedQuestionsIndexes: [...team.completedQuestionsIndexes, index],
      });
    }

    socket.on(`${EVENTS_PREFIX}group-info`, handleNewGroupInfo);
    socket.on(`${EVENTS_PREFIX}correct-answer`, handleNewCorrectAnswer);

    return () => {
      socket.off(`${EVENTS_PREFIX}group-info`, handleNewGroupInfo);
      socket.off(`${EVENTS_PREFIX}correct-answer`, handleNewCorrectAnswer);
    };
  }, [team]);

  useEffect(() => {
    setIsFetchingTeam(true);
    socket.send(`${EVENTS_PREFIX}join-group-room`);
  }, []);

  return (
    <teamContext.Provider
      {...props}
      value={{ team, setTeam, isFetchingTeam, setIsFetchingTeam }}
    />
  );
}

export function useTeam() {
  return useContext(teamContext);
}

function Riddle() {
  const [isHappening, setIsHappening] = useState(verifyIfIsHappening());
  const router = useRouter();

  function verifyIfIsHappening() {
    if (new Date(Math.max(Date.now() - END_DATE.getTime(), 0)).getTime() > 0) {
      return false;
    }
    return true;
  }

  useEffect(() => {
    const handler = setInterval(() => {
      if (!verifyIfIsHappening) {
        setIsHappening(false);
        clearInterval(handler);
      }
    }, 1000);
    return () => clearInterval(handler);
  }, []);

  if (isHappening) {
    router.push(RiddleRoutes.start)
  } else {
    router.push(RiddleRoutes.end)
  }

  return (
    <>
      <Header />
      <SocketProvider>
        <TeamProvider>
          <div className="Riddle-page__root">
            <main className="Riddle-page__main">
              {/* <aside className="Riddle-page__sidenav">
                <VerticalStepper collapseButton={collapseButton} />
              </aside> */}
              <div className="Riddle-page__card">
                {/* <Button onClick={handleCollapse} style={{ alignSelf: 'flex-start' }}>
                  {collapseButton ? (
                    <MenuOpenIcon style={{ fontSize: 40 }} />
                  ) : (
                    <MenuIcon style={{ fontSize: 40 }} />
                  )}
                </Button> */}
              </div>
            </main>
          </div>
        </TeamProvider>
      </SocketProvider>
      <Footer />
    </>
  );
}

export default Riddle;
