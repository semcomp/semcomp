import Link from "next/link";

import Navlink from "./nav-link"; // a link reference 'a' with the appearance of a button
import Routes from "../../routes";
import SemcompLogo from "../../assets/logo.svg";
import { useAppContext } from "../../libs/contextLib";
import NavLink from "./nav-link";
import Image from "next/image";

const Navbar = () => {
  const { user, setUser, setToken } = useAppContext();
  const isUserLoggedIn = Boolean(user);

  const tShirtsFormLink =
    "https://docs.google.com/forms/d/e/1FAIpQLSdBUY4gf8-CKhoXEmZ_bIvovprtGi7KOwNuo2WFcfsejl6a5w/viewform";

  function logUserOut() {
    setUser(null);
    setToken(null);
  }

  return (
    <nav className="text-center p-4 w-full bg-primary md:flex md:justify-between md:items-center">
      <NavLink href={Routes.home}>
        <Image
          alt="Semcomp logo"
          src={SemcompLogo.src}
          layout="intrinsic"
          height={50}
          width={50}
        />
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
        <Navlink href={Routes.home}>Início</Navlink>
        <Navlink href={Routes.home + "#about"}>Sobre nós</Navlink>
        {/* <Navlink href={Routes.sponsors}>Patrocinadores</Navlink> */}
        <Navlink href={Routes.home + "#schedule"}>Cronograma</Navlink>
        {isUserLoggedIn ? (
          <>
            {/* <Navlink href={Routes.riddle}>Riddle</Navlink> */}
            {/* <Navlink href={Routes.riddlethon}>Riddlethon</Navlink> */}
            {/* <Navlink href={Routes.hardToClick}>Duro de Clicar</Navlink> */}
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
