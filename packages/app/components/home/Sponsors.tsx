import Link from "next/link";

// import FEstudar from "../../assets/sponsors/FundacaoEstudar.png";
import LugoBots from "../../assets/sponsors/lugo_bots_white.svg";
import IcaroTech from "../../assets/sponsors/icaro_tech_white.svg";
import Yara from "../../assets/sponsors/yara_white.svg";
import SMT from "../../assets/sponsors/smt_white.svg";
import Cohere from "../../assets/sponsors/cohere_white.svg";
import IcmcImage from "../../assets/sponsors/icmc.png";
import FogImage from "../../assets/sponsors/fog.png";
import CodelabImage from "../../assets/sponsors/logo-codelab-sanca.svg";
import PetImage from "../../assets/sponsors/pet.png";
import Ganesh from "../../assets/sponsors/ganesh.png";
import Gema from "../../assets/sponsors/gema2.png";
import Routes from "../../routes";
import Image, { StaticImageData } from "next/image";
import NavLink from "../navbar/nav-link";


function Sponsors() {
  const supporterLogos = [IcmcImage, PetImage, CodelabImage, FogImage, Ganesh, Gema];
  const sponsorsLogos = [LugoBots, IcaroTech, Yara, SMT, Cohere];

  return (
    <>
      <section id="sponsorsBackground" className="flex flex-col items-center text-primary bg-secondary text-center p-16">
      <h1 id="sponsors" className="text-4xl font-bold">
          Patrocinadores
        </h1>
        <div className="text-base pt-8 max-w-6xl">
          <div className="grid gap-10 grid-cols-1 md:grid-cols-2 lg:flex lg:m-4 lg:gap-20">
            {sponsorsLogos.map((sponsorsLogo: StaticImageData, index) => (
              <div className="relative h-60 w-48 lg:w-60">
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
          <NavLink href={Routes.sponsors}>
            <div className="button bg-primary p-3 rounded hover:bg-green3-26 text-white hover:bg-tertiary">
              Saiba mais
            </div>
          </NavLink>
      </section>
      <hr />
    </>
  );
}

export default Sponsors;
