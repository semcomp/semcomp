function About() {
  return (
    <>
      <section
        id="about"
        className="flex flex-col items-center text-center md:px-[200px] tablet:px-[100px] phone:px-8"
      >
        <h1 id="titulo" className="text-primary
        superdesktop:text-title-superlarge
        desktop:text-title-large
        tablet:text-title-medium
        medphone:text-title-small
        phone:text-title-tiny
            text stroke
        ">
          Sobre a Semcomp
        </h1>
        <div className="
        text-white

        superdesktop:text-superlarge
        desktop:text-large
        tablet:text-medium
        medphone:text-small
        phone:text-tiny

        ">
          <p id="aboutText" className="text-[#444] font-secondary">
            A <strong>Semcomp</strong> é a{" "}
            <strong>Semana Acadêmica de Computação</strong>, realizada pelos
            cursos de <strong>Ciências de Computação</strong>, de{" "}
            <strong>Sistemas de Informação</strong> e{" "}
            <strong>Ciência de Dados</strong> do Instituto de Ciências
            Matemáticas e de Computação (ICMC) da USP de São Carlos.
          </p>
          <br />
          <p>
            {/* A sua 26ª edição{" "}
            <strong>ocorrerá entre os dias 21 e 27 de Outubro de 2023</strong>{" "} */}
            {/* de forma presencial. */}
          </p>
          <br />
          {/* <p>Não deixe de participar, basta criar sua conta!</p> */}
        </div>
      </section>
    </>
  );
}

export default About;
