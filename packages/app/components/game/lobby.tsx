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
  teammatesContainer: "mb-8 border border-white/30 rounded-lg p-4 overflow-y-auto bg-white/10 backdrop-blur-sm",
};

function Teammate({ gameConfig, setTeam, name, thisIsMe }: { gameConfig: GameConfig, setTeam: any, name: any, thisIsMe: any }) {
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
    <div className="px-4 py-3 text-left flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/20 transition-colors">
      <span className="text-white font-medium">
        {name}
        {thisIsMe && " (você)"}
      </span>
      {thisIsMe && (
        <button
          onClick={open}
          className="text-white/70 hover:text-white p-1 rounded-full hover:bg-white/20 transition-colors"
        >
          <CloseIcon fontSize="small" />
        </button>
      )}
      <Dialog open={isModalOpen} onClose={close}>
        <div className="p-6 bg-white rounded-lg">
          <div className="mb-4 text-gray-800 font-medium">Sair da Equipe</div>
          <div className="mb-6 text-gray-600">Você tem certeza que quer sair da equipe?</div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outlined"
              onClick={close}
              className="text-gray-600 border-gray-300"
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={remove}
              disabled={isRemoving}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isRemoving ? <Spinner size="small" strokeWidth={2} /> : "Sair"}
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
      toast.success("ID copiado!");
    } catch (e) {
      toast.error("Não foi possível copiar");
    }
  }

  return (
    <div className="mt-4">
      <div className="text-white/80 text-sm mb-2">ID da Equipe:</div>
      <div
        onClick={clipboardCopy}
        className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/20 transition-colors cursor-pointer"
      >
        <code className="text-white font-mono text-sm break-all flex-1">
          {text}
        </code>
        <div className="text-white/60 ml-2">📋</div>
      </div>
    </div>
  );
}

function Countdown({ team, gameConfig, onSubmit }: { gameConfig: GameConfig, team: any, onSubmit: any }) {
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

  return (
    <div className="mt-6 p-6 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 text-center">
      {diff.getTime() > 0 ? (
        <div>
          <div className="text-white font-bold text-lg mb-4">⏰ Jogo Inicia Em</div>
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="bg-white/20 rounded-lg p-3">
              <div className="text-2xl font-bold text-white">{days}</div>
              <div className="text-xs text-white/70">Dias</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <div className="text-2xl font-bold text-white">{hours}</div>
              <div className="text-xs text-white/70">Horas</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <div className="text-2xl font-bold text-white">{minutes}</div>
              <div className="text-xs text-white/70">Minutos</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <div className="text-2xl font-bold text-white">{seconds}</div>
              <div className="text-xs text-white/70">Segundos</div>
            </div>
          </div>
        </div>
      ) : gameConfig.getEndDate() < new Date(Date.now()) ? (
        <div>
          <div className="text-red-300 font-bold text-lg"> Evento Encerrado</div>
          <div className="text-white/70 mt-2">O jogo já terminou. Obrigado por participar!</div>
        </div>
      ) : (
        <div>
          <div className="text-green-300 font-bold text-lg mb-4"> Jogo Disponível!</div>
          <Button
            variant="contained"
            onClick={onSubmit}
            size="large"
            className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-bold"
          >
            Iniciar Jogo
          </Button>
        </div>
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
    return team.id;
  }

  function renderTeammates() {
    return team.members.map((mate) => (
      <Teammate
        gameConfig={gameConfig}
        setTeam={setTeam}
        name={mate.name}
        key={mate.id}
        thisIsMe={mate.id === me.id}
      />
    ));
  }

  const [socket] = useState(() =>
    IOSocket(baseURL, {
      withCredentials: true,
      transports: ["websocket"],
    }));

  const { token } = useAppContext();

  function enterGame() {
    if (!team) {
      const name = me.email;
      socket.emit(`${gameConfig.getEventPrefix()}-create-group`, { token, name });
      socket.on(`${gameConfig.getEventPrefix()}-group-info`, (info) => {
        setTeam(info)
      });
    }
    router.push(gameConfig.getRoutes()[GameRoutes.PLAY]);
  }

  return (
    <div className="w-full flex flex-col justify-center items-center p-6 select-none">
      <div className="w-full text-center mb-8">
        <h1 className="font-primary text-5xl md:text-6xl text-white mb-4">
          {gameConfig.getTitle()}
        </h1>
        <div className="w-16 h-1 bg-white mx-auto rounded-full"></div>
      </div>

      <div className="w-full font-secondary whitespace-pre-wrap text-white">
        <div className="text-center mb-8 text-lg">
          {gameConfig.getDescription()}
        </div>

        <div className="mb-8 p-6 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
          <h2 className="w-full text-center font-bold text-xl mb-4">Como Jogar</h2>
          <div className="text-white/90 leading-relaxed">
            {gameConfig.getRules()}
          </div>
        </div>

        {gameConfig.hasGroups() ? (
          !team ? (
            <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              <div className="text-4xl mb-4">👥</div>
              <div className="text-lg mb-6">
                Você ainda não está numa equipe. Crie uma equipe para jogar ou entre em uma equipe existente.
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={goToCreateTeam}
                  variant="contained"
                  size="large"
                  className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-bold"
                >
                  Criar Equipe
                </Button>
                <Button
                  onClick={goToJoinTeam}
                  variant="outlined"
                  size="large"
                  className="border-white text-white hover:bg-white/10 px-8 py-3 rounded-lg font-bold"
                >
                  Entrar em Equipe
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="p-6 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                <h3 className="text-center font-bold text-xl mb-6">👥 Sua Equipe</h3>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {renderTeammates()}
                </div>

                <div className="mt-6">
                  {canAddTeammates() ? (
                    <div>
                      <div className="text-white/80 mb-2">
                        Compartilhe o ID da equipe para adicionar mais membros
                        (máximo de {gameConfig.getMaximumNumberOfMembersInGroup()} membros)
                      </div>
                      <CopyableLink text={createInviteLink()} />
                    </div>
                  ) : (
                    <div className="text-center p-4 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                      <div className="text-yellow-200 font-medium">
                        Sua equipe já atingiu o máximo de {gameConfig.getMaximumNumberOfMembersInGroup()} membros
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Countdown
                gameConfig={gameConfig}
                team={team}
                onSubmit={goToGame}
              />
            </div>
          )
        ) : (
          <Countdown
            gameConfig={gameConfig}
            team={team}
            onSubmit={enterGame}
          />
        )}
      </div>
    </div>
  );
}

export default Lobby;
