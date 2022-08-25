import Link from 'next/link'

import IcmcImage from "../../assets/sponsors/icmc50.png";
import FogImage from "../../assets/sponsors/fog.png";
import CodelabImage from "../../assets/sponsors/logo-codelab-sanca.svg";
import PetImage from "../../assets/sponsors/pet.png";
import Routes from "../../routes";
import Image, { StaticImageData } from 'next/image';

function Sponsors() {
  const supporterLogos = [IcmcImage, FogImage, CodelabImage, PetImage];

  return (<>
    <section className="flex flex-col items-center text-primary bg-white text-center p-16">
      <h1 className="text-4xl font-bold">Apoio</h1>
      <div className="text-base pt-8 max-w-4xl">
        <div className="grid grid-cols-2 gap-8">
          {supporterLogos.map((supporterLogo: StaticImageData, index) => (
            <div className="flex items-center justify-center relative w-64 h-32" key={index}>
              <Image
                src={supporterLogo}
                alt=""
                layout="intrinsic"
                quality={100}
              ></Image>
            </div>
          ))}
        </div>
        <br />
        <Link href={Routes.sponsors}>
          <span className="bg-primary text-white transition-all hover:bg-white hover:text-primary p-4 shadow-md hover:shadow-none">
            Saiba mais
          </span>
        </Link>
      </div>
    </section>
  </>);
}

export default Sponsors;
