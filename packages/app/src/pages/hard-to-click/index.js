import React from "react";
import { Switch, Route, Redirect, useHistory } from "react-router-dom";

import IOSocket from "socket.io-client";

import HardToClickStart from "./start";
import HardToClickLobby from "./lobby";
import HardToClickJoinTeam from "./join/join";
import HardToClickCreateTeam from "./create";
import HardToClickLink from "./link";
import HardToClickGame from "./game";
import HardToClickEnd from "./end";

// import ChatApp from './chat';

import Header from "../../components/header";
import Footer from "../../components/footer";
import { baseURL } from "../../constants/api-url";
import { useSelector } from "react-redux";
import { EVENTS_PREFIX, END_DATE } from "../../constants/hard-to-click";

import "./style.css";

export const HardToClickRoutes = {
  start: "/duro-de-clicar/inicio",
  lobby: "/duro-de-clicar/lobby",
  joinTeam: "/duro-de-clicar/entrar",
  createTeam: "/duro-de-clicar/criar",
  link: "/duro-de-clicar/link",
  game: "/duro-de-clicar/jogo",
  end: "/duro-de-clicar/fim",
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
      transports: ["polling"],
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
      if (team.completedQuestionsIndexes.length === 19)
        history.push(HardToClickRoutes.gameover);
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

function HardToClick() {
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
                {isHappening ? (
                  <Switch>
                    <Route
                      exact
                      path={HardToClickRoutes.start}
                      component={HardToClickStart}
                    />
                    <Route
                      exact
                      path={HardToClickRoutes.lobby}
                      component={HardToClickLobby}
                    />
                    <Route
                      exact
                      path={HardToClickRoutes.joinTeam}
                      component={HardToClickJoinTeam}
                    />
                    <Route
                      exact
                      path={HardToClickRoutes.createTeam}
                      component={HardToClickCreateTeam}
                    />
                    <Route
                      exact
                      path={HardToClickRoutes.link}
                      component={HardToClickLink}
                    />
                    <Route
                      exact
                      path={HardToClickRoutes.game}
                      component={HardToClickGame}
                    />
                    <Route
                      exact
                      path={HardToClickRoutes.end}
                      component={HardToClickEnd}
                    />
                    <Redirect to={HardToClickRoutes.start} />
                  </Switch>
                ) : (
                  <HardToClickEnd />
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

export default HardToClick;
