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
      question: "Como faço para participar da Semcomp?",
      answer:
        "Para participar, basta se inscrever aqui mesmo em nosso site! O nosso evento é presencial e ocorre no Instituto de Ciências Matemáticas e Computação da USP de São Carlos. Para mais notícias, acompanhe nossas redes sociais (@semcomp no Instagram) e nosso canal de avisos no Telegram (https://t.me/semcomp_avisos)",
    },
    {
      question: "Onde tenho acesso aos avisos da Semcomp?",
      answer:
        "Para ficar por dentro de tudo que vai rolar na Semcomp, acompanhe nossas redes sociais (@semcomp no Instagram) e nosso canal de avisos no Telegram (https://t.me/semcomp_avisos). Enviaremos todas as novidades por lá!",
    },
    {
      question: "Tem certificado?",
      answer:
        "Haverão certificados de participação nos minicursos. Assim, é preciso se inscrever neles aqui no site e comparecer na hora do evento. Após o final da Semcomp, emitiremos um certificado com a quantidade de horas correspondente às suas presenças.",
    },
    {
      question: "Tem premiação?",
      answer:
        "Sim! Campeonatos da game night e concursos terão premiações, mas não esqueça que, para poder participar, é preciso estar inscrito na Semcomp.",
    },
    {
      question: "O que é o tema da Semcomp?",
      answer:
        "A cada ano, a organização da Semcomp escolhe um tema para guiar o processo criativo da edição sendo desenvolvida. O tema escolhido direciona os elementos de marketing e da identidade visual, as atividades extracurriculares e culturais ao longo da semana e a ambientação do jogo, ajudando a criar uma atmosfera única e divertida para cada edição.\
        \n\nDessa forma, é importante esclarecer que as palestras, minicursos e atividades acadêmicas que acontecem ao longo da semana são independentes do tema. Essas atrações abordam conteúdos técnicos e de diversas áreas áreas da computação, sem relação com o tema escolhido para o conteúdo extracurricular.\
        \n\nOu seja neste ano, o tema escolhido foi cinema, enriquecendo as atividades extracurriculares, a estética e a experiência lúdica do evento. As palestras e minicursos continuam sendo focados em tecnologia e computação de modo geral, com o objetivo de complementar e aprofundar a formação dos alunos."
      },
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
