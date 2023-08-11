import Link from "next/link";

import AmdocsLogo from "../../assets/sponsors/svg/amdocs.svg";
// import FEstudar from "../../assets/sponsors/FundacaoEstudar.png";
import EyLogo from "../../assets/sponsors/EYlogoVertical.jpeg";
import EyLogoSF from "../../assets/sponsors/EYLogoSemFundo.png";
import GaneshImage from "../../assets/sponsors/ganesh.png";
import GriauleLogo from "../../assets/sponsors/GriauleLogo.svg";
import LuizalabsLogo from "../../assets/sponsors/LuizalabsLogo.png";
import RaizenLogo from "../../assets/sponsors/RaizenLogo.png";
import SerasaLogo from "../../assets/sponsors/SerasaLogo.png";
import TokenlabLogo from "../../assets/sponsors/TokenlabLogo.png";
import TractianLogo from "../../assets/sponsors/TractianLogo.png";
import LugoBots from "../../assets/sponsors/lugoBots.png";
import IcaroTech from "../../assets/sponsors/icaro.png";
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
  const sponsorsLogos = [LugoBots, IcaroTech];

  return (
    <>
      <section className="flex flex-col items-center text-primary bg-white text-center p-16">
      <h1 id="titulo" className="text-4xl font-bold">
          Patrocinadores confirmados
        </h1>
        <div className="text-base pt-8 max-w-6xl">
          <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:flex lg:m-4 lg:gap-4">
            {sponsorsLogos.map((sponsorsLogo: StaticImageData, index) => (
              <div className="relative h-32 w-48 lg:w-40">
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
        <h1 id="titulo" className="text-4xl font-bold">
          Apoio
        </h1>
        <div className="text-base pt-8 max-w-6xl">
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

          <NavLink href={Routes.sponsors}>
            <div className="bg-grayDark p-3 rounded hover:bg-secondary hover:text-black">
              Saiba mais
            </div>
          </NavLink>
        </div>
      </section>
    </>
  );
}

export default Sponsors;
