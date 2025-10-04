import { useEffect, useState } from "react";
import { useAppContext } from "../libs/contextLib";
import { useRouter } from "next/router";

import SimpleBackground from "../components/home/SimpleBackground";
import ButtonMenuHome from "../components/home/ButtonMenuHome";
import Modal from "../components/home/Modal";
import TitleHome from "../components/home/TitleHome";
import NewFooter from "./newFooter";
import Countdown from "../components/home/Countdown";
import Routes from "../routes";
import handler from "../api/handlers";

import GameIsHappening from "../libs/constants/is-happening-game";
import API from "../api";



const Home: React.FC = () => {
  const { user, setUser, setToken } = useAppContext();
  const router = useRouter();
  const [buttonSelected, setButtonSelected] = useState("");
  const isUserLoggedIn = Boolean(user);
  const [openSignup, setOpenSignup] = useState(true);
  const [isMobile, setisMobile] = useState(true);
  const [happeningGames, setHappeningGames] = useState([]);
  const [loadingGames, setLoadingGame] = useState(true);



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
    setisMobile(window.innerWidth < 1050);
  }, []);



  useEffect(() => {
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!user || !token) {
      setUser(null);
      setToken(null);
    }

    if (window.location.pathname !== router.pathname) {
      router.push(window.location.pathname);
    }
  }, [router, setUser, setToken]);

  function handleInscrevase() {
    router.push(Routes.signup);
  }

  function handleSobre() {
    setButtonSelected("sobre");
  }

  function handleCronograma() {
    setButtonSelected("cronograma");
  }

  function handleFaq() {
    setButtonSelected("faq");
  }

  function handleSponsors() {
    setButtonSelected("sponsors");
  }

  function handleGame(game) {
    router.push(`/game/${game}/lobby`);
  }

  function handleSupporters() {
    setButtonSelected("supporters");
  }

  function handlePerfil() {
    router.push(Routes.profile);
  }

  function handleSair() {
    logUserOut();
    router.push(Routes.home);
  }

  function handleEntrar() {
    router.push(Routes.login);
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Background simples com gradiente */}
      <SimpleBackground />

      {buttonSelected !== "" && (
        <Modal setButtonSelected={setButtonSelected} element={buttonSelected} />
      )}

      {/* Conteúdo principal */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-grow p-8">
        <TitleHome />

        <div className="flex flex-col items-center w-full space-y-2">
          {isUserLoggedIn ? (
            <>
              <div className="mb-1">
                <ButtonMenuHome label="PERFIL" onClick={handlePerfil} />
              </div>
              {
                !loadingGames && 
                happeningGames.length > 0 &&
                happeningGames.map((game, index) => (
                  game.isHappening &&
                  <div key={index} className="mb-1">
                    <ButtonMenuHome 
                      label={game.title.toUpperCase()}
                      onClick={() => handleGame(game.prefix)} />
                  </div>
                ))
              }
            </>
          ) : (
            <>
              <div className="mb-1">
                <ButtonMenuHome label="INSCREVA-SE" onClick={handleInscrevase} />
              </div>
              <div className="mb-1">
                <ButtonMenuHome label="ENTRAR" onClick={handleEntrar} />
              </div>
            </>
          )}
          <div className="mb-1">
            <ButtonMenuHome label="SOBRE" onClick={handleSobre} />
          </div>
          <div className="mb-1">
            <ButtonMenuHome label="CRONOGRAMA" onClick={handleCronograma} />
          </div>
          <div className="mb-1">
            <ButtonMenuHome label="FAQ" onClick={handleFaq} />
          </div>
          <div className="mb-1">
            <ButtonMenuHome label="PATROCINADORES" onClick={handleSponsors} />
          </div>
          <div className="mb-1">
            <ButtonMenuHome label="APOIADORES" onClick={handleSupporters} />
          </div>
          {isUserLoggedIn && (
            <div className="mb-1">
              <ButtonMenuHome label="SAIR" onClick={handleSair} />
            </div>
          )}
        </div>
        <div className="mt-8">
          <Countdown />
        </div>
      </div>
      {/* {
        !isMobile &&
        <Sponsors />
      } */}

      {/* Footer */}
      <NewFooter />
    </div>
  );
};

export default Home;
