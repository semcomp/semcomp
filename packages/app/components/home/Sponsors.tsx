import Image, { StaticImageData } from "next/image";

import BTG from "../../assets/sponsors/btg_logo.svg";
import BemAgro from "../../assets/sponsors/bem_agro_logo_verde.png";
import Profusion from "../../assets/sponsors/profusion_logo_blue.png";
import Griaule from "../../assets/sponsors/griaule_logo_blue.svg";
import Alliage from "../../assets/sponsors/aliage_logo_blue.jpg";

function Sponsors() {
  const sponsorsLogos = [
    { src: Alliage, isSvg: false, width: 150, height: 45, hasWhiteBg: true },
    { src: BTG, isSvg: true, width: 300, height: 300, hasWhiteBg: true },
    { src: BemAgro, isSvg: false, hasWhiteBg: true },
    { src: Profusion, isSvg: false, hasWhiteBg: true },
    { src: Griaule, isSvg: true, hasWhiteBg: true },
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

        <div className="text-base max-w-6xl">
          <div className="grid md:grid-cols-3 md:gap-12 phone:grid-cols-2 phone:gap-4 tablet:grid-cols-3 tablet:gap-8">
          {sponsorsLogos.map((logo, index) => {
              const content = logo.isSvg ? (
                <logo.src
                  className="w-full h-full object-contain"
                  width={logo.width || 150}
                  height={logo.height || 50}
                />
              ) : (
                <Image
                  src={logo.src as StaticImageData}
                  alt={`Logo ${index}`}
                  width={logo.width || 150}
                  height={logo.height || 50}
                  className="w-full h-full object-contain"
                />
              );

              return (
                <div
                  key={index}
                  className="relative md:h-44 md:w-44 tablet:h-32 tablet:w-32 phone:h-28 phone:w-28 lg:w-60 flex items-center justify-center"
                >
                  {logo.hasWhiteBg ? (
                    <div
                      className="bg-white p-2 rounded-md flex items-center justify-center"
                      style={{
                        width: 150,
                        height: 100,
                      }}
                    >
                      {content}
                    </div>
                  ) : (
                    content
                  )}
                </div>
              );
            })}
          </div>
          <br />
        </div>
      </section>
      <hr />
    </>
  );
}

export default Sponsors;
