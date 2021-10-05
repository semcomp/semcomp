import React from "react";

import Header from "../../components/header";
import Footer from "../../components/footer";
import SponsorCard from "./sponsor-card";

// import SemcompImage from '../../assets/logo_semcompbeta.jpg';
import AmdocsLogo from "../../assets/sponsors/svg/amdocs_logo.svg";
import AmericanasLogo from "../../assets/sponsors/svg/americanas_logo.svg";
import ArquiveiLogo from "../../assets/sponsors/svg/arquivei_logo.svg";
import Elo7Logo from "../../assets/sponsors/svg/elo7_logo.svg";
import GloboLogo from "../../assets/sponsors/svg/globo_logo.svg";
import LuizalabsLogo from "../../assets/sponsors/svg/luizalabs_logo.svg";
import MonitoraLogo from "../../assets/sponsors/svg/monitora_logo.svg";
import NetbrLogo from "../../assets/sponsors/svg/netbr_logo.svg";
import OpusLogo from "../../assets/sponsors/svg/opus_logo.svg";
import TokenlabLogo from "../../assets/sponsors/svg/tokenlab_logo.svg";
import UltraLogo from "../../assets/sponsors/svg/ultra_logo.svg";

import IcmcImage from "../../assets/sponsors/icmc.png";
import FogImage from "../../assets/sponsors/fog.png";
import CodelabImage from "../../assets/sponsors/codelab.png";
import GaneshImage from "../../assets/sponsors/ganesh.png";
import JuniorImage from "../../assets/sponsors/junior.png";
import GemaImage from "../../assets/sponsors/gema.png";
import PetImage from "../../assets/sponsors/pet.png";

import "./style.css";

const allCompaniesInfo = [
  {
    companyName: "Amdocs",
    companyLinks: {
      homepage: "https://www.amdocs.com/",
      linkedin: "https://www.linkedin.com/company/amdocs/",
      instagram: "https://www.instagram.com/amdocs_saocarlos/",
      facebook: "https://www.facebook.com/amdocs",
    },
    companyLogo: AmdocsLogo,
  },
  {
    companyName: "Americanas SA",
    companyLinks: {
      homepage: "https://ri.americanas.com/",
      linkedin: "https://www.linkedin.com/company/americanas-sa/",
    },
    companyLogo: AmericanasLogo,
  },
  {
    companyName: "Arquivei",
    companyLinks: {
      homepage: "https://www.arquivei.com.br/",
      linkedin: "https://www.linkedin.com/company/arquivei/",
      instagram: "https://www.instagram.com/arquiveioficial/",
      facebook: "https://www.facebook.com/arquivei/",
    },
    companyLogo: ArquiveiLogo,
  },
  {
    companyName: "Elo7",
    companyLinks: {
      homepage: "https://www.elo7.com.br/",
      linkedin: "https://www.linkedin.com/company/elo7/",
      instagram: "https://www.instagram.com/elo7br/",
      facebook: "https://www.facebook.com/elo7br/",
    },
    companyLogo: Elo7Logo,
  },
  {
    companyName: "Globo",
    companyLinks: {
      linkedin: "https://www.linkedin.com/company/globo/",
      facebook: "https://www.facebook.com/globo",
    },
    companyLogo: GloboLogo,
  },
  {
    companyName: "luizalabs",
    companyLinks: {
      linkedin: "https://www.linkedin.com/company/luizalabs/",
      instagram: "https://www.instagram.com/luizalabs/",
      facebook: "https://www.facebook.com/luizalabs",
    },
    companyLogo: LuizalabsLogo,
  },
  {
    companyName: "Monitora",
    companyLinks: {
      homepage: "https://www.monitoratec.com.br/",
      linkedin:
        "https://www.linkedin.com/company/monitora-solu%C3%A7%C3%B5es-tecnol%C3%B3gicas/",
      instagram: "https://www.instagram.com/monitoratec",
      facebook: "https://www.facebook.com/monitoratec/",
    },
    companyLogo: MonitoraLogo,
  },
  {
    companyName: "Netbr",
    companyLinks: {
      homepage: "https://netbr.com.br/",
      linkedin: "https://www.linkedin.com/company/netbr/",
      facebook: "https://www.facebook.com/www.netbr.com.br",
    },
    companyLogo: NetbrLogo,
  },
  {
    companyName: "Opus Software",
    companyLinks: {
      homepage: "https://www.opus-software.com.br/",
      linkedin: "https://www.linkedin.com/company/opus-software/",
      instagram: "https://www.instagram.com/opus_software/",
      facebook: "https://www.facebook.com/Opus.Software",
    },
    companyLogo: OpusLogo,
  },
  {
    companyName: "TokenLab",
    companyLinks: {
      homepage: "https://www.tokenlab.com.br/pt/",
      linkedin: "https://www.linkedin.com/company/tokenlab",
      instagram: "https://www.instagram.com/tokenlab/",
      facebook: "https://www.facebook.com/tokenlab",
    },
    companyLogo: TokenlabLogo,
  },
  {
    companyName: "Ultra",
    companyLinks: {
      homepage: "https://www.ultra.com.br/",
      linkedin: "https://br.linkedin.com/company/_ultra",
      instagram: "https://www.instagram.com/eunoultra",
      facebook: "https://www.facebook.com/EuNoUltra/",
    },
    companyLogo: UltraLogo,
  },
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
    companyName: "Ganesh",
    companyLogo: GaneshImage,
  },
  {
    companyName: "Fog",
    companyLogo: FogImage,
  },
  {
    companyName: "Gema",
    companyLogo: GemaImage,
  },
  {
    companyName: "Junior",
    companyLogo: JuniorImage,
  },
];

const SponsorsPage = () => {
  return (
    <div className="sponsors-page">
      <Header />

      {/* This div is here to allow for the aside to be on the right side of the page */}
      <div className="content-container">
        <main className="main-container">
          <h2>Patrocinadores</h2>
          <p className="thanks-from-semcomp">
            Queremos agradecer aos patrocinadores, sem os quais seria impossível
            organizar a nossa Semcomp virtual e gratuita para todo o país. O
            auxílio deles ainda nos permitiu ampliar nossas fronteiras, por meio
            da inclusão de acessibilidade das nossas atividades. Por fim,
            esperamos que tanto os alunos quanto as empresas possam aproveitar
            ao máximo a feira de profissões, e que ano que vem mantenhamos essa
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
