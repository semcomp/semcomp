import React, { useEffect, useState } from "react";
import { ReactElement } from "react";
import Logo from "../../components/home/Logo";

interface TitleHomeProps {
  timeIndex: number;
}

const TitleHome: React.FC<TitleHomeProps> = ({ timeIndex }): ReactElement => {
  const [subTitleFontSize, setSubTitleFontSize] = useState<string>("3.5vw");
  const [titleFontSize, setTitleFontSize] = useState<string>("12.5vw");
  const [logoSize, setLogoSize] = useState<string>("10vw"); // Tamanho ajustável do logo

  useEffect(() => {
    const updateFontSize = () => {
      const width = window.innerWidth;

      if (width <= 660) {
        setSubTitleFontSize("3vw");
        setLogoSize("20vw"); // Tamanho menor para telas pequenas
      } else {
        setSubTitleFontSize("1.5vw");
        setLogoSize(width > 1050 ? "10vw" : "15vw"); // Tamanhos ajustados para outras larguras de tela
      }

      setTitleFontSize(width > 1050 ? "8vw" : "18vw");
    };

    window.addEventListener("resize", updateFontSize);
    updateFontSize();

    return () => window.removeEventListener("resize", updateFontSize);
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
      <div className="flex justify-center w-full">
        <Logo width={logoSize} height={logoSize} fillColor={getTitleColor(timeIndex)} className={undefined} />
      </div>
      <h1
        style={{
          fontSize: titleFontSize,
          lineHeight: "0.7",
          color: getTitleColor(timeIndex),
          textShadow: "2px 4px 6px rgba(0, 0, 0, 0.2)",
        }}
      >
        SEMCOMP 27
      </h1>
      <br />
      <p
        style={{
          fontSize: subTitleFontSize,
          fontWeight: 100,
          color: getTitleColor(timeIndex),
          marginBottom: "1.5vw",
          textShadow: "1px 2px 4px rgba(0, 0, 0, 0.2)",
        }}
      >
        A maior semana acadêmica de computação do Brasil!
      </p>
    </header>
  );
};

export default TitleHome;
