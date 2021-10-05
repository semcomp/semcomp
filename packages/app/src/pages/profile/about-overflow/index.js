import React from "react";

import Modal from "../../../components/modal";
import "./style.css";

function AboutOverflow({ onRequestClose }) {
  return (
    <Modal onRequestClose={onRequestClose}>
      <div className="title">Sobre o Overflow</div>
      <div className="content">
        O Semcomp Overflow é o principal concurso da nossa semana! É uma taça
        das casas onde quatro diferentes equipes competem pela vitória! Todos os
        participantes inscritos no site da Semcomp são lidos pelo nosso chapéu
        seletor e selecionados para um dos seguintes times -{" "}
        <strong>Agamotto, DeLorean, Ocarina ou Tardis</strong> - e a partir de
        então estarão competindo por pontos, através de todos os nossos eventos.
        A divisão é feita de forma uniforme, para que todos os times tenham um
        número parecido de participantes.
        <br />
        <br />
        E para deixar o jogo mais interessante… Que tal novidades? <br />
        <br />
        Pela primeira vez em todas as edições da Semcomp, você e sua equipe
        poderão visualizar e competir por diferentes conquistas, todas
        disponíveis no nosso site. <br />
        <br />
        Então ative seu espírito de trabalho em equipe e junte-se aos seus
        colegas nessa jornada divertida do Overflow! Não se esqueça de entrar no
        grupo do Telegram da sua casa, o link para convite está disponível no
        site da Semcomp! <br />
        <br />
        <strong>&gt;&gt;&gt; Como jogar</strong>
        <br />
        <strong>
          Participar das palestras, rodas de conversas, e eventos da semana:
        </strong>{" "}
        Quanto mais participantes da mesma casa estiverem online nas palestras,
        mais pontos você fatura, então não deixe de ir em nenhuma! Além disso, a
        casa que garantir mais participantes por palestra receberá conquistas
        exclusivas no nosso site!
        <br />
        <br />
        <strong>Competir nos outros concursos:</strong> Todos os vencedores dos
        concursos da semana além de receber prêmios, também levam pontos e
        conquistas! A Gamenight também está inclusa, então aproveite para se
        inscrever nos campeonatos!
        <br />
        <br />
        <strong>Gincanas Atemporais:</strong> de segunda a quarta, não perca as
        lives na Twitch e represente sua casa nas gincanas, fique ligado!
        <br />
        <br />
        <strong>Encerramento:</strong> No nosso tradicional encerramento, em que
        temos os eventos finais da semana, vamos ter mais chances para os
        participantes ganharem pontos, através de alguns mini desafios entre
        eles! No final, vamos anunciar os pontos recebidos por cada casa, a
        pontuação final e a casa vencedora! Vale lembrar que todos da equipe
        vencedora ganharão uma lembrança da tão honrada conquista.
      </div>
      <button className="cancel" type="button" onClick={onRequestClose}>
        Fechar
      </button>
    </Modal>
  );
}

export default AboutOverflow;
