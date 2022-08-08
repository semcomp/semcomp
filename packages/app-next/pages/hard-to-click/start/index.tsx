import { Button } from "@mui/material";
import { useRouter } from 'next/router';

import { HardToClickRoutes } from "..";

function HardToClickStart() {
  const router = useRouter();

  function startGame() {
    router.push(HardToClickRoutes.lobby);
  }

  return (
    <div className="HardToClick-page__card-content">
      {/*
        <br />
        Bem-vindo ao Duro de Clicar! Entre em um grupo com seus amigos e tente resolver os
        mapas!
        <br />
        <br />
        Cada mapa terá enigmas na forma de uma imagem, e a sua resposta é um link na página que
        vocês estão. Clicando no link certo, vocês caem na próxima página, e devem tentar
        descobrir o próximo enigma do mapa, e assim em diante. Quando descobrirem o último
        enigma de um mapa, preencham a caixa de texto abaixo do mapa com a resposta final. Se
        ela estiver correta, vocês avançam para o próximo mapa.
        <br />
        <br />
        Tente resolver todos os mapas rápido para ganhar mais pontos! */}
      <h1>Duro de Clicar</h1>
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
        <br /> - S.
      </p>
      <Button
        onClick={startGame}
        style={{
          backgroundColor: "#045079",
          color: "white",
          margin: "16px 8px",
          padding: "8px 32px",
        }}
      >
        Jogar!
      </Button>
    </div>
  );
}

export default HardToClickStart;
