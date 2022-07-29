import React from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@mui/material";

import { RiddleRoutes } from "..";

import RiddleLogo from "../../../assets/riddle_logo.png";

function RiddleStart() {
  const navigate = useNavigate();

  function startGame() {
    navigate(RiddleRoutes.lobby);
  }

  return (
    <div className="Riddle-page__card-content">
      <h1>Riddle</h1>
      <div>
        <img style={{ margin: "0 auto" }} src={RiddleLogo} alt="Riddle" />
        <p>
          Os Riddles da SEMCOMP marcam presença, mais uma vez, como um dos
          concursos clássicos do nosso evento. São enigmas compostos por uma (ou
          duas) frases, juntos de uma imagem, que combinadas formam uma senha.
          Seu objetivo, jovem gafanhoto, é completar a maior quantidade de
          Riddles até o final da semana!
        </p>
        <br />
        <p>
          Esse ano, o concurso está de cara nova e conta com algumas novidades
          que deixarão o jogo muito mais interessante… Esteja preparado para o{" "}
          <b>Lendário</b>… Conforme você acerta os riddles, você logo irá se
          deparar com uma charada diferente. Se acertar, você pode conseguir uma
          dica ou um skip, que poderá ser utilizado em qualquer nível no futuro!
        </p>
        <br />
        <p>
          Lembrando: o concurso é individual e quem conseguir resolver mais
          enigmas até a cerimônia de encerramento será grandemente recompensado!
          Então o que você está esperando? Abuse do Google, deixe o espírito
          Sherlock Holmes tomar conta de você e desvende nossos desafios!
        </p>
        <br />
        <p>O jogo começa dia 27/09 às 9h! Divirta-se =)</p>
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
      </div>
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

export default RiddleStart;
