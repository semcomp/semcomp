import { useRouter } from "next/router";

import Navlink from "./nav-link"; // a link reference 'a' with the appearance of a button
import Routes from "../../routes";
import SemcompLogo from "../../assets/27-imgs/logo.png";
import { useAppContext } from "../../libs/contextLib";
import NavLink from "./nav-link";
import handler from '../../api/handlers';
import Image from "next/image";
import { useRef, useEffect, useState } from "react";

const Navbar = (props) => {
  const { user } = useAppContext();
  const router = useRouter();
  const isUserLoggedIn = Boolean(user);
  const [openSignup, setOpenSignup] = useState(true);
  const tShirtsFormLink =
    "https://docs.google.com/forms/d/e/1FAIpQLSdBUY4gf8-CKhoXEmZ_bIvovprtGi7KOwNuo2WFcfsejl6a5w/viewform";

  function logUserOut() {
    router.push(Routes.home);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  async function fetchData() {
    try {
      const config = await handler.config.getConfig().then((res) => res.data);
      //console.log(config);
      setOpenSignup(config.openSignup); 
    } catch (error) {
        console.log(error);
    }
  }

  useEffect(() => {
      fetchData();
  }, []);

  // Se alguma propriedade de estilo para o background (bg) for passada
  // via props, vai adicionar nos estilos da navbar.
  // Caso contrário, só mantém o bg-primary

  let logoSize;

  let navStyles =
    "text-center px-4 w-full font-secondary md:flex md:justify-between md:items-center mobile:hidden";

  props.bg ? (navStyles += props.bg) : (navStyles += " bg-white text-primary shadow-lg z-10");
  props.bg ? logoSize = 80 : logoSize = 50; 
  
  return (
    <nav className={navStyles}>
      <NavLink href={Routes.home}>
        <div id="logo-img">
          <img
            alt="Semcomp logo"
            src={SemcompLogo.src}
            className="flex justify-center items-center"
            height={logoSize}
            width={logoSize}
          />
        </div>
      </NavLink>

      <div className="text-center md:flex md:flex-row">
        {/* <Navlink
          style={{ color: "yellow" }}
          onClick={() =>  
            window.open(tShirtsFormLink, "_blank", "noopener noreferrer")
          }
        >
          Comprar camiseta
        </Navlink> */}
        {/* <Navlink href={Routes.home}>Início</Navlink> */}
        <Navlink href={Routes.home + "#about"}>Sobre nós</Navlink>
        {/* <Navlink href={Routes.sponsors}>Patrocinadores</Navlink> */}
        <Navlink href={Routes.home + "#schedule"}>Cronograma</Navlink>
        {isUserLoggedIn ? (
          <>
            <Navlink href={Routes.riddle}>Riddle</Navlink>
            {/* <Navlink href={Routes.riddlethon}>Riddlethon</Navlink> */}
            {/* <Navlink href={Routes.hardToClick}>Duro de Clicar</Navlink> */}
            {/* <Navlink href={Routes.cts_contest}>CTS & Contest</Navlink> */}
            <Navlink href={Routes.profile}>Perfil</Navlink>
            <button onClick={logUserOut} className="nav">
              <a
                className="flex justify-center items-center px-2 text-lg rounded-lg hover:bg-hoverWhite duration-200"
                href="/"
              >
                Sair
              </a>
            </button>
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
