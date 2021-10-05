import React from "react";

import { useTeam } from "..";
import { NUMBER_OF_QUESTIONS } from "../../../constants/riddle";

function RiddleEnd() {
  const { team } = useTeam();

  let teamCurrentQuestionIndex = 0;
  if (team.completedQuestionsIndexes.length > 0) {
    teamCurrentQuestionIndex =
      team.completedQuestionsIndexes.reduce((a, b) =>
        a.index > b.index ? a : b
      ).index + 1;
  }
  const completedQuestions = teamCurrentQuestionIndex || 0;

  return (
    <div className="Riddle-page__root">
      <div className="Riddle-page__card-content">
        <h1>Fim de Jogo!</h1>
        {completedQuestions >= NUMBER_OF_QUESTIONS && (
          <>
            <br />
            <p>Parabéns, você finalizou o Riddle!</p>
          </>
        )}
        <br />
        <p>
          Não tem nada para olhar{" "}
          <a href="https://youtu.be/VBX4toeiGXQ">aqui</a>!
        </p>
        <br />
        <p>
          Até mais, aguarde a cerimônia de encerramento para descobrir quais
          foram as equipes vencedoras.
        </p>
      </div>
    </div>
  );
}

export default RiddleEnd;
