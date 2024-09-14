import React, { useEffect, useState } from "react";
import { ReactElement } from "react";

interface TitleHomeProps {
  timeIndex: number;
}

const TitleHome: React.FC<TitleHomeProps> = ({ timeIndex }): ReactElement => {
  const [noAbsoluteMarginTop, setNoAbsoluteMarginTop] = useState<number | undefined>();
  const [betaMarginTop, setBetaMarginTop] = useState<number | undefined>();
  const [showAccessorys, setShowAccessorys] = useState<boolean>(true);
  const [subTitleFontSize, setSubTitleFontSize] = useState<string>("3.5vw");
  const [titleFontSize, setTitleFontSize] = useState<string>("12.5vw");

  useEffect(() => {
    if (timeIndex > 6) {
      setShowAccessorys(false);
    }
  }, [timeIndex]);

  useEffect(() => {
    const updateFontSize = () => {
      const width = window.innerWidth;

      // Lógica para o subtítulo
      if (width <= 660) {
        setSubTitleFontSize("3.5vw");
      } else {
        setSubTitleFontSize("2.5vw");
      }

      // Lógica para o título principal
      if (width > 1300) {
        setTitleFontSize("10vw");
      } else {
        setTitleFontSize("12.5vw");
      }
    };

    window.addEventListener("resize", updateFontSize);
    updateFontSize(); // Chama a função quando o componente monta

    return () => window.removeEventListener("resize", updateFontSize); // Limpa o listener quando o componente desmonta
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
              fontSize: titleFontSize, // Usando o estado para definir o tamanho do título principal
              lineHeight: "1",
              color: getTitleColor(timeIndex),
              textShadow: "2px 4px 6px rgba(36, 36, 36, 0.6)",
              zIndex: 1,
            }}
          >
            SEMCOMP 27
          </h1>
        </div>

        <p
          className="relative text-primary"
          style={{
            fontSize: subTitleFontSize, // Usando o estado para definir o tamanho do subtítulo
            fontWeight: 100,
            color: getTitleColor(timeIndex),
            marginTop: "-0.5vw",
            marginBottom: "1.5vw",
            textShadow: "1px 2px 4px rgba(36, 36, 36, 0.6)",
            zIndex: 1,
          }}
        >
          A maior semana acadêmica de computação do Brasil!
        </p>
      </div>
    </header>
  );
};

export default TitleHome;
