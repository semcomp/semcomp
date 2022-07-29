import React from "react";

import "./style.css";

import IcmcImage from "../../../assets/sponsors/icmc50.png";
import FogImage from "../../../assets/sponsors/fog.png";
import CodelabImage from "../../../assets/sponsors/logo-codelab-sanca.svg";
import PetImage from "../../../assets/sponsors/pet.png";
import { Routes } from "../../../router";
import { Link } from "react-router-dom";

function Sponsors() {
  const companyLogos = [];

  const supporterLogos = [IcmcImage, FogImage, CodelabImage, PetImage];

  return (
    <>
      <div className="shiny-divider"></div>
      <section className="home-sponsors">
        {/* <h1>Patrocínio</h1>
        <div className="home-sponsors-card">
          <div className="home-sponsors-card-content">
            {companyLogos.map((companyLogo) => (
              <div
                className="company-logo"
                style={{ backgroundImage: `url('${companyLogo}')` }}
              />
            ))}
          </div>
        </div> */}
        <br />
        <h1>Apoio</h1>
        <div className="home-sponsors-card">
          <div className="home-sponsors-card-content">
            {supporterLogos.map((supporterLogo, index) => (
              <div
                key={index}
                className="company-logo"
                style={{ backgroundImage: `url('${supporterLogo}')` }}
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
