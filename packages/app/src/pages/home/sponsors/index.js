import React from "react";

import "./style.css";

import AmdocsLogo from "../../../assets/sponsors/svg/amdocs_logo.svg";
import AmericanasLogo from "../../../assets/sponsors/svg/americanas_logo.svg";
import ArquiveiLogo from "../../../assets/sponsors/svg/arquivei_logo.svg";
import Elo7Logo from "../../../assets/sponsors/svg/elo7_logo.svg";
import GloboLogo from "../../../assets/sponsors/svg/globo_logo.svg";
import LuizalabsLogo from "../../../assets/sponsors/svg/luizalabs_logo.svg";
import MonitoraLogo from "../../../assets/sponsors/svg/monitora_logo.svg";
import NetbrLogo from "../../../assets/sponsors/svg/netbr_logo.svg";
import OpusLogo from "../../../assets/sponsors/svg/opus_logo.svg";
import TokenlabLogo from "../../../assets/sponsors/svg/tokenlab_logo.svg";
import UltraLogo from "../../../assets/sponsors/svg/ultra_logo.svg";

import IcmcImage from "../../../assets/sponsors/icmc.png";
import FogImage from "../../../assets/sponsors/fog.png";
import CodelabImage from "../../../assets/sponsors/codelab.png";
import GaneshImage from "../../../assets/sponsors/ganesh.png";
import JuniorImage from "../../../assets/sponsors/junior.png";
import GemaImage from "../../../assets/sponsors/gema.png";
import PetImage from "../../../assets/sponsors/pet.png";
import { Routes } from "../../../router";
import { Link } from "react-router-dom";

function Sponsors() {
  const companyLogos = [
    AmdocsLogo,
    AmericanasLogo,
    ArquiveiLogo,
    Elo7Logo,
    GloboLogo,
    LuizalabsLogo,
    MonitoraLogo,
    NetbrLogo,
    OpusLogo,
    TokenlabLogo,
    UltraLogo,
  ];
  const companyAlts = [
    "Logo da Amdocs com um degradê de laranja para rosa e o nome da empresa ao lado",
    "Logo da Americanas vermelho, com linhas em cima e embaixo do nome da empresa",
    "Logo da Arquivei azul, com uma seta em formato de nuvem apontando para uma folha de papel",
    "Logo da Elo7 amarelo",
    "Logo da Globo colorido em tons de arco-íris",
    "Logo da Luizalabs azul e cinza com um círculo no canto superior direito",
    "Logo da Monitora verde e preto",
    "Logo da Netbr azul e verde",
    "Logo da Opus vermelho e cinza",
    "Logo da Tokenlab azul e cinza com o nome da empresa em cinza",
    "Logo da Ultra azul e verde com o nome da empresa em azul escuro",
  ];

  const supporterLogos = [
    IcmcImage,
    FogImage,
    CodelabImage,
    GaneshImage,
    JuniorImage,
    GemaImage,
    PetImage,
  ];
  const supporterAlts = [
    "Logo do ICMC azul",
    "Logo do Fellowship of the Game azul e amarelo",
    "Logo do USP Codelab preto e verde com nome do grupo ao lado",
    "Logo do Ganesh verde e rosa",
    "Logo do ICMC Junior azul com o nome do grupo em azul e verde ao lado",
    "Logo do Gema azul com o balão amarelo ao lado",
    "Logo do Pet Computação verde com nome do grupo em preto ao lado",
  ];

  return (
    <>
      <div className="shiny-divider"></div>
      <section className="home-sponsors">
        <h2>Patrocínio</h2>
        <div className="home-sponsors-card">
          <div className="home-sponsors-card-content">
            {companyLogos.map((companyLogo, i) => (
              <div
                className="company-logo"
                style={{ backgroundImage: `url('${companyLogo}')` }}
                alt={companyAlts[i]}
              />
            ))}
          </div>
        </div>
        <br />
        <h2>Apoio</h2>
        <div className="home-sponsors-card">
          <div className="home-sponsors-card-content">
            {supporterLogos.map((supporterLogo, i) => (
              <div
                className="company-logo"
                style={{ backgroundImage: `url('${supporterLogo}')` }}
                alt={supporterAlts[i]}
              />
            ))}
          </div>
        </div>
        <br />
        <Link className="home-sponsors-knowmore" to={Routes.sponsors}>
          Saiba mais
        </Link>
      </section>
    </>
  );
}

export default Sponsors;
