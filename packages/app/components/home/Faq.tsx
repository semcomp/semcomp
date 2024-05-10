import { useEffect, useRef, useState } from "react";

import Linkify from "react-linkify";

function Question({ question, answer }) {
  // State that controls whether the question has been clicked or not
  const [isOpen, setIsOpen] = useState(false);

  // Holds a reference to the answer's paragraph element
  const answerRef: any = useRef();

  // Will store the answer's height
  const heightSizeRef = useRef();

  // Calculates the answer's height, and stores it in `heightSizeRef`
  useEffect(() => {
    answerRef.current.style.height = "";
    heightSizeRef.current = answerRef.current.clientHeight;
    answerRef.current.style.height = "0";
  }, []);

  // Whenever the `isOpen` state changes, executes the open/close animation
  useEffect(() => {
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
    <div className="bg-white text-grayDark p-[20]">
      <button
        className="text-left w-full p-4 shadow"
        onClick={handleQuestionClick}
      >
        {question}
      </button>
      <div
        ref={answerRef}
        className="text-black transition-all overflow-auto text-left font-secondary font-light"
      >
        <div className="p-4">
          <p>
            {/* Linkify: Veja https://pastebin.com/XN5HjgBC */}
            <Linkify
              componentDecorator={(decoratedHref, decoratedText, key) => (
                <a
                  target="blank"
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
      <section className="flex flex-col items-center text-secondary text-center">
        <h1 id="titulo" className="text-5xl text-white">
          FAQ
        </h1>
        <div className="text-base max-w-4xl">
          <Question
            question="Como faço para participar da Semcomp?"
            answer="Para participar, basta se inscrever aqui mesmo em nosso site! O evento será híbrido, com transmissão das palestras pelo Youtube, então é preciso comparecer à USP de São Carlos durante o período anunciado para os demais eventos. Para mais notícias, acompanhe nossas redes sociais (@semcomp no Instagram) e nosso canal de avisos no Telegram (https://t.me/semcomp_avisos)"
          />
          {/* <Question
            question="O evento é gratuito?"
            answer="Haverá uma taxa para o acesso ao coffee break, porém outros eventos como palestras, minicursos, concursos e game night são de acesso gratuito para todos. Vale lembrar que eventos com premiação exigem inscrição na Semcomp mesmo sem pagamento da taxa de inscrição."
          /> */}
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
          {/*
          <Question
            question="Qual o percentual de presença é preciso alcançar durante a SEMCOMP?"
            answer="É necessário ter 70% de presença, que pode ser obtida através da participação nas palestras. Mas é importante participar dos outros eventos que além de muito interessantes, vão contar pontos para o Overflow! Se você trabalha e não consegue atingir esse percentual, basta justificar com diretamente com seus professores."
        />*/}
        </div>
      </section>
    </>
  );
};

export default FAQ;
