type Game = {
  name: string;
  description: JSX.Element;
  slug: string;
  eventPrefix: string;
  startDate: Date;
  endDate: Date;
  numberOfQuestions: number;
}

const HARD_TO_CLICK_DESCRIPTION = <>
  <p>
    Os Riddles da SEMCOMP marcam presença, mais uma vez, como um dos
    concursos clássicos do nosso evento.São enigmas compostos por uma(ou
    duas) frases, juntos de uma imagem, que combinadas formam uma senha.
    Seu objetivo, jovem gafanhoto, é completar a maior quantidade de
    Riddles até o final da semana!
  </p>
  <br/>
  <p>
    Lembrando: o concurso é individual e quem conseguir resolver mais
    enigmas até a cerimônia de encerramento será grandemente recompensado!
    Então o que você está esperando ? Abuse do Google, deixe o espírito
    Sherlock Holmes tomar conta de você e desvende nossos desafios!
  </p>
  <br/>
  <p>O jogo começa dia 26 / 09 às 12h! Divirta - se =)</p>
  <br/>
  <p>
    <b>&gt;&gt;&gt; Como jogar</b>
  </p>
  <p>
    <b>Siga o seguinte algoritmo:</b>
  </p>
  <ol style = {{ listStyleType: "decimal", marginLeft: "2rem" }}>
    <li>Analise a imagem e leia os textos</li>
    <li>Coloque a senha</li>
    <li>Perceba que a senha está errada</li>
    <li>Volte para 1</li>
  </ol>
  <br/>
  <p>
    Você deve colocar a senha na caixa de texto abaixo do riddle. Após
    digitá - la, pressione <i>Enter</i>. Se nada acontecer, a senha estava
    errada, então, tente novamente...
  </p>
  <br/>
  <p>
    Lembrando que as senhas são todas em letras minúsculas e caracteres ASCII.
  </p>
  <br/>
  <p>
    Subversivos.Salvadores da Semcomp.Sempre Solícitos.
    <br/>
    - S.
  </p>
</>

export const HARD_TO_CLICK: Game = {
  name: 'Duro de Clicar',
  description: HARD_TO_CLICK_DESCRIPTION,
  slug: 'duro-de-clicar',
  eventPrefix: 'hard-to-click',
  startDate: new Date("2022-01-23 17:30"),
  endDate: new Date("2023-09-28 17:30"),
  numberOfQuestions: 58,
}

export const RIDDLETHON: Game = {
  name: 'Riddlethon',
  description: HARD_TO_CLICK_DESCRIPTION,
  slug: 'riddlethon',
  eventPrefix: 'riddlethon',
  startDate: new Date("2022-01-23 17:30"),
  endDate: new Date("2023-09-28 17:30"),
  numberOfQuestions: 58,
}

export const RIDDLE: Game = {
  name: 'Riddle',
  description: HARD_TO_CLICK_DESCRIPTION,
  slug: 'riddle',
  eventPrefix: 'riddle',
  startDate: new Date("2022-01-23 17:30"),
  endDate: new Date("2023-09-28 17:30"),
  numberOfQuestions: 58,
}

export default Game;
