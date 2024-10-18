import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

import { Button, Dialog } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { toast } from "react-toastify";

import IOSocket from "socket.io-client";
import { baseURL } from "../../constants/api-url";

import API from "../../api";
import Spinner from "../spinner";
import { useAppContext } from "../../libs/contextLib";
import GameConfig, { GameRoutes } from "../../libs/game-config";

const styles = {
  teammatesContainer: "mb-8 border rounded-lg p-2 overflow-y-auto",
};

function Teammate({ gameConfig, setTeam, name, thisIsMe }: {gameConfig: GameConfig, setTeam: any, name: any, thisIsMe: any}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  function close() {
    setIsModalOpen(false);
  }

  function open() {
    setIsModalOpen(true);
  }

  async function remove() {
    if (isRemoving) return;

    setIsRemoving(true);
    try {
      await API.game.leaveTeam(gameConfig.getEventPrefix);
      setTeam(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRemoving(false);
    }
  }

  return (
    <div className="px-4 py-2 text-left flex items-center justify-between">
      <span>
        {name}
        {thisIsMe && " (eu)"}
      </span>
      {thisIsMe && <CloseIcon onClick={open} className="cursor-pointer" />}
      <Dialog open={isModalOpen} onClose={close}>
        <div className="p-4">
          <div className="mb-4">Você tem certeza que quer sair da equipe?</div>
          <div className="w-full flex justify-end">
            <Button
              variant="contained"
              style={{
                backgroundColor: "#045079",
                color: "white",
                margin: "0 4px",
              }}
              onClick={close}
            >
              Não
            </Button>
            <Button
              variant="contained"
              style={{
                backgroundColor: "#045079",
                color: "white",
                margin: "0 4px",
              }}
              onClick={remove}
            >
              Sim{" "}
              {isRemoving && (
                <Spinner size="small" strokeWidth={2} className="ml-2" />
              )}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

function CopyableLink({ text }) {
  async function clipboardCopy() {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Link copiado!");
    } catch (e) {
      toast.error("O link não pôde ser copiado");
    }
  }

  return (
    <div
      onClick={clipboardCopy}
      className="overflow-x-auto whitespace-no-wrap border p-2 rounded-lg cursor-pointer"
    >
      {text}
    </div>
  );
}

function Countdown({ team, gameConfig, onSubmit }: {gameConfig: GameConfig, team: any, onSubmit: any}) {
  const targetMilliseconds = gameConfig.getStartDate().getTime();

  const [diff, setDiff] = useState(calculateDiff());

  const days = diff.getUTCDate() - 1;
  const hours = diff.getUTCHours();
  const minutes = diff.getUTCMinutes();
  const seconds = diff.getUTCSeconds();

  function calculateDiff() {
    return new Date(Math.max(gameConfig.getStartDate().getTime() - Date.now(), 0));
  }

  useEffect(() => {
    const handler = setInterval(() => setDiff(calculateDiff()), 1000);
    return () => clearInterval(handler);
  }, [targetMilliseconds]);

  useEffect(() => {
    if(team) console.log(team);
  }, [team]);
  
  return (
    <div className="countdown-component">
      {   
        diff.getTime() > 0 ? (
        <>
          Disponível em
          <br />
          {days} dias, {hours} horas, {minutes} minutos e {seconds} segundos
        </>
      ) : gameConfig.getEndDate() < new Date( Date.now()) ? 
      (
        <>
          <p>O evento encerrou!</p>
        </>
      )
      : (
        <>
          <div className="py-4">{gameConfig.getName()} já disponível!</div>
          <Button
            variant="contained"
            onClick={onSubmit}
            style={{ backgroundColor: "#171214", color: "white" }}
          >
            Jogar
          </Button>
        </>
      )}
    </div>
  );
}

function Lobby({
  setTeam,
  team,
  gameConfig,
  goToGame,
  goToCreateTeam,
  goToJoinTeam,
}: { gameConfig: GameConfig } & any) {
  const { user: me } = useAppContext();
  const router = useRouter();
  function canAddTeammates() {
    if (team.members.length >= gameConfig.getMaximumNumberOfMembersInGroup()) return false;
    return true;
  }

  function createInviteLink() {
    return (
      team.id
    );
  }

  function renderTeammates() {
    console.log("Render :",team)
    return team.members.map((mate) => (
      <Teammate gameConfig={gameConfig} setTeam={setTeam} name={mate.name} key={mate.id} thisIsMe={mate.id === me.id} />
    ));
  }

  const [socket] = useState(() =>
    IOSocket(baseURL, {
      withCredentials: true,
      transports: ["websocket"],
    }));

    const { token } = useAppContext();

    function enterGame(){
        console.log(team);
        if (!team) {
            // Criar o time quando não houver um
            //Verificar se a pessoa já está em um

            const name = me.email;
            
            socket.emit(`${gameConfig.getEventPrefix()}-create-group`, { token, name });
            socket.on(`${gameConfig.getEventPrefix()}-group-info`, (info)=> {
                setTeam(info)
            });
        }

        router.push(gameConfig.getRoutes()[GameRoutes.PLAY]);
    }

    return (
        <div className="w-full flex flex-col justify-center items-center p-6 select-none">
            <div className="w-full text-center">
              <h1 className="font-primary text-6xl">{gameConfig.getTitle()}</h1>
            </div>
            <div className="w-full font-secondary whitespace-pre-wrap">
              <div className="text-center mb-6">
                {gameConfig.getDescription()}
              </div>
              <h2 className="w-full text-center font-bold">Como Jogar</h2>
              <div className="flex felx-row items-center justify-center h-fit w-full text-left mb-6">
                <div>
                  {gameConfig.getRules()}
                </div>
              </div>
              {
                gameConfig.hasGroups() ?
                !team ?
                <div>
                  Você ainda não está numa equipe. Crie uma equipe para jogar. Caso você queira entrar em um grupo já existente peça para o criador do grupo enviar o link do grupo para você.
                  <div className="flex w-full justify-center mt-4">
                    <Button
                      onClick={goToCreateTeam}
                      style={{
                        backgroundColor: "#045079",
                        color: "white",
                        margin: "0 8px",
                      }}
                      variant="contained"
                    >
                      Criar
                    </Button>
                    <Button
                      onClick={goToJoinTeam}
                      style={{
                        backgroundColor: "#045079",
                        color: "white",
                        margin: "0 8px",
                      }}
                      variant="contained"
                    >
                      Entrar
                    </Button>
                  </div>
                </div>
                :
                  <div>
                     Sua equipe:
                     <div style={{ height: 144 }} className={styles.teammatesContainer}>
                       {renderTeammates()}
                     </div>
                     <div>
                       {canAddTeammates() ? (
                         <div className="mb-8">
                           Envie este id para adicionar mais pessoas à sua equipe. (máximo de
                           até {gameConfig.getMaximumNumberOfMembersInGroup()} membros)
                           <CopyableLink text={createInviteLink()} />
                         </div>
                       ) : (
                         <div className="mb-8">
                           Sua equipe já atingiu o máximo de {gameConfig.getMaximumNumberOfMembersInGroup()} membros
                         </div>
                       )}
                     </div>
                     <Countdown
                       gameConfig={gameConfig}
                       team={team}
                       onSubmit={goToGame}
                     />
                   </div>
                :
                <Countdown
                gameConfig={gameConfig}
                team={team}
                onSubmit={enterGame}
                />

              }
            </div>
        </div>
    );

  // return (
  //   
}

export default Lobby;
