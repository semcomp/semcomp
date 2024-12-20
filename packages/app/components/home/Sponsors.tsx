import Elo from "../../assets/sponsors/elogroup.svg";
import Desktop from "../../assets/sponsors/desktop.svg";
import PortoSeguros from "../../assets/sponsors/Porto Seguros.svg";
import Goldman from "../../assets/sponsors/goldman.svg";
import Venturus from "../../assets/sponsors/venturus.svg";
import Alliage from "../../assets/sponsors/alliage.png";
import Image, { StaticImageData } from "next/image";

function Sponsors() {
  const sponsorsLogos = [Elo, Desktop, PortoSeguros, Goldman, Venturus, Alliage];

  return (
    <>
      <section id="sponsorsBackground" className="flex flex-col items-center text-primary justify-center">
      <h1 className="text-purple-400 superdesktop:text-title-superlarge desktop:text-title-large tablet:text-title-medium medphone:text-title-small phone:text-title-tiny text stroke font-primary">
          Patrocinadores
        </h1>
        <div className="text-base max-w-6xl">
          <div className="grid md:grid-cols-3 md:gap-12 phone:grid-cols-2 phone:gap-4 tablet:grid-cols-3 tablet:gap-8">
            {sponsorsLogos.map((sponsorsLogo: StaticImageData, index) => (
              <div className="relative md:h-44 md:w-44 tablet:h-32 tablet:w-32 phone:h-28 phone:w-28 lg:w-60">
                <Image
                  alt={"Logo " + sponsorsLogos[index].toString()}
                  src={sponsorsLogo}
                  layout="fill"
                  objectFit="contain"
                />
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
