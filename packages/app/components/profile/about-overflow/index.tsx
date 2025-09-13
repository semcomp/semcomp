import Modal from "../../Modal";
import { config } from "../../../config";

function AboutOverflow({ onRequestClose }) {
  return (
    <Modal onRequestClose={onRequestClose}>
      <div className="title bg-primary">Sobre o Overflow</div>
      <div className="content p-6 overflow-y-scroll">
      <header className="bg-primary p-4 text-white text-center">
        <h1 className="text-3xl font-bold">Bem-vindes ao Overflow da Semcomp!</h1>
    </header>

    <main className="container mx-auto py-8">
        <p className="text-sm text-center mb-4">Para aqueles que não conhecem, o Overflow é o principal concurso da nossa semana!</p>
        <p className="text-sm text-center mb-4">Nesse concurso, todos os inscritos no site da Semcomp são divididos em 4 casas por nosso chapéu seletor e tentam obter o maior número de pontos para <span className="text-primary font-bold">sua casa</span>!</p>
        <p className="text-sm text-center mb-4">A divisão de pessoas é feita de forma uniforme, para que todos os times tenham um número parecido de participantes. Não é possível alterar <span className="text-primary font-bold">sua casa</span>. Para a Semcomp {config.EDITION}, as equipes serão: <span className="text-primary font-bold">Stormrock</span>, <span className="text-primary font-bold">Symbiosia</span>, <span className="text-primary font-bold">Cybertechna</span> e <span className="text-primary font-bold">Arcadium</span>.</p>
        {/* <p className="text-sm text-center mb-4">Ative seu espírito de trabalho em equipe e junte-se aos seus colegas nessa jornada divertida do Overflow! Não se esqueça de entrar no grupo do Telegram da sua casa; o link para o convite está disponível no seu perfil no site da Semcomp!</p> */}
        <p className="text-sm text-center mb-4">E como ganhar pontos para <span className="text-primary font-bold">sua casa</span>? A sua participação é a chave para o sucesso da sua casa no Overflow! Durante toda a semana, teremos atividades que distribuirão pontos para participantes e vencedores, entre elas: presenças em palestras e minicursos, concursos, atividades culturais, campeonatos da Gamenight e muito mais!</p>
        <p className="text-sm text-center mb-4">Ao final da semana, teremos o Encerramento da Semcomp. Nele, serão revelados os vencedores das competições, quantos pontos cada casa recebeu e, finalmente, a grande campeã do Overflow!</p>
        <p className="text-lg text-center font-bold">Motivem seus companheiros e que vença a melhor casa!</p>
    </main>
        </div>
      <button className="cancel" type="button" onClick={onRequestClose}>
        Fechar
      </button>
    </Modal>
  );
}

export default AboutOverflow;
