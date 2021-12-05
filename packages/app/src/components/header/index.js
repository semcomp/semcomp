import React from "react";
import "./style.css";
import NavBar from "../navbar";

import HeaderBackground from "../../assets/navbar-background.png";

const Header = (props) => {
  return (
    <header className="header"  id="header">
      <img src={HeaderBackground} alt="" />

      {/* This div is used to show a dark overlay on top of the image. */}
      <div className="back-drop" />
      <div className="navbar-container">
        <NavBar user={props.user} />
      </div>
      <div className="shiny-divider"></div>
    </header>
  );
};

export default Header;
