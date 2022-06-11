import React from "react";

import Header from "../../components/header";
import Footer from "../../components/footer";
import SponsorCard from "./sponsor-card";

// import SemcompImage from '../../assets/logo_semcompbeta.jpg';

import IcmcImage from "../../assets/sponsors/icmc50.png";
import FogImage from "../../assets/sponsors/fog.png";
import CodelabImage from "../../assets/sponsors/codelab.svg";
import GaneshImage from "../../assets/sponsors/ganesh.png";
import JuniorImage from "../../assets/sponsors/junior.png";
import GemaImage from "../../assets/sponsors/gema.png";
import PetImage from "../../assets/sponsors/pet.png";

import "./style.css";

const allCompaniesInfo = [
  // {
  //   companyName: "Amdocs",
  //   companyLinks: {
  //     homepage: "https://www.amdocs.com/",
  //     linkedin: "https://www.linkedin.com/company/amdocs/",
  //     instagram: "https://www.instagram.com/amdocs_saocarlos/",
  //     facebook: "https://www.facebook.com/amdocs",
  //   },
  //   companyLogo: AmdocsLogo,
  // },
];

const SuportersInfo = [
  {
    companyName: "Icmc",
    companyLogo: IcmcImage,
  },
  {
    companyName: "Pet",
    companyLogo: PetImage,
  },
  {
    companyName: "Codelab",
    companyLogo: CodelabImage,
  },
  {
    companyName: "Fog",
    companyLogo: FogImage,
  },
];

const SponsorsPage = () => {
  return (
    <div className="sponsors-page">
      <Header />

      {/* This div is here to allow for the aside to be on the right side of the page */}
      <div className="content-container">
        <main className="main-container">
          {/* <h2>Patrocinadores</h2> */}
          <p className="thanks-from-semcomp">
            Queremos agradecer aos apoiadores, sem os quais seria impossível
            organizar o nosso retorno à Semcomp presencial. Esperamos que tanto
            os alunos quanto os apoiadores possam aproveitar ao máximo as
            palestras, os minicursos e que ano que vem mantenhamos nossa
            parceria!
          </p>
          <div className="sponsor-cards-container">
            {allCompaniesInfo.map((info) => (
              <SponsorCard {...info} />
            ))}
          </div>
          <hr />
          <h2>Apoiadores</h2>
          <div className="supporters-cards-container">
            {SuportersInfo.map((info) => (
              <SponsorCard {...info} />
            ))}
          </div>
        </main>
        <aside>
          {/* TODO - add real link */}
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLScZB4600MMbYsggMlggQ9Zry_ANWMXJ9OyF1I2il6QwZsdBZQ/viewform"
            className="sponsor-button"
          >
            Patrocinar
          </a>
          {/* <div className="card">
						<h1>Acontecendo hoje</h1>
						<div>
							<EventRow startTime="10h" endTime="11h" title="Abertura" />
							<EventRow startTime="11h" endTime="12h" title="Palestras" />
							<EventRow selected startTime="14h" endTime="17h" title="Minicurso" />
							<EventRow startTime="19h" endTime="20h" title="Palestras" />
						</div>
					</div> */}
        </aside>
      </div>
      <Footer />
    </div>
  );
};

export default SponsorsPage;
