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
            answer="Para participar, basta se inscrever aqui mesmo em nosso site! O evento será híbrido, com transmissão das palestras pelo Youtube, então é preciso comparecer à USP de São Carlos durante o período anunciado para os demais eventos. Para mais notícias, acompanhe nossas redes sociais (@semcomp no Instagram) e nosso canal de avisos no Telegram (https://t.me/semcomp_avisos)"
          />
          <Question
            question="O evento é gratuito?"
            answer="Haverá uma taxa para o acesso ao coffee break, porém outros eventos como palestras, minicursos, concursos e game night são de acesso gratuito para todos. Vale lembrar que eventos com premiação exigem inscrição na Semcomp mesmo sem pagamento da taxa de inscrição."
          />
          <Question
            question="Onde tenho acesso aos avisos da Semcomp?"
            answer="Para ficar por dentro de tudo que vai rolar na Semcomp, acompanhe nossas redes sociais (@semcomp no Instagram) e nosso canal de avisos no Telegram (https://t.me/semcomp_avisos). Enviaremos todas as novidades por lá!
            "
          />
          <Question
            question="Tem certificado?"
            answer="Haverão certificados de participação nos minicursos. Assim, é preciso se inscrever neles aqui no site e comparecer na hora do evento. Após o final da Semcomp, emitiremos um certificado com a quantidade de horas correspondente às suas presenças."
          />
          <Question
            question="Tem premiação?"
            answer="Sim! Campeonatos da game night e concursos terão premiações, mas não esqueça que, para poder participar, é preciso estar inscrito na Semcomp."
          />
        </div>
      </div>
    </>
  );
};

export default FAQ;
