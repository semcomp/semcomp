import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/actions/auth";

import Navlink from "./nav-link"; // a link reference 'a' with the appearance of a button
import { Routes } from "../../router";
import SemcompLogo from "../../assets/logo-24.png";
import { HashLink } from "react-router-hash-link";

import "./style.css";

const Navbar = () => {
  const isUserLoggedIn = Boolean(useSelector((state) => state.auth.token));
  const dispatch = useDispatch();

  const tShirtsFormLink =
    "https://docs.google.com/forms/d/e/1FAIpQLSdBUY4gf8-CKhoXEmZ_bIvovprtGi7KOwNuo2WFcfsejl6a5w/viewform";

  function logUserOut() {
    dispatch(logout());
  }

  return (
    <nav className="navbar-content" aria-label="menu">
      <HashLink to={Routes.home + "#header"} role="logo">
        <img alt="Logo da Semcomp" src={SemcompLogo} />
      </HashLink>
      <div className="links-container">
        <Navlink
          style={{ color: "yellow" }}
          onClick={() =>
            window.open(tShirtsFormLink, "_blank", "noopener noreferrer")
          }
        >
          Comprar camiseta
        </Navlink>
        <Navlink href={Routes.home + "#about"}>Sobre nós</Navlink>
        {/* <Navlink
					href={Routes.sponsors}
				>Patrocinadores</Navlink> */}
        {/* <Navlink
					href={Routes.home + '#schedule'}
				>Cronograma</Navlink> */}
        {isUserLoggedIn ? (
          <>
            {/* <Navlink
              href={Routes.riddle}
            >Riddle</Navlink> */}
            {/* <Navlink
              href={Routes.riddlethon}
            >Riddlethon</Navlink>
            <Navlink
              href={Routes.hardToClick}
            >Duro de Clicar</Navlink> */}
            <Navlink href={Routes.profile}>Perfil</Navlink>
            <Navlink onClick={logUserOut} href={Routes.home}>
              Sair
            </Navlink>
          </>
        ) : (
          <>
            <Navlink href={Routes.signup}>Cadastrar</Navlink>
            <Navlink href={Routes.login}>Entrar</Navlink>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
