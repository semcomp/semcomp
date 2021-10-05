import React from "react";
import Linkify from "react-linkify";
import "./style.css";

function Question({ question, answer }) {
  // State that controls whether the question has been clicked or not
  const [isOpen, setIsOpen] = React.useState(false);

  // Holds a reference to the answer's paragraph element
  const answerRef = React.useRef();

  // Will store the answer's height
  const heightSizeRef = React.useRef();

  // Calculates the answer's height, and stores it in `heightSizeRef`
  React.useEffect(() => {
    answerRef.current.style.height = "";
    heightSizeRef.current = answerRef.current.clientHeight;
    answerRef.current.style.height = "0";
  }, []);

  // Whenever the `isOpen` state changes, executes the open/close animation
  React.useEffect(() => {
    if (isOpen) {
      answerRef.current.style.height = heightSizeRef.current + "px";
    } else {
      answerRef.current.style.height = "0";
    }
  }, [isOpen]);

  // Switches the `isOpen` state
  function handleQuestionClick() {
    if (isOpen) setIsOpen(false);
    else setIsOpen(true);
  }

  return (
    <div className="question-component">
      <button className="question" onClick={handleQuestionClick}>
        {question}
      </button>
      <p ref={answerRef} className="answer">
        {/* The span is used to have a padding and still retract the element into
				a zero-height state */}
        <span>
          <Linkify>{answer}</Linkify>
        </span>
      </p>
    </div>
  );
}

const FAQ = () => {
  return (
    <>
      <div className="shiny-divider"></div>
      <div className="home-faq-container">
        <h1>FAQ</h1>
        <div className="questions-container">
          <Question
            question="Como faço para participar da Semcomp?"
            answer="Para participar da Semcomp, basta se inscrever aqui mesmo no nosso site! Para mais notícias, acompanhe nossas redes sociais e nosso canal de avisos no Telegram!"
          />
          <Question question="O evento é gratuito?" answer="Sim!" />
          <Question
            question="Onde tenho acesso aos avisos da Semcomp?"
            answer="Para acompanhar tudo que está rolando na Semcomp em tempo real, basta entrar no nosso canal de avisos no telegram por esse link (https://t.me/semcomp_avisos)! É por lá que enviamos todas as notícias e informações sobre o evento, então sempre bom dar uma olhada!"
          />
          <Question
            question="Tem certificado?"
            answer="Tem sim, para garantir o certificado basta estar inscrito na Semcomp, participar dos eventos e marcar sua presença. Após o final do evento, será enviado um certificado de acordo à sua participação."
          />
          <Question
            question="Tem premiação?"
            answer="Claro! Tanto os campeonatos da gamenight quanto os concursos terão premiações que serão divulgadas ao longo do evento."
          />
        </div>
      </div>
    </>
  );
};

export default FAQ;
