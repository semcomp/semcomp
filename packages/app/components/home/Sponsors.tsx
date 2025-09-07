import Image, { StaticImageData } from "next/image";

import Elo from "../../assets/sponsors/elogroup.svg";
import Desktop from "../../assets/sponsors/desktop.svg";
import PortoSeguros from "../../assets/sponsors/Porto Seguros.svg";
import Goldman from "../../assets/sponsors/goldman.svg";
import Venturus from "../../assets/sponsors/venturus.svg";

import Alliage from "../../assets/sponsors/alliage.png";

function Sponsors() {
  const sponsorsLogos = [
    { src: Elo, isSvg: true },
    { src: Desktop, isSvg: true },
    { src: PortoSeguros, isSvg: true },
    { src: Goldman, isSvg: true },
    { src: Venturus, isSvg: true },
    { src: Alliage, isSvg: false },
  ];

  return (
    <>
      <section
        id="sponsorsBackground"
        className="flex flex-col items-center text-primary justify-center"
      >
        <h1 className="text-purple-400 superdesktop:text-title-superlarge desktop:text-title-large tablet:text-title-medium medphone:text-title-small phone:text-title-tiny text stroke font-primary">
          Patrocinadores
        </h1>

        <div className="text-base max-w-6xl">
          <div className="grid md:grid-cols-3 md:gap-12 phone:grid-cols-2 phone:gap-4 tablet:grid-cols-3 tablet:gap-8">
            {sponsorsLogos.map((logo, index) => (
              <div
                key={index}
                className="relative md:h-44 md:w-44 tablet:h-32 tablet:w-32 phone:h-28 phone:w-28 lg:w-60 flex items-center justify-center"
              >
                {logo.isSvg ? (
                  <logo.src className="w-[150px] h-[50px] object-contain" />
                ) : (
                  <Image
                    src={logo.src as StaticImageData}
                    alt={`Logo ${index}`}
                    width={150}
                    height={50}
                    style={{ objectFit: "contain" }}
                  />
                )}
              </div>
            ))}
          </div>
          <br />
        </div>
      </section>
      <hr />
    </>
  );
}

export default Sponsors;
