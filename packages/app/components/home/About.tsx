function AboutBeta() {
  return (
    <>
      <section
        id="about"
        className="flex flex-col items-center text-center p-[25px]
        "
      >
        <h1 id="titulo" className="text-white
            superdesktop:text-[50px]
            desktop:text-[40px]
            tablet:text-[30px]
            medphone:text-[20px]
            phone:text-[20px]
        ">
          Sobre a Semcomp
        </h1>
        <div className="
        text-white

        superdesktop:text-[25px]
        desktop:text-[20px]
        tablet:text-[15px]
        medphone:text-[13px]
        phone:text-[13px]



        
        ">
          <p id="aboutText" className="text-white font-secondary">
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

export default AboutBeta;
