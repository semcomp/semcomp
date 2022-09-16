import Link from "next/link";

import IcmcImage from "../../assets/sponsors/icmc50.png";
import FogImage from "../../assets/sponsors/fog.png";
import CodelabImage from "../../assets/sponsors/logo-codelab-sanca.svg";
import PetImage from "../../assets/sponsors/pet.png";
import Routes from "../../routes";
import Image, { StaticImageData } from "next/image";
import NavLink from "../navbar/nav-link";

function Sponsors() {
  const supporterLogos = [IcmcImage, FogImage, CodelabImage, PetImage];

  return (
    <>
      <section className="flex flex-col items-center text-primary bg-white text-center p-16">
        <h1 id="titulo" className="text-4xl font-bold">
          Apoio
        </h1>
        <div className="text-base pt-8 max-w-4xl">
          <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:flex lg:m-4">
            {supporterLogos.map((supporterLogo: StaticImageData, index) => (
              <div
                className="flex items-center justify-center relative w-64 h-32 m-4"
                key={index}
              >
                <Image
                  src={supporterLogo}
                  alt=""
                  layout="intrinsic"
                  quality={100}
                />
              </div>
            ))}
          </div>
          <br />
          
          <NavLink href={Routes.sponsors}>
            <div className="bg-green p-3 rounded hover:bg-secondary hover:text-black">Saiba mais</div>
          </NavLink>
        </div>
      </section>
    </>
  );
}

export default Sponsors;
