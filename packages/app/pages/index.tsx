import { useEffect, useState } from "react";
import { useAppContext } from "../libs/contextLib";
import { useRouter } from "next/router";

import AnimatedBG from "./animatedBG";
import ButtonMenuHome from "../components/home/ButtonMenuHome";
import Modal from "../components/home/Modal";
import TitleHome from "../components/home/TitleHome";
import NewFooter from "./newFooter";
import Countdown from "../components/home/Countdown";
import Routes from "../routes";
import handler from "../api/handlers";

import GameIsHappening from "../libs/constants/is-happening-game";
import API from "../api";

// Array com os intervalos de horas e seus respectivos índices de imagens
const timeToImage = [
  { start: 5, end: 7, imgIndex: 0 },
  { start: 7, end: 8, imgIndex: 1 },
  { start: 8, end: 10, imgIndex: 2 },
  { start: 10, end: 12, imgIndex: 3 },
  { start: 12, end: 14, imgIndex: 4 },
  { start: 14, end: 16, imgIndex: 5 },
  { start: 16, end: 17, imgIndex: 6 },
  { start: 17, end: 18, imgIndex: 7 },
  { start: 18, end: 19, imgIndex: 8 },
  { start: 19, end: 22, imgIndex: 9 },
  { start: 0, end: 5, imgIndex: 10 },
];

const Home: React.FC = () => {
  const { user, setUser, setToken } = useAppContext();
  const router = useRouter();
  const [buttonSelected, setButtonSelected] = useState("");
  const isUserLoggedIn = Boolean(user);
  const [openSignup, setOpenSignup] = useState(true);
  const [isMobile, setisMobile] = useState(true);
  const [happeningGames, setHappeningGames] = useState([]);
  const [loadingGames, setLoadingGame] = useState(true);

  const [imageIndex, setImageIndex] = useState<number>(10);

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
    const currentHour = new Date().getHours();
    const matchedImage = timeToImage.find(
      ({ start, end }) => currentHour >= start && currentHour < end
    );
    setImageIndex(matchedImage?.imgIndex ?? 10);
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
    <div className="flex flex-col min-h-screen bg-gray-800">
      {/* Passando o TimeIndex para AnimatedBG */}
      <AnimatedBG imageIndex={imageIndex} />

      {buttonSelected !== "" && (
        <Modal setButtonSelected={setButtonSelected} element={buttonSelected} />
      )}

      {/* Conteúdo principal */}
      <div className="relative z-20 flex flex-col items-center justify-center flex-grow p-8">
        <TitleHome timeIndex={imageIndex} />

        <div className="flex flex-col items-center w-full">
          {isUserLoggedIn ? (
            <>
              <ButtonMenuHome label="PERFIL" onClick={handlePerfil} />
              {
                !loadingGames && 
                happeningGames.length > 0 &&
                happeningGames.map((game, index) => (
                  game.isHappening &&
                  // <p>{game.Game}aaa</p>
                  <ButtonMenuHome 
                    key={index} 
                    label={game.title.toUpperCase()}
                    onClick={() => handleGame(game.prefix)} />
                ))
              }
            </>
          ) : (
            <>
              <ButtonMenuHome label="INSCREVA-SE" onClick={handleInscrevase} />
              <ButtonMenuHome label="ENTRAR" onClick={handleEntrar} />
            </>
          )}
          <ButtonMenuHome label="SOBRE" onClick={handleSobre} />
          <ButtonMenuHome label="CRONOGRAMA" onClick={handleCronograma} />
          <ButtonMenuHome label="FAQ" onClick={handleFaq} />
          <ButtonMenuHome label="PATROCINADORES" onClick={handleSponsors} />
          <ButtonMenuHome label="APOIADORES" onClick={handleSupporters} />
          {isUserLoggedIn && (
          <ButtonMenuHome label="SAIR" onClick={handleSair} />
          )}
        </div>
        <div className="mt-8">
          <Countdown timeIndex={imageIndex} />
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
