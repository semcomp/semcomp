import { FaInstagram, FaTelegramPlane } from "react-icons/fa";

function About() {
  return (
    <>
      <section
        id="schedule"
        className="flex flex-col items-center overflow-hidden text-center text-secondary"
        style={{ maxWidth: '100%' }}  // Garantir que não ultrapasse a largura da tela
      > 
        <h1
          id="titulo"
          className="text-modalTitleColor superdesktop:text-title-superlarge desktop:text-title-large tablet:text-title-medium medphone:text-title-small phone:text-title-tiny text stroke"
        >
          Sobre a Semcomp
        </h1>
        <br />
        <div className="text-gray-300 desktop:text-medium tablet:text-medium medphone:text-xs phone:text-[12px]">
          <p id="aboutText" className="text-gray-300 font-secondary">
            A <strong>Semcomp</strong>, ou <strong>Semana Acadêmica de Computação</strong>, é organizada pelos estudantes dos cursos de <strong>Ciência da Computação</strong>, <strong>Sistemas de Informação</strong> e <strong>Ciência de Dados</strong> do Instituto de Ciências Matemáticas e de Computação (ICMC) da USP, campus São Carlos.
          </p>
          <br />
          <p id="aboutText" className="text-gray-300 font-secondary">
            Nosso evento é totalmente planejado por alunos e realizado anualmente com uma programação repleta de <strong>palestras</strong>, <strong>minicursos</strong>, <strong>concursos</strong>, além do nosso famoso <strong>Hackathon</strong>. Oferecemos diversas oportunidades de aprendizado, interação, muita diversão e, claro, comida! 
          </p>
          <br />
          <p id="aboutText" className="text-gray-300 font-secondary">
            Queremos que todos aproveitem ao máximo a <strong>maior semana de computação do Brasil</strong>. Não perca nada! Siga a <strong>Semcomp</strong> nas redes sociais para ficar por dentro de todas as novidades.
          </p>
          <br />
          
          <p id="aboutText" className="text-gray-300 font-secondary">
            Ela acontecerá dos dias <strong>20 a 24 de Outubro</strong>, estamos esperando por você!
          </p>
          

          <br/>
          <div className="flex justify-center mt-4 space-x-4 text-primary">
            <a href="https://www.instagram.com/semcomp" target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:text-pink-400">
              <FaInstagram size={32} />
            </a>
            <a href="https://t.me/semcomp_avisos" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-400">
              <FaTelegramPlane size={32} />
            </a>
          </div>
          <br />
          <div className="flex flex-wrap items-center justify-center space-x-2">
            <p id="aboutText" className="text-gray-300 font-secondary">
              Com carinho, equipe Semcomp!
            </p>
            <img
              src="https://media.tenor.com/0-M-_QQY4eQAAAAj/pixel-heart.gif"
              alt="Pixel heart"
              className="w-6 h-6 tablet:w-8 tablet:h-8 superdesktop:w-10 superdesktop:h-10" // Ajuste responsivo
            />
          </div>
        </div>
      </section>
    </>
  );
}

export default About;
