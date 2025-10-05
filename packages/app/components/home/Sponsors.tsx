import BTG from "../../assets/sponsors/btg_logo.svg";
import BemAgro from "../../assets/sponsors/bem_agro_logo_verde.png";
import Profusion from "../../assets/sponsors/profusion_logo_blue.png";
import Griaule from "../../assets/sponsors/griaule_logo_blue.svg";
import Alliage from "../../assets/sponsors/aliage_logo_blue.jpg";
import PartnerGrid from "./PartnerGrid";

function Sponsors() {
  const sponsorsLogos = [
    { src: Alliage, isSvg: false, width: 150, height: 45, hasWhiteBg: true },
    { src: BTG, isSvg: true, width: 300, height: 300, hasWhiteBg: true },
    { src: BemAgro, isSvg: false, width: 150, height: 50, hasWhiteBg: true },
    { src: Profusion, isSvg: false, width: 150, height: 50, hasWhiteBg: true },
    { src: Griaule, isSvg: true, width: 150, height: 50, hasWhiteBg: true },
  ];

  return (
    <>
      <section
        id="sponsorsBackground"
        className="flex flex-col items-center text-primary justify-center"
      >
        <h1
          id="titulo"
          className="text-modalTitleColor text-center superdesktop:text-title-large desktop:text-title-large tablet:text-title-medium medphone:text-title-small phone:text-title-tiny text stroke"
        >  
          Patrocinadores
        </h1>

        <PartnerGrid logos={sponsorsLogos} />
      </section>
    </>
  );
}

export default Sponsors;
