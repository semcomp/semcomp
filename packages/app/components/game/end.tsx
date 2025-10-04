import React from "react";
import Confetti from 'react-confetti';

function End({gameConfig}) { 

  return (
    <>
      <Confetti className="z-50" width={window.innerWidth} height={window.innerHeight} recycle={false} />
      <div className="z-20 w-full flex flex-col items-center justify-center">
        <div className="flex flex-col items-center justify-center phone:w-full text-primary static rounded-lg z-20 bg-white p-12 w-full">
          <h1 className="font-primary text-6xl">Fim de Jogo!</h1>
            <div className="w-full font-secondary whitespace-pre-wrap">
              <p className="text-xl mb-8">Parabéns, você finalizou o {gameConfig.getTitle()}!</p>
              <p className="px-5">
                Até mais, aguarde a cerimônia de encerramento para descobrir quem foi o vencedor.
              </p>
            </div>
        </div>
      </div>
    </>
  );
}

export default End;