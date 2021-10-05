import React from "react";

import { useTeam } from "..";
import { NUMBER_OF_QUESTIONS } from "../../../constants/riddlethon";

function RiddlethonEnd() {
  const { team } = useTeam();

  const completedQuestions =
    (team &&
      team.completedQuestionsIndexes &&
      team.completedQuestionsIndexes.length) ||
    0;

  return (
    <div className="Riddlethon-page__root">
      <div className="Riddlethon-page__card-content">
        <h1>Fim de Jogo!</h1>
        {completedQuestions >= NUMBER_OF_QUESTIONS && (
          <>
            <br />
            <p>Parabéns, você finalizou o Riddlethon!</p>
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

export default RiddlethonEnd;
