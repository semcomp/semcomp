import Link from "next/link";

import GameConfig, { GameRoutes } from "../../libs/game-config";

function GameStart({ gameConfig }: { gameConfig: GameConfig }) {
  return (
    <>
      <div className="flex flex-col">
        <h1 className="text-4xl text-center pb-4">Riddle</h1>
        <p>
          Os Riddles da SEMCOMP marcam presença, mais uma vez, como um dos
          concursos clássicos do nosso evento. São enigmas compostos por uma (ou
          duas) frases, juntos de uma imagem, que combinadas formam uma senha.
          Seu objetivo, jovem gafanhoto, é completar a maior quantidade de
          Riddles até o final da semana!
        </p>
        <br />
        <p>
          Lembrando: o concurso é individual e quem conseguir resolver mais
          enigmas até a cerimônia de encerramento será grandemente recompensado!
          Então o que você está esperando? Abuse do Google, deixe o espírito
          Sherlock Holmes tomar conta de você e desvende nossos desafios!
        </p>
        <br />
        <div className="text-left"></div>
        <p>O jogo começa dia 26/09 às 12h! Divirta-se =)</p>
        <br />
        <p>
          <b>&gt;&gt;&gt; Como jogar</b>
        </p>
        <p>
          <b>Siga o seguinte algoritmo:</b>
        </p>
        <ol style={{ listStyleType: "decimal", marginLeft: "2rem" }}>
          <li>Analise a imagem e leia os textos</li>
          <li>Coloque a senha</li>
          <li>Perceba que a senha está errada</li>
          <li>Volte para 1</li>
        </ol>
        <br />
        <p>
          Você deve colocar a senha na caixa de texto abaixo do riddle. Após
          digitá-la, pressione <i>Enter</i>. Se nada acontecer, a senha estava
          errada, então, tente novamente...
        </p>
        <br />
        <p>
          Lembrando que as senhas são todas em letras minúsculas e caracteres
          ASCII.
        </p>
        <br />
        <p>
          Subversivos. Salvadores da Semcomp. Sempre Solícitos.
          <br /> - S.
        </p>
        <div className="flex justify-center">
          <button className="bg-tertiary text-white text-lg md:text-2xl m-2 p-2 md:p-4 rounded-2xl hover:bg-secondary hover:text-black w-fit">
            <Link href={gameConfig.getRoutes()[GameRoutes.BASE]}>Jogar</Link>
          </button>
        </div>
      </div>
    </>
  );
}

export default GameStart;
