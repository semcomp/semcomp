import ccex from "../../assets/sponsors/Logo_CCEX.png";
import fipai from "../../assets/sponsors/logofipai.svg";
import PartnerGrid from "./PartnerGrid";

function Supportes() {
  const supporterLogos = [
    { src: ccex, isSvg: false, width: 120, height: 50, hasWhiteBg: false },
    { src: fipai, isSvg: true, width: 1000, height: 50, hasWhiteBg: false },
  ];


  return (
    <>
      <section id="sponsorsBackground" className="flex flex-col items-center text-primary justify-center">
        <h1
          id="titulo"
          className="text-modalTitleColor text-center superdesktop:text-title-large desktop:text-title-large tablet:text-title-medium medphone:text-title-small phone:text-title-tiny text stroke"
        >
          Apoio
        </h1>
        <PartnerGrid logos={supporterLogos} />

      </section>
      <hr />
    </>
  );
}

export default Supportes;
