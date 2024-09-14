import React, { useEffect, useState } from "react";
import { ReactElement } from "react";

interface TitleHomeProps {
  timeIndex: number;
}

const TitleHome: React.FC<TitleHomeProps> = ({ timeIndex }): ReactElement => {
  const [noAbsoluteMarginTop, setNoAbsoluteMarginTop] = useState<
    number | undefined
  >();
  const [betaMarginTop, setBetaMarginTop] = useState<number | undefined>();
  const [showAccessorys, setShowAccessorys] = useState<boolean>(true);

  useEffect(() => {
    if (timeIndex > 6) {
      setShowAccessorys(false);
    }
  }, [timeIndex]);

  const getTitleColor = (timeIndex: number): string => {
    if (timeIndex == 0) return "#EFEAFA";
    if (timeIndex == 1) return "#FCFBFF";
    if (timeIndex == 2) return "#300E82";
    if (timeIndex <= 5) return "#242D5C";
    if (timeIndex == 6) return "#242D59";
    if (timeIndex <= 8) return "#F9F004";
    if (timeIndex == 9) return "#F9F004";

    return "#F9F004";
  };

  return (
    <header id="header" className="text-black font-primary">
      <div className="w-full z-4"></div>
      <div style={{ display: showAccessorys ? "block" : "none" }}></div>
      <div
        className="relative text-center"
        style={{ marginTop: `${noAbsoluteMarginTop}px` }}
      >
        <div>
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[100px]"
            style={{ marginTop: `${betaMarginTop}px` }}
          ></div>
          <h1
            className="relative text-primary"
            style={{
              fontSize: "13vw", // Tamanho do título principal, adaptado para diferentes tamanhos de tela
              lineHeight: "1",
              color: getTitleColor(timeIndex),
              textShadow: "2px 4px 6px rgba(36, 36, 36, 0.6)", // Sombra escura com opacidade
              zIndex: 1, // Garante que o texto fique acima de outros elementos
            }}
          >
            SEMCOMP 27
          </h1>
        </div>

        <p
          className="relative text-primary"
          style={{
            fontSize: "2vw", // Tamanho do subtítulo adaptado para diferentes tamanhos de tela
            fontWeight: 100, // Deixa a fonte mais fina
            color: getTitleColor(timeIndex),
            marginTop: "-0.5vw", // Aproxima o subtítulo do título
            marginBottom: "1.5vw", // Afasta o subtítulo do próximo elemento
            textShadow: "1px 2px 4px rgba(36, 36, 36, 0.6)", // Sombra escura com opacidade
            zIndex: 1, // Garante que o subtítulo fique acima de outros elementos
          }}
        >
          A maior semana acadêmica de computação do Brasil!
        </p>
      </div>
    </header>
  );
};

export default TitleHome;
