import React from "react";
import { Switch, Route, Redirect, useHistory } from "react-router-dom";

import IOSocket from "socket.io-client";

import RiddlethonStart from "./start";
import RiddlethonLobby from "./lobby";
import RiddlethonJoinTeam from "./join/join";
import RiddlethonCreateTeam from "./create";
import RiddlethonLink from "./link";
import RiddlethonGame from "./game";
import RiddlethonEnd from "./end";

// import ChatApp from './chat';

import Header from "../../components/header";
import Footer from "../../components/footer";
import { baseURL } from "../../constants/api-url";
import { useSelector } from "react-redux";
import { EVENTS_PREFIX, END_DATE } from "../../constants/riddlethon";

import "./style.css";

export const RiddlethonRoutes = {
  start: "/riddlethon/inicio",
  lobby: "/riddlethon/lobby",
  joinTeam: "/riddlethon/entrar",
  createTeam: "/riddlethon/criar",
  link: "/riddlethon/link",
  game: "/riddlethon/jogo",
  end: "/riddlethon/fim",
};

const socketContext = React.createContext();
const teamContext = React.createContext();

export function useSocket() {
  const socketInstance = React.useContext(socketContext);
  return socketInstance;
}

function SocketProvider(props) {
  const [socket] = React.useState(() =>
    IOSocket(baseURL, {
      withCredentials: true,
      transports: ["websocket"],
    })
  );
  const token = useSelector((state) => state.auth.token);

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
  // React.useEffect(() => {
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
  const [isFetchingTeam, setIsFetchingTeam] = React.useState(true);
  const [team, setTeam] = React.useState(null);
  const history = useHistory();

  React.useEffect(() => {
    function handleNewGroupInfo(info) {
      setTeam(info);
      setIsFetchingTeam(false);
    }

    function handleNewCorrectAnswer({ index, correct }) {
      if (!correct) return;
      if (team.completedQuestions.length === 19)
        history.push(RiddlethonRoutes.gameover);
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

  React.useEffect(() => {
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
  return React.useContext(teamContext);
}

function Riddlethon() {
  const [isHappening, setIsHappening] = React.useState(verifyIfIsHappening());

  function verifyIfIsHappening() {
    if (new Date(Math.max(Date.now() - END_DATE, 0)).getTime() > 0) {
      return false;
    }
    return true;
  }

  React.useEffect(() => {
    const handler = setInterval(() => {
      if (!verifyIfIsHappening) {
        setIsHappening(false);
        clearInterval(handler);
      }
    }, 1000);
    return () => clearInterval(handler);
  }, []);

  return (
    <>
      <Header />
      <SocketProvider>
        <TeamProvider>
          <div className="Riddlethon-page__root">
            <main className="Riddlethon-page__main">
              {/* <aside className="Riddlethon-page__sidenav">
                <VerticalStepper collapseButton={collapseButton} />
              </aside> */}
              <div className="Riddlethon-page__card">
                {/* <Button onClick={handleCollapse} style={{ alignSelf: 'flex-start' }}>
                  {collapseButton ? (
                    <MenuOpenIcon style={{ fontSize: 40 }} />
                  ) : (
                    <MenuIcon style={{ fontSize: 40 }} />
                  )}
                </Button> */}
                {isHappening ? (
                  <Switch>
                    <Route
                      exact
                      path={RiddlethonRoutes.start}
                      component={RiddlethonStart}
                    />
                    <Route
                      exact
                      path={RiddlethonRoutes.lobby}
                      component={RiddlethonLobby}
                    />
                    <Route
                      exact
                      path={RiddlethonRoutes.joinTeam}
                      component={RiddlethonJoinTeam}
                    />
                    <Route
                      exact
                      path={RiddlethonRoutes.createTeam}
                      component={RiddlethonCreateTeam}
                    />
                    <Route
                      exact
                      path={RiddlethonRoutes.link}
                      component={RiddlethonLink}
                    />
                    <Route
                      exact
                      path={RiddlethonRoutes.game}
                      component={RiddlethonGame}
                    />
                    <Route
                      exact
                      path={RiddlethonRoutes.end}
                      component={RiddlethonEnd}
                    />
                    <Redirect to={RiddlethonRoutes.start} />
                  </Switch>
                ) : (
                  <RiddlethonEnd />
                )}
              </div>
            </main>
          </div>
        </TeamProvider>
      </SocketProvider>
      <Footer />
    </>
  );
}

export default Riddlethon;
