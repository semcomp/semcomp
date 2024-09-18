import Link from "next/link";

import FEstudar from "../../assets/sponsors/FE_branco.png";
import Elo from "../../assets/sponsors/elogroup.svg";
import Alura from "../../assets/sponsors/alura-light.svg";
import Desktop from "../../assets/sponsors/desktop.svg";
import PortoSeguros from "../../assets/sponsors/Porto Seguros.svg";
import Goldman from "../../assets/sponsors/goldman.svg";
import Venturus from "../../assets/sponsors/venturus.svg";
import Routes from "../../routes";
import Image, { StaticImageData } from "next/image";
import NavLink from "../navbar/nav-link";


function Sponsors() {
  const sponsorsLogos = [Elo, Alura, Desktop, PortoSeguros, Goldman, Venturus, FEstudar];

  return (
    <>
      <section id="sponsorsBackground" className="flex flex-col items-center text-primary justify-center">
      <h1 id="sponsors" className="md:text-4xl mobile:text-xl font-bold pt-8 z-20 text-white">
          Patrocinadores
        </h1>
        <div className="text-base max-w-6xl">
          <div className="grid md:grid-cols-4 md:gap-12 phone:grid-cols-2 phone:gap-4 tablet:grid-cols-3 tablet:gap-8">
            {sponsorsLogos.map((sponsorsLogo: StaticImageData, index) => (
              <div className="relative md:h-48 md:w-48 tablet:h-32 tablet:w-32 phone:h-28 phone:w-28 lg:w-60">
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
        {/* <h1 id="sponsors" className="text-4xl font-bold">
          Apoio
        </h1> */}
        {/* <div className="text-base pt-8 max-w-6xl">
          <div className="grid gap-8 grid-cols-1 md:grid-cols-2 place-items-center lg:flex lg:m-4">
            {supporterLogos.map((supporterLogo: StaticImageData, index) => (
                <div className={"relative h-32 w-48 lg:w-58 " + (index == 6 ? "md:col-span-2" : "")}>
                <Image
                  alt={"Logo " + supporterLogos.toString()}
                  src={supporterLogo}
                  layout="fill"
                  objectFit="contain"
                />
              </div>
            ))}
          </div>
          <br />

        </div> */}
          {/* <NavLink href={Routes.sponsors}>
            <div className="button bg-primary p-3 rounded hover:bg-green3-26 text-white hover:bg-tertiary">
              Saiba mais
            </div>
          </NavLink> */}
      </section>
      <hr />
    </>
  );
}

export default Sponsors;
