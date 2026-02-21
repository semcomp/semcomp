import { Fragment, useEffect, useRef, useState } from "react";
import Linkify from "react-linkify";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

function Question({ question, answer, isFirst, isLast }) {
  const [isOpen, setIsOpen] = useState(false);
  const answerRef = useRef(null);

  // Atualizar a altura ao redimensionar a janela
  const updateHeight = () => {
    if (isOpen) {
      answerRef.current.style.height = answerRef.current.scrollHeight + "px";
    } else {
      answerRef.current.style.height = "0px";
    }
  };

  useEffect(() => {
    window.addEventListener("resize", updateHeight);

    return () => {
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  useEffect(() => {
    updateHeight();
  }, [isOpen]);

  function handleQuestionClick() {
    setIsOpen(!isOpen);
  }

  return (
    <div
      className={`bg-[#1f2937] text-white shadow-md ${
        isFirst ? "rounded-t-lg" : ""} ${isLast ? "rounded-b-lg" : ""}`} // Borda superior arredondada apenas na primeira e inferior na última
    >
      <button
        className={`flex items-center justify-between w-full p-4 text-left shadow focus:outline-none bg-[#2d3748] text-white ${
          isFirst ? "rounded-t-lg" : ""} ${isLast ? "rounded-b-lg" : ""}`} // Botão arredondado na parte superior da primeira pergunta e inferior da última
        onClick={handleQuestionClick}
      >
        <span>{question}</span>
        <ExpandMoreIcon
          className={`transition-transform duration-500 ease-in-out ${
            isOpen ? "rotate-180" : ""
          }`}
          style={{ transition: "transform 0.5s ease" }}
        />
      </button>
      <div
        ref={answerRef}
        className="overflow-hidden font-light text-left text-white transition-all"
        style={{ height: "0px", transition: "height 0.5s ease" }}
      >
        <div className="p-4 bg-[#2d3748]">
          <p>
            <Linkify
              componentDecorator={(decoratedHref, decoratedText, key) => (
                <a
                  target="_blank"
                  style={{ color: "#E91E63", fontWeight: "bold" }} // Cor do link para se destacar no dark mode
                  href={decoratedHref}
                  key={key}
                >
                  {decoratedText}
                </a>
              )}
            >
              {
                answer.split('\n').map((line, index) => (
                  <Fragment key={index}>
                    {line}
                    <br />
                  </Fragment>
                ))
              }
            </Linkify>
          </p>
        </div>
      </div>
    </div>
  );
}

const FAQ = () => {
  const questions = [
    {
      question: "O que é o tema da Semcomp?",
      answer:
        "A cada ano, a organização da Semcomp escolhe um tema para guiar o processo criativo da edição sendo desenvolvida. O tema escolhido direciona os elementos de marketing e da identidade visual, as atividades extracurriculares e culturais ao longo da semana e a ambientação do jogo, ajudando a criar uma atmosfera única e divertida para cada edição. \
        \n\nDessa forma, é importante esclarecer que as palestras, minicursos e atividades acadêmicas que acontecem ao longo da semana são independentes do tema. Essas atrações abordam conteúdos técnicos e de diversas áreas áreas da computação, sem relação com o tema escolhido para o conteúdo extracurricular.\
        \n\nNeste ano, o tema escolhido foi cinema, enriquecendo as atividades extracurriculares, a estética e a experiência lúdica do evento. As palestras e minicursos continuam sendo focados em tecnologia e computação de modo geral, com o objetivo de complementar e aprofundar a formação dos alunos."
    },
    {
      question: "Por que se inscrever no site da Semcomp?",
      answer:
        "Com seu perfil de participante no site, você pode se inscrever nos minicursos, concursos e oficinas que serão oferecidos ao longo da semana. Além disso, é com os dados da inscrição que geramos os certificados de participação!",
    },
    {
      question: "Como a presença é coletada durante a Semcomp?",
      answer:
        "A presença é coletada por meio do escaneamento dos QR Codes de identificação disponíveis no perfil do participante no site e no crachá. Os QR Codes são escaneados na entrada e na saída das atrações ao longo do evento.",
    },
    {
      question: "Qual é a presença mínima no evento?",
      answer: "Para os alunos de Ciências de Computação, Sistemas de Informação e Ciência de Dados, a presença no evento substitui a presença nas aulas que ocorreriam ao longo da semana. A presença mínima no evento corresponde a presença em 70% das palestras. Caso você estagie ou trabalhe, será possível abonar as faltas na semana através de um formulário disponibilizado no evento.",
    },
    {
      question: "O que é Overflow?",
      answer: "O Overflow é uma competição entre casas que ocorre durante toda a Semcomp. Todos os inscritos são separados em quatro casas e pontuam para sua casa a medida que participam de palestras, minicursos, concursos e atividades culturais. A casa com maior pontuação ao final do evento vence a Semcomp!",
    },
    {
      question: "Como funciona o Coffee Break?",
      answer: "Os coffee breaks são “pausas para o café”, intervalos com comida que acontecem ao longo da semana do evento. Neste ano, o pacote de coffee breaks dará acesso aos quatro coffee breaks fechados da Semcomp, basta comprar o pacote em nosso site e apresentar suas credenciais na entrada. Além deles, organizaremos coffee breaks abertos ao longo da semana da Semcomp.",
    },
    {
      question: "A presença na Semcomp conta como AAC?",
      answer: "A presença na Semcomp concede aos inscritos um certficado de participação no evento, que pode ser contabilizado como Atividade Acadêmica Complementar (AAC). Também são emitidos certificados para os participantes em cada um dos minicursos.",
    },
    {
      question: "Como funciona a inscrição em minicursos?",
      answer: "A inscrição nos minicursos é feita através da página do participante em nosso site, de acordo com a disponibilidade de vagas em cada um deles. Vamos liberar as vagas em lotes, com horários diferentes, para que todos tenham oportunidade de participar! Anunciaremos os minicursos e as aberturas das inscrições em breve.",
    }
  ];

  return (
    <section
      id="schedule"
      className="pb-4 flex flex-col items-center overflow-auto text-center text-secondary custom-scroll"
      style={{ maxWidth: '100%' }}  // Garantir que não ultrapasse a largura da tela
    >
      <h1
        id="titulo"
        className="text-modalTitleColor superdesktop:text-title-large desktop:text-title-large tablet:text-title-medium medphone:text-title-small phone:text-title-tiny text stroke mb-2"
      >
        FAQ
      </h1>
      <div className="superdesktop:text-large desktop:text-medium tablet:text-medium medphone:text-small phone:text-tiny">
        {questions.map((item, index) => (
          <Question
            key={index}
            question={item.question}
            answer={item.answer}
            isFirst={index === 0}
            isLast={index === questions.length - 1}
          />
        ))}
      </div>
    </section>
  );
};

export default FAQ;
