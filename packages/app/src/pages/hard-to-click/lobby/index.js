import React from "react";

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import CloseIcon from "@material-ui/icons/HighlightOff";

import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

import API from "../../../api";
import { useTeam } from "..";
import Spinner from "../../../components/spinner";
import { HardToClickRoutes } from "..";
import { START_DATE } from "../../../constants/hard-to-click";

import "./style.css";

const styles = {
  teammatesContainer: "mb-8 border rounded-lg p-2 overflow-y-auto",
};

function Teammate({ name, thisIsMe }) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isRemoving, setIsRemoving] = React.useState(false);
  const { setTeam } = useTeam();

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
      await API.hardToClick.leaveTeam();
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

function Countdown({ target, onSubmit }) {
  const targetMilisseconds = target.getTime();

  const [diff, setDiff] = React.useState(calculateDiff());
  const { team } = useTeam();

  const days = diff.getUTCDate() - 1;
  const hours = diff.getUTCHours();
  const minutes = diff.getUTCMinutes();
  const seconds = diff.getUTCSeconds();

  function calculateDiff() {
    return new Date(Math.max(target - Date.now(), 0));
  }

  React.useEffect(() => {
    const handler = setInterval(() => setDiff(calculateDiff()), 1000);
    return () => clearInterval(handler);
  }, [targetMilisseconds]);

  if (team && team.completedQuestionsIndexes.length === 20) {
    return <div>Duro de Clicar já completo</div>;
  }

  return (
    <div className="countdown-component">
      {diff.getTime() > 0 ? (
        <>
          Disponível em
          <br />
          {days} dias, {hours} horas, {minutes} minutos e {seconds} segundos
        </>
      ) : (
        <>
          <div>Duro de Clicar já disponível!</div>
          <Button
            variant="contained"
            onClick={onSubmit}
            style={{ backgroundColor: "#045079", color: "white" }}
          >
            Jogar
          </Button>
        </>
      )}
    </div>
  );
}

function HardToClickLobby() {
  const { team, isFetchingTeam } = useTeam();
  const me = useSelector((state) => state.auth.user);
  const history = useHistory();

  function canAddTeammates() {
    if (isFetchingTeam || team.members.length >= 3) return false;
    return true;
  }

  function goToGame() {
    history.push(HardToClickRoutes.game);
  }

  function createInviteLink() {
    return (
      window.location.origin + HardToClickRoutes.link + "?teamid=" + team._id
    );
  }

  function renderTeammates() {
    if (isFetchingTeam)
      return (
        <div>
          <Spinner strokeWidth={2} className="mt-4" />
        </div>
      );
    return team.members.map((mate) => (
      <Teammate name={mate.name} key={mate._id} thisIsMe={mate._id === me.id} />
    ));
  }

  function goToCreateTeam() {
    history.push(HardToClickRoutes.createTeam);
  }

  function goToJoinTeam() {
    history.push(HardToClickRoutes.joinTeam);
  }

  if (isFetchingTeam) return <Spinner size="large" />;

  if (!team)
    return (
      <div>
        Você ainda não está numa equipe. Crie uma equipe para jogar.
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
    );

  return (
    <div>
      Sua equipe:
      <div style={{ height: 144 }} className={styles.teammatesContainer}>
        {renderTeammates()}
      </div>
      <div>
        {canAddTeammates() ? (
          <div className="mb-8">
            Envie este link para adicionar mais pessoas à sua equipe. (máximo de
            até 3 membros)
            <CopyableLink text={createInviteLink()} />
          </div>
        ) : (
          <div className="mb-8">
            Sua equipe já atingiu o máximo de 3 membros
          </div>
        )}
      </div>
      <Countdown onSubmit={goToGame} target={START_DATE} />
    </div>
  );
}

export default HardToClickLobby;
