import React from "react";

import { useTeam } from "..";
import { NUMBER_OF_QUESTIONS } from "../../../constants/hard-to-click";

function HardToClickEnd() {
  const { team } = useTeam();

  const completedQuestions =
    (team &&
      team.completedQuestions &&
      team.completedQuestions.length) ||
    0;

  return (
    <div className="HardToClick-page__root">
      <div className="HardToClick-page__card-content">
        <h1>Fim de Jogo!</h1>
        {completedQuestions >= NUMBER_OF_QUESTIONS && (
          <>
            <br />
            <p>Parabéns, você finalizou o Duro de Clicar!</p>
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

export default HardToClickEnd;
