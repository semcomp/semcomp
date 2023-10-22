import React from "react";

function End({gameConfig}) {

  return (
    <div className="HardToClick-page__root">
      <div className="HardToClick-page__card-content">
        <h1>Fim de Jogo!</h1>
          <>
            <br />
            <p>Parabéns, você finalizou o {gameConfig.getName()}!</p>
          </>
        <br />
        <br />
        <p>
          Até mais, aguarde a cerimônia de encerramento para descobrir quem foi o vencedor.
        </p>
      </div>
    </div>
  );
}

export default End;