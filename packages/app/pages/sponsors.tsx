// import SemcompImage from '../../assets/logo_semcompbeta.jpg';

import IcmcImage from "../assets/sponsors/icmc50.png";
import FogImage from "../assets/sponsors/fog.png";
import CodelabImage from "../assets/sponsors/logo-codelab-sanca.svg";
import PetImage from "../assets/sponsors/pet.png";
import Footer from "../components/Footer";
import Navbar from "../components/navbar";
import SponsorCard from "../components/sponsor-card";

const companiesInfo = [
  // {
  //   name: "Amdocs",
  //   links: {
  //     homepage: "https://www.amdocs.com/",
  //     linkedin: "https://www.linkedin.com/company/amdocs/",
  //     instagram: "https://www.instagram.com/amdocs_saocarlos/",
  //     facebook: "https://www.facebook.com/amdocs",
  //   },
  //   logo: AmdocsLogo,
  // },
  // {
  //   name: "Amdocs",
  //   links: {
  //     homepage: "https://www.amdocs.com/",
  //     linkedin: "https://www.linkedin.com/company/amdocs/",
  //     instagram: "https://www.instagram.com/amdocs_saocarlos/",
  //     facebook: "https://www.facebook.com/amdocs",
  //   },
  //   logo: AmdocsLogo,
  // },
];

const supportersInfo = [
  {
    name: "Icmc",
    link: "https://icmcjunior.com.br",
    logo: IcmcImage,
    description: "",
  },
  {
    name: "Pet",
    link: "http://pet.icmc.usp.br/",
    logo: PetImage,
    description: "",
  },
  {
    name: "Codelab",
    link: "https://uclsanca.icmc.usp.br/",
    logo: CodelabImage,
    description: "",
  },
  {
    name: "Fog",
    link: "https://www.fog.icmc.usp.br/",
    logo: FogImage,
    description: "",
  },
  {
    name: "Ganesh",
    link: "https://ganesh.icmc.usp.br/",
    logo: GaneshImage,
    description: "",
  },
];

const SponsorsPage = () => {
  return (
    <div className="min-h-full w-full flex flex-col">
      <Navbar />

      {/* This div is here to allow for the aside to be on the right side of the page */}
      <div className="m-8 flex flex-col items-center md:w-full md:justify-between md:px-16 md:py-8 md:m-0">
        <main className="flex flex-col px-0 py-8">
          <h2 className="text-3xl py-6 font-qatar">Patrocinadores</h2>
          {/* <p className="thanks-from-semcomp">
            Queremos agradecer aos apoiadores, sem os quais seria impossível
            organizar o nosso retorno à Semcomp presencial. Esperamos que tanto
            os alunos quanto os apoiadores possam aproveitar ao máximo as
            palestras, os minicursos e que ano que vem mantenhamos nossa
            parceria!
          </p> */}
          <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:flex lg:m-4">
            {companiesInfo.map((company, index) => (
              <SponsorCard
                key={index}
                companyName={company.name}
                companyLogo={company.logo}
                companyLinks={company.links}
              />
            ))}
          </div>
          <hr />
          <h2 className="text-3xl py-6 font-qatar">Apoiadores</h2>
          <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:flex lg:m-4">
            {supportersInfo.map((supporter, index) => (
              <SponsorCard
                key={index}
                companyDescription={supporter.description}
                companyName={supporter.name}
                companyLogo={supporter.logo}
                companyLinks={supporter.link}
              />
            ))}
          </div>
        </main>
        {/* <aside className="w-full max-w-lg md:px-0 md:py-8"> */}
        {/* TODO - add real link */}
        {/* <a
            href="https://docs.google.com/forms/d/e/1FAIpQLScZB4600MMbYsggMlggQ9Zry_ANWMXJ9OyF1I2il6QwZsdBZQ/viewform"
            className="text-2xl flex items-center justify-center p-4 rounded-lg font-bold mb-12 bg-blue text-white"
          >
            Patrocinar
          </a> */}
        {/* <div className="card">
						<h1>Acontecendo hoje</h1>
						<div>
							<EventRow startTime="10h" endTime="11h" title="Abertura" />
							<EventRow startTime="11h" endTime="12h" title="Palestras" />
							<EventRow selected startTime="14h" endTime="17h" title="Minicurso" />
							<EventRow startTime="19h" endTime="20h" title="Palestras" />
						</div>
					</div> */}
        {/* </aside> */}
      </div>
      <Footer />
    </div>
  );
};

export default SponsorsPage;
