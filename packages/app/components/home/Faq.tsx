import { useEffect, useRef, useState } from "react";
import Linkify from "react-linkify";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

function Question({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);
  const answerRef = useRef(null);

  // atualizar a altura ao redimensionar a janela
  const updateHeight = () => {
    if (isOpen) {
      answerRef.current.style.height = answerRef.current.scrollHeight + "px";
    } else {
      answerRef.current.style.height = "0px";
    }
  };

  useEffect(() => {
    window.addEventListener('resize', updateHeight);

    return () => {
      window.removeEventListener('resize', updateHeight);
    };
  }, []);

  useEffect(() => {
    updateHeight();
  }, [isOpen]);

  function handleQuestionClick() {
    setIsOpen(!isOpen);
  }

  return (
    <div className="bg-white text-grayDark p-2">
      <button
        className="text-left w-full p-2 shadow flex justify-between items-center focus:outline-none"
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
        className="text-black transition-all overflow-hidden text-left font-secondary font-light"
        style={{ height: "0px", transition: "height 0.5s ease" }}
      >
        <div className="p-4">
          <p>
            <Linkify
              componentDecorator={(decoratedHref, decoratedText, key) => (
                <a
                  target="_blank"
                  style={{ color: "#002776", fontWeight: "bold" }}
                  href={decoratedHref}
                  key={key}
                >
                  {decoratedText}
                </a>
              )}
            >
              {answer}
            </Linkify>
          </p>
        </div>
      </div>
    </div>
  );
}

const FAQ = () => {
  return (
    <>
      <section className="flex flex-col items-center text-secondary text-center" style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h1 id="titulo" className="
        superdesktop:text-title-superlarge
        desktop:text-title-large
        tablet:text-title-medium
        medphone:text-title-small
        phone:text-title-tiny
        text-white">
          FAQ
        </h1>
        <div className="
                superdesktop:text-superlarge
                desktop:text-large
                tablet:text-medium
                medphone:text-small
                phone:text-tiny
        ">
          <Question
            question="Como faço para participar da Semcomp?"
            answer="Para participar, basta se inscrever aqui mesmo em nosso site! O evento será híbrido, com transmissão das palestras pelo Youtube, então é preciso comparecer à USP de São Carlos durante o período anunciado para os demais eventos. Para mais notícias, acompanhe nossas redes sociais (@semcomp no Instagram) e nosso canal de avisos no Telegram (https://t.me/semcomp_avisos)"
          />
          <Question
            question="Onde tenho acesso aos avisos da Semcomp?"
            answer="Para ficar por dentro de tudo que vai rolar na Semcomp, acompanhe nossas redes sociais (@semcomp no Instagram) e nosso canal de avisos no Telegram (https://t.me/semcomp_avisos). Enviaremos todas as novidades por lá!"
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
      </section>
    </>
  );
};

export default FAQ;
