import React from "react";

import { Link } from "react-router-dom";

import NavBar from "../../../components/navbar";
import { Routes } from "../../../router";

import { useSelector } from "react-redux";

import BackgroundImage from "../../../assets/home-background.png";
import Countdown from "../countdown";

import "./style.css";

const HomeHeader = (props) => {
  const isUserLoggedIn = Boolean(useSelector((state) => state.auth.token));

  return (
    <header className="home-header" id="home-header">
      {/* <img alt='' src={BackgroundImage} /> */}
      {/* <div className="backdrop" /> */}
      <div className="navbar-container">
        <NavBar user={props.user} />
      </div>
      <div className="main-texts">
        <h1 className="semcomp-edition">SEMCOMP 25</h1>
        <h1 className="beta-text">Em breve</h1>
      </div>
      <div className="text-container">
        <h1>
          A maior semana acadêmica de computação do Brasil!
          {/* <br />
          De 25 de setembro a 01 de outubro */}
        </h1>
        {/* {!isUserLoggedIn && (
          <Link className="home-signup-button" to={Routes.signup}>
            Inscreva-se
          </Link>
        )} */}
        <Countdown/>
        {/* <button className="home-signup-button home-signup-button-disabled">
					Inscrições em breve!
				</button> */}
      </div>
    </header>
  );
};

export default HomeHeader;
