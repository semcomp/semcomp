type Game = {
  name: string;
  description: JSX.Element;
  slug: string;
  eventPrefix: string;
  startDate: Date;
  endDate: Date;
  numberOfQuestions: number;
  maximumNumberOfMembersInGroup: number;
}

const RIDDLE_DESCRIPTION = <>
      <h1 style={{ fontSize: "40px", width: "100%", textAlign: "center", margin: "20px 0 20px 0" }}><b>Riddle</b></h1>
      <div>
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
        <p>O jogo começa dia 23/10 às 9h! Divirta-se =)</p>
        <br />
        <p style={{textAlign: "center"}}>
          <b>&gt;&gt;&gt; Como jogar</b>
        </p>
        <p style={{textAlign: "center"}}>
          <b>Siga o seguinte algoritmo:</b>
        </p>
        <div style={{textAlign: "left", width: "100%", display: "flex", alignItems: "center", justifyContent: "center"}}>
          <ol style={{ listStyleType: "decimal"}}>
            <li>Analise a imagem e leia os textos</li>
            <li>Coloque a senha</li>
            <li>Perceba que a senha está errada</li>
            <li>Volte para 1</li>
          </ol>

        </div>
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
        {/*<div>
          <p>
            Subversivos. Salvadores da Semcomp. Sempre Solícitos.
            <br /> - S.
          </p>
        </div> */}
    </div>
</>
const HARD_TO_CLICK_DESCRIPTION = <>
  <p>
    Seja bem-vinde ao Concurso mais sagaz da Semcomp Beta, meu solene
    colega. Estou aqui para ser seu mentor e te ajudar a entender qual é sua
    tarefa.
    <br />
    <br />
    Sei que você logo irá perceber que a Semcomp está em ruínas, e que os
    coordenadores tentam, a todo custo, esconder segredos, de modo que isso
    dificulte minha missão de expor todo o mal que eles vêm semeando.
    <br />
    <br />
    Sinto informar que ano passado tentaram me parar, mas esse ano não vão
    me impedir, pois tenho a você, caro colega, que desde a Semcomp Beta,
    irá me ajudar. Então, vamos às regras do <b>Duro de Clicar</b>:
  </p>
  <br />
  <ul style={{ listStyle: "inside" }}>
    <li>
      será lhe dado um mapa com dicas visuais, cada uma correspondendo a um
      link. Sua tarefa é descobrir o que essas dicas querem dizer e surfar
      pela web encontrando a sequência correta de links. O link da próxima
      página está sempre na página atual;
    </li>
    <li>
      interceptei algumas conversas entre os membros da Semcomp e descobri
      que o primeiro link dos mapas <i>geralmente</i> é da Wikipédia — eu
      começaria por lá, se não houver outra dica;
    </li>
    <li>
      sei que a resposta de cada mapa saltará aos seus olhos no final -
      permaneça sempre atento e investigativo;
    </li>
    <li>
      a resposta final é dada por letras maiúsculas, sem acento ou pontuação
      gráfica. Se a senha conter caracteres especiais (como hífen ou dois
      pontos) substitua por espaço (exemplo:{" "}
      <code>super-herói -{">"} SUPER HEROI</code>);
    </li>
    <li>
      sabendo do que eu sei, eu tentaria chegar o mais longe possível pois
      lhe garanto que você será grandemente recompensado - lembre-se que
      você tem apenas 1 hora;
    </li>
    <li>
      mesmo quando acaba, o jogo nunca termina - suspeite sempre do site da
      Semcomp.
    </li>
  </ul>
  <br />
  <p>
    Subversivos. Salvadores da Semcomp. Sempre Solícitos.
    <br /> ~~S.
  </p>
</>

export const HARD_TO_CLICK: Game = {
  name: 'Duro de Clicar',
  description: HARD_TO_CLICK_DESCRIPTION,
  slug: 'duro-de-clicar',
  eventPrefix: 'hard-to-click',
  startDate: new Date("2023-06-04 15:00"),
  endDate: new Date("2023-06-04 16:10"),
  numberOfQuestions: 10,
  maximumNumberOfMembersInGroup: 3,
}

export const RIDDLETHON: Game = {
  name: 'Riddlethon',
  description: HARD_TO_CLICK_DESCRIPTION,
  slug: 'riddlethon',
  eventPrefix: 'riddlethon',
  startDate: new Date("2022-01-23 17:30"),
  endDate: new Date("2023-09-28 17:30"),
  numberOfQuestions: 58,
  maximumNumberOfMembersInGroup: 3,
}

export const RIDDLE: Game = {
  name: 'Riddle',
  description: RIDDLE_DESCRIPTION,
  slug: 'riddle',
  eventPrefix: 'riddle',
  startDate: new Date("2023-10-23 09:00"),
  endDate: new Date("2023-10-27 17:00"),
  numberOfQuestions: 50,
  maximumNumberOfMembersInGroup: 2,
}

export default Game;
