import FEstudar from "../../assets/sponsors/FE_branco.png";
import Alura from "../../assets/sponsors/alura-light.svg";
import Visagio from "../../assets/sponsors/visagio.png";
import Image, { StaticImageData } from "next/image";

function Supportes() {
  const supporterLogos = [Alura, FEstudar, Visagio];

  return (
    <>
      <section id="sponsorsBackground" className="flex flex-col items-center text-primary justify-center">
        <h1 className="text-purple-400 superdesktop:text-title-superlarge desktop:text-title-large tablet:text-title-medium medphone:text-title-small phone:text-title-tiny text stroke font-primary">
          Apoio
        </h1>
        <div className="text-base max-w-6xl">
          <div className="grid md:grid-cols-3 md:gap-12 phone:grid-cols-1 phone:gap-4 tablet:grid-cols-3 tablet:gap-8">
            {supporterLogos.map((supporterLogo: StaticImageData, index) => (
              <div className="relative md:h-48 md:w-48 tablet:h-32 tablet:w-32 phone:h-28 phone:w-28 lg:w-60">
                <Image
                  alt={"Logo " + supporterLogos[index].toString()}
                  src={supporterLogo}
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

export default Supportes;
