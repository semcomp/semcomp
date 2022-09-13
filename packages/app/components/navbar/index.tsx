import { useRouter } from "next/router";

import Navlink from "./nav-link"; // a link reference 'a' with the appearance of a button
import Routes from "../../routes";
import SemcompLogo from "../../assets/logo.svg";
import { useAppContext } from "../../libs/contextLib";
import NavLink from "./nav-link";
import Image from "next/image";

const Navbar = (props) => {
  const { user } = useAppContext();
  const router = useRouter();
  const isUserLoggedIn = Boolean(user);

  const tShirtsFormLink =
    "https://docs.google.com/forms/d/e/1FAIpQLSdBUY4gf8-CKhoXEmZ_bIvovprtGi7KOwNuo2WFcfsejl6a5w/viewform";

  function logUserOut() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push(Routes.home);
  }

  const classnameProperties = props.bg ? "text-center p-4 w-full {bg-primary} md:flex md:justify-between md:items-center " + props.bg : "text-center p-4 w-full {bg-primary} md:flex md:justify-between md:items-center bg-primary";

  return (
    <nav className={classnameProperties}>
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
            <button
              onClick={logUserOut}
              className="flex justify-center items-center px-2 py-2 mx-2 mb-2 text-lg text-white rounded-lg hover:bg-hoverWhite duration-200"
            >
              Sair
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
