import React, { useEffect, useState } from "react";
import { ReactElement } from "react";
import Logo from "../../components/home/Logo";

interface TitleHomeProps {
  timeIndex: number;
}

const TitleHome: React.FC<TitleHomeProps> = ({ timeIndex }): ReactElement => {
  const [titleSize, setTitleSize] = useState<string>("6vw");
  const [subTitleSize, setSubTitleSize] = useState<string>("1.5vw");
  const [subVisible, setSubVisible] = useState<boolean>(true);

  useEffect(() => {
    const updateSizes = () => {
      const width = window.innerWidth;
      
      // Regras para título e subtítulo
      if (width < 550) {
        setTitleSize("5pc");
        setSubVisible(false); // Esconder subtítulo
      } else if (width < 645) {
        setTitleSize("5pc");
        setSubTitleSize("1pc");
        setSubVisible(true);
      } else if (width < 1320) {
        setTitleSize("6pc");
        setSubTitleSize("1.2pc");
        setSubVisible(true);
      } else {
        // Default
        setTitleSize("6vw");
        setSubTitleSize("1.5vw");
        setSubVisible(true);
      }
    };

    window.addEventListener("resize", updateSizes);
    updateSizes();

    return () => window.removeEventListener("resize", updateSizes);
  }, []);

  const getTitleColor = (timeIndex: number): string => {
    if (timeIndex === 0) return "#EFEAFA";
    if (timeIndex === 1) return "#FCFBFF";
    if (timeIndex === 2) return "#300E82";
    if (timeIndex <= 5) return "#242D5C";
    if (timeIndex === 6) return "#242D59";
    if (timeIndex <= 8) return "#F9F004";
    if (timeIndex === 9) return "#F9F004";

    return "#F9F004";
  };

  return (
    <header className="flex flex-col items-center justify-center w-full text-center text-black font-primary">
      <div className="flex justify-center w-full mb-4"> {/* Espaçamento entre logo e título */}
        <Logo width={titleSize} height={titleSize} fillColor={getTitleColor(timeIndex)} className={undefined} />
      </div>
      <h1
        style={{
          fontSize: titleSize, // Tamanho dinâmico do título e logo
          lineHeight: "0.8",
          color: getTitleColor(timeIndex),
          textShadow: "2px 4px 6px rgba(0, 0, 0, 0.2)",
        }}
      >
        SEMCOMP 27
      </h1>
        {!subVisible && <br />} {/* Adiciona <br /> quando subtítulo é escondido */}
      {subVisible && (
        <p
          style={{
            fontSize: subTitleSize, // Tamanho dinâmico do subtítulo
            fontWeight: 100,
            color: getTitleColor(timeIndex),
            marginBottom: "1.5vw",
            textShadow: "1px 2px 4px rgba(0, 0, 0, 0.2)",
          }}
        >
          A maior semana acadêmica de computação do Brasil!
        </p>
      )}
    </header>
  );
};

export default TitleHome;
