import Link from 'next/link';

import GameConfig, { GameRoutes } from '../../libs/game-config';

function GameStart({gameConfig}: {gameConfig: GameConfig}) {
  return (<>
    <h1>Riddlethon</h1>
    <p>
      Seja bem-vinde ao Concurso mais singular da Semcomp Beta, sábio colega.
      Estou aqui para ser seu mentor e te ajudar a entender qual é sua tarefa.
      <br />
      <br />
      Sei que você logo irá perceber que a Semcomp está em ruínas, e que os
      coordenadores tentam, a todo custo, encriptar mensagens, de modo que
      isso dificulte minha missão de expor todo o mal que eles vêm semeando.
      <br />
      <br />
      Sinto informar que ano passado tentaram me parar, mas esse ano não vão
      me impedir, pois tenho a você, caro colega, que desde a Semcomp Beta,
      irá me ajudar. Então, vamos às regras do <b>Riddlethon</b>:
    </p>
    <br />
    <ul style={{ listStyle: "inside" }}>
      <li>
        será lhe dado um texto, onde faltam várias partes. Sua missão é
        descobrir as palavras que faltam e, no site da Semcomp, colocar a
        resposta final;
      </li>
      <li>
        a resposta final é dada por letras minúsculas, sem acento ou pontuação
        gráfica. Se a senha conter caracteres especiais (como hífen ou dois
        pontos) substitua por espaço (exemplo:{" "}
        <code>super-herói -{">"} super heroi</code>);
      </li>
      <li>
        se acertar, você recebe outro texto — se errar, tente novamente;
      </li>
      <li>
        se eu fosse você, tentaria chegar o mais longe possível pois lhe
        garanto que você será grandemente recompensado - lembre-se que você
        tem apenas 1 hora e 30 minutos;
      </li>
      <li>
        mesmo quando acaba, o jogo nunca termina - suspeite sempre do site da
        Semcomp.
      </li>
    </ul>
    <br />
    <p>
      Subversivos. Salvadores da Semcomp. Sempre Solícitos.
      <br /> - S.
    </p>
    <button className="bg-tertiary text-white text-lg md:text-2xl m-2 p-2 md:p-5 rounded-2xl hover:bg-secondary hover:text-black">
      <Link href={gameConfig.getRoutes()[GameRoutes.BASE]}>Jogar</Link>
    </button>
  </>);
}

export default GameStart;
