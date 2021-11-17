import React from "react";

import { Link } from "react-router-dom";

import { Routes } from "../../../router";
import BannerSemcomp from "../../../assets/banner.png";

import { useSelector } from "react-redux";

import "./style.css";

const About = () => {
  const isUserLoggedIn = Boolean(useSelector((state) => state.auth.token));

  return (
    <>
      <div className="big-shiny-divider"></div>
      {/* Note: IDs should not be used in most React components. This is one of the
		    few exceptions to allow for hash linking. */}
      <div className="home-about-background">
        <div className="home-about-container" id="about">
          <div className="text-container">
            <h1>Sobre a Semcomp</h1>
            <p>
              A Semcomp é a Semana Acadêmica de Computação dos cursos de
              Ciências de Computação e Sistemas de Informação do ICMC da USP.
              <br />
              <br />
              <strong>
                A sua 24ª edição vai acontecer do dia 25 de setembro até 01 de
                outubro
              </strong>
              , e será totalmente online, gratuita e por meio de plataformas
              como YouTube e Discord.
              <br />
              {!isUserLoggedIn && (
                <>
                  <br />
                  <br />
                  Não deixe de participar, basta criar sua conta!
                  <br />
                  <br />
                </>
              )}
            </p>
            {!isUserLoggedIn && (
              <Link className="about-signup-button" to={Routes.signup}>
                Quero participar!
              </Link>
            )}
            {/* <button className="about-signup-button about-signup-button-disabled">
					Inscrições em breve!
				</button> */}
          </div>
          <img alt="Banner da Semcomp" src={BannerSemcomp} />
        </div>
        <div className="shiny-divider"></div>
      </div>
    </>
  );
};

export default About;
