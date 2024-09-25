import React, { useEffect, useState } from "react";
import { ReactElement } from "react";
import Image from "next/image";
import logoSemcompona from "../../assets/27-imgs/semcomponaLogo.png"; // Importando a logo corretamente

interface TitleHomeProps {
  timeIndex: number;
}

const TitleHome: React.FC<TitleHomeProps> = ({ timeIndex }): ReactElement => {
  const [titleSize, setTitleSize] = useState<string>("6vw");
  const [subTitleSize, setSubTitleSize] = useState<string>("2vw");
  const [logoPosition, setLogoPosition] = useState<string>("translateY(-200px)"); // Estado para a posição inicial da logo
  const [subTitleFontSize, setSubTitleFontSize] = useState<string>("3.5vw");
  const [titleFontSize, setTitleFontSize] = useState<string>("12.5vw");
  const [logoSize, setLogoSize] = useState<string>("12.5vw");

  useEffect(() => {
    const updateFontSize  = () => {
      const width = window.innerWidth;
      if (width <= 660) {
        setSubTitleFontSize("3.0vw");
      } else {
        setSubTitleFontSize("2vw");
      }


      if (width > 1050) {
        setTitleFontSize("7vw");
      } else if (width > 660) {
        setTitleFontSize("13vw");
      } else {
        setTitleFontSize("18vw");
      }

      if (width > 1050) {
        setLogoSize("12vw");
      } else if (width > 660) {
        setLogoSize("25vw");
      } else {
        setLogoSize("34vw");
      }
    };

    window.addEventListener("resize", updateFontSize);
    updateFontSize(); 

    setTimeout(() => {
      setLogoPosition("translateY(0)");
    }, 100); 

    return () => window.removeEventListener("resize", updateFontSize);
  }, []);

  const getTitleColor = (timeIndex: number): string => {
    if (timeIndex === 0) return "#EFEAFA";
    if (timeIndex === 1) return "#FCFBFF";
    if (timeIndex === 2) return "#300E82";
    if (timeIndex <= 5) return "#242D5C";
    if (timeIndex === 6) return "#FCFBFF";
    if (timeIndex <= 8) return "#F9F004";
    if (timeIndex === 9) return "#F9F004";

    return "#F9F004";
  };

  return (
    <header className="flex flex-col items-center justify-center w-full text-center text-black font-primary">
      <div className="w-full z-4"></div>
      <div className="relative text-center felz">
        <Image
          src={logoSemcompona}
          alt="Logo Semcompona"
          width={500} 
          height={250} 
          style={{
            width: logoSize,
            marginBottom: "15px",
            transform: logoPosition, 
            transition: "transform 1s ease-out", 
          }}
        />
        <p
          className="relative text-primary mobile:hidden"
          style={{
            fontSize: subTitleSize,
            fontWeight: 100,
            color: getTitleColor(timeIndex),
            marginTop: "-0.5vw",
            marginBottom: "1.5vw",
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
