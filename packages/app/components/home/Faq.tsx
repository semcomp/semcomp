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
    <div className="bg-white text-tertiary">
      <button className="text-left w-full p-4 shadow" onClick={handleQuestionClick}>
        {question}
      </button>
      <div ref={answerRef} className="transition-all overflow-hidden text-left text-black">
        <div className="p-4">
          <p>
            <Linkify>{answer}</Linkify>
          </p>
        </div>
      </div>
    </div>
  );
}

const FAQ = () => {
  return (<>
    <section className="flex flex-col items-center text-secondary bg-primary text-center p-16">
      <h1 className="text-4xl font-bold">FAQ</h1>
      <div className="text-base pt-8 max-w-4xl">
        <Question
          question="Como faço para participar da Semcomp?"
          answer="Para participar, basta se inscrever aqui mesmo em nosso site! O evento será híbrido, com transmissão das palestras pelo Youtube, então é preciso comparecer à USP de São Carlos durante o período anunciado para os demais eventos. Para mais notícias, acompanhe nossas redes sociais (@semcomp no Instagram) e nosso canal de avisos no Telegram (https://t.me/semcomp_avisos)"          />
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
          answer="Haverão certificados de participação nos minicursos. Assim, é preciso se inscrever neles aqui no site e comparecer na hora do evento. Após o final da Semcomp, emitiremos um certificado com a quantidade de horas correspondente às suas presenças."          />
        <Question
          question="Tem premiação?"
          answer="Sim! Campeonatos da game night e concursos terão premiações, mas não esqueça que, para poder participar, é preciso estar inscrito na Semcomp."
        />
      </div>
    </section>
  </>);
};

export default FAQ;
