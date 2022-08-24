/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import { useRouter } from 'next/router'

import Button from '@mui/material/Button';
import { toast } from "react-toastify";

import API from "../../../api";
import { useTeam } from "..";
import Spinner from "../../../components/spinner";
import { RiddleRoutes } from "..";
import { START_DATE, NUMBER_OF_QUESTIONS } from "../../../constants/riddle";

function Countdown({ target, onSubmit }) {
  const targetMilisseconds = target.getTime();

  const [diff, setDiff] = React.useState(calculateDiff());
  const { team, setTeam, isFetchingTeam, setIsFetchingTeam } = useTeam();

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

  let teamCurrentQuestionIndex = 0;
  if (team && team.completedQuestionsIndexes.length > 0) {
    teamCurrentQuestionIndex =
      team.completedQuestionsIndexes.reduce((a, b) =>
        a.index > b.index ? a : b
      ).index + 1;
  }
  if (team && teamCurrentQuestionIndex === NUMBER_OF_QUESTIONS) {
    return <div>Riddle já completo</div>;
  }

  async function leaveTeam() {
    if (isFetchingTeam) return;

    setIsFetchingTeam(true);
    try {
      await API.riddle.leaveTeam();
      setTeam(null);
      toast.success(`Inscrição removida com sucesso`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsFetchingTeam(false);
    }
  }

  return (
    <div className="countdown-component">
      {diff.getTime() > 0 ? (
        <>
          Riddle disponível em
          <br />
          {days} dias, {hours} horas, {minutes} minutos e {seconds} segundos
        </>
      ) : (
        <>
          <div>Riddle já disponível!</div>
          <Button
            variant="contained"
            onClick={onSubmit}
            style={{ backgroundColor: "#045079", color: "white" }}
          >
            Jogar
          </Button>
        </>
      )}
      {/* <Button
        variant='contained'
        onClick={leaveTeam}
        style={{ backgroundColor: '#045079', color: 'white', marginTop: '1rem' }}
      >Remover Inscrição</Button> */}
    </div>
  );
}

function RiddleLobby() {
  const { team, setTeam, isFetchingTeam, setIsFetchingTeam } = useTeam();
  const router = useRouter()

  function goToGame() {
    router.push(RiddleRoutes.game);
  }
  async function goToCreateTeam() {
    if (isFetchingTeam) return;

    setIsFetchingTeam(true);
    try {
      const createdTeam = (await API.riddle.createTeam()).data;
      setTeam(createdTeam);
      toast.success(`Inscrição realizada com sucesso`);
    } catch (error) {
      console.error(error);
    } finally {
      setIsFetchingTeam(false);
    }
  }

  if (isFetchingTeam) return <Spinner size="large" />;

  if (!team)
    return (
      <div>
        Você ainda não está inscrito. Se inscreva abaixo.
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
            Inscrever-se
          </Button>
        </div>
      </div>
    );

  return (
    <div>
      <Countdown onSubmit={goToGame} target={START_DATE} />
    </div>
  );
}

export default RiddleLobby;
