import { useRouter } from "next/router";
import Navlink from "./nav-link"; // a link reference 'a' with the appearance of a button
import Routes from "../../routes";
import SemcompLogo from "../../assets/27-imgs/logo.png";
import { useAppContext } from "../../libs/contextLib";
import handler from '../../api/handlers';
import { useEffect, useState } from "react";
import Modal from "../home/Modal"; // Importação do modal
import API from "../../api";
import GameIsHappening from "../../libs/constants/is-happening-game";

const Navbar = (props) => {
  const { user } = useAppContext();
  const router = useRouter();
  const isUserLoggedIn = Boolean(user);
  const [openSignup, setOpenSignup] = useState(true);
  const [buttonSelected, setButtonSelected] = useState(''); // Estado para controlar o modal
  const [loadingGames, setLoadingGame] = useState(true);
  const [happeningGames, setHappeningGames] = useState([]);

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
      setOpenSignup(config.openSignup); 
    } catch (error) {
        console.log(error);
    }
  }

  async function fetchGameHappening() {
    try {
      setLoadingGame(true);
      const result = await API.game.getIsHappening();
            
      if (result.data) {
        const data = result.data;
        const parsedData: GameIsHappening[] = data.isHappeningGames.map((item: any) => ({
          title: item.title,
          prefix: item.prefix,
          isHappening: item.isHappening
        }));
        
        setHappeningGames(parsedData); 
      }
    } catch (e) {
      console.error(e);
    } finally{
      setLoadingGame(false);
    }
  }

  useEffect(() => {
    fetchData();
    fetchGameHappening();
  }, []);

  let logoSize;
  let navStyles =
    "text-center px-4 w-full font-secondary md:flex md:justify-between md:items-center mobile:hidden";

  props.bg ? (navStyles += props.bg) : (navStyles += " bg-white text-primary shadow-lg z-50");
  props.bg ? logoSize = 80 : logoSize = 50;

  // Funções para abrir o modal de "Sobre nós" e "Cronograma"
  function handleSobre() {
    setButtonSelected('sobre');
  }

  function handleCronograma() {
    setButtonSelected('cronograma');
  }

  return (
    <>
      {/* Navbar */}
      <nav className={navStyles}>
        <Navlink href={Routes.home}>
          <div id="logo-img">
            <img
              alt="Semcomp logo"
              src={SemcompLogo.src}
              className="flex items-center justify-center"
              height={logoSize}
              width={logoSize}
            />
          </div>
        </Navlink>

        <div className="text-lg text-center md:flex md:flex-row font-secondary"> {/* Aumenta o tamanho da fonte */}
          {/* Transformando "Sobre nós" e "Cronograma" em botões */}
          <button 
            onClick={handleSobre} 
            className="mx-4 text-lg cursor-pointer nav-link font-secondary focus:outline-none" // Adicionando espaçamento e removendo outline
          >
            Sobre nós
          </button>
          <button 
            onClick={handleCronograma} 
            className="mx-4 text-lg cursor-pointer nav-link font-secondary focus:outline-none" // Adicionando espaçamento e removendo outline
          >
            Cronograma
          </button>
          {isUserLoggedIn ? (
            <>
              <Navlink href={Routes.profile} className="text-lg font-secondary">Perfil</Navlink>
              {
                !loadingGames && 
                happeningGames.length > 0 &&
                happeningGames.map((game, index) => (
                  game.isHappening &&
                  <Navlink 
                    key={index} 
                    href={`/game/${game.prefix}/lobby`}
                    className="text-lg font-secondary" >{game.title}</Navlink>
                ))
              }
              <button onClick={logUserOut} className="text-lg nav font-secondary">
                <a
                  className="flex items-center justify-center px-2 text-lg duration-200 rounded-lg hover:bg-hoverWhite"
                  href="/"
                >
                  Sair
                </a>
              </button>
            </>
          ) : (
            <>
              <Navlink href={Routes.signup} className="text-lg font-secondary">Cadastrar</Navlink>
              <Navlink href={Routes.login} className="text-lg font-secondary">Entrar</Navlink>
            </>
          )}
        </div>
      </nav>

      {/* Exibição do modal */}
      {buttonSelected !== '' && (
        <Modal setButtonSelected={setButtonSelected} element={buttonSelected} />
      )}
    </>
  );
};

export default Navbar;