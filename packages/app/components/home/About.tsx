function AboutBeta() {
  return (
    <>
      <section
        id="about"
        className="flex flex-col items-center text-primary bg-green1_26 text-center p-16"
      >
        <h1 id="titulo" className="text-4xl font-bold">
          Sobre a Semcomp
        </h1>
        <div className="text-xl pt-8 max-w-4xl">
          <p id="aboutText">
            A <strong>Semcomp</strong> é a{" "}
            <strong>Semana Acadêmica de Computação</strong>, realizada pelos
            cursos de <strong>Ciências de Computação</strong>, de{" "}
            <strong>Sistemas de Informação</strong> e{" "}
            <strong>Ciência de Dados</strong> do Instituto de Ciências
            Matemáticas e de Computação (ICMC) da USP de São Carlos.
          </p>
          {/* <br />
          <p> 
            A sua 26ª edição{" "}
            <strong>ocorrerá entre os dias 21 e 27 de Outubro de 2023</strong>{" "}
            de forma híbrida, com transmissões parciais pelo Youtube.
          </p>
          <br />
          <p>
            Já a Semcomp Beta{" "}
            <strong>ocorrerá nos dias 03 e 04 de junho, também de 2023.</strong> 
          </p>
          <br />
          <p>Não deixe de participar, basta criar sua conta!</p> */}
        </div>
      </section>
    </>
  );
}

export default AboutBeta;
