/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from 'next/router';

import IOSocket from "socket.io-client";

// import ChatApp from './chat';

import Navbar from "../../components/navbar";
import Footer from "../../components/Footer";
import { baseURL } from "../../constants/api-url";
import { EVENTS_PREFIX, END_DATE } from "../../constants/hard-to-click";

import RequireAuth from "../../libs/RequireAuth";
import { useAppContext } from "../../libs/contextLib";

export const HardToClickRoutes = {
  start: "/duro-de-clicar/inicio",
  lobby: "/duro-de-clicar/lobby",
  joinTeam: "/duro-de-clicar/entrar",
  createTeam: "/duro-de-clicar/criar",
  link: "/duro-de-clicar/link",
  game: "/duro-de-clicar/jogo",
  end: "/duro-de-clicar/fim",
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
  const { token } = useAppContext();

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
      if (team.completedQuestions.length === 19)
        router.push(HardToClickRoutes.end);
      setTeam({
        ...team,
        completedQuestions: [...team.completedQuestions, index],
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
      value={{ team, setTeam, isFetchingTeam }}
    />
  );
}

export function useTeam() {
  return useContext(teamContext);
}

function HardToClick() {
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
    router.push(HardToClickRoutes.start);
  } else {
    router.push(HardToClickRoutes.end);
  }

  return (
    <>
      <Navbar />
      <SocketProvider>
        <TeamProvider>
          <div className="HardToClick-page__root">
            <main className="HardToClick-page__main">
              {/* <aside className="HardToClick-page__sidenav">
                <VerticalStepper collapseButton={collapseButton} />
              </aside> */}
              <div className="HardToClick-page__card">
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

export default RequireAuth(HardToClick);
