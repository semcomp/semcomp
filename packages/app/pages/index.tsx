import { useEffect, useState } from "react";
import { useAppContext } from "../libs/contextLib";
import { useRouter } from "next/router";

import AnimatedBG from "./animatedBG";
import ButtonMenuHome from "../components/home/ButtonMenuHome";
import Modal from "../components/home/Modal";
import TitleHome from "../components/home/TitleHome";
import Footer from "../components/Footer";
import NewFooter from "./newFooter";
import Countdown from "../components/home/Countdown";

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
  const { setUser, setToken } = useAppContext();
  const router = useRouter();
  const [ buttonSelected, setButtonSelected ] = useState('')

  const [imageIndex, setImageIndex] = useState<number>(10);

  useEffect(() => {
    const currentHour = new Date().getHours();
    const matchedImage = timeToImage.find(({ start, end }) => currentHour >= start && currentHour < end);
    setImageIndex(matchedImage?.imgIndex ?? 10); // Se não encontrar uma correspondência, usa o índice 10

  }, []);
  

  //matchedImage?.imgIndex ?? 10

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
    
  }

  function handleSobre() {
    setButtonSelected('sobre')
  }

  function handleCronograma() {
    setButtonSelected('cronograma')
  }

  function handleFaq() {
    setButtonSelected('faq')
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-800">
      {/* Passando o TimeIndex para AnimatedBG */}
      <AnimatedBG imageIndex={imageIndex} />

      {
        buttonSelected !== '' && (
          <Modal setButtonSelected={setButtonSelected} element={buttonSelected} />
        )
      }

      {/* Conteúdo principal */}
      <div className="relative z-20 flex-grow p-8">
        <TitleHome timeIndex={imageIndex}/>

        <div className="flex flex-col items-center w-full gap-4">
          <ButtonMenuHome timeIndex={imageIndex} label="INSCREVA-SE" onClick={handleInscrevase} />
          <ButtonMenuHome timeIndex={imageIndex} label="SOBRE" onClick={handleSobre} />
          <ButtonMenuHome timeIndex={imageIndex} label="CRONOGRAMA" onClick={handleCronograma} />
          <ButtonMenuHome timeIndex={imageIndex} label="FAQ" onClick={handleFaq} />
        </div>
        <div className="mt-8">
        <Countdown timeIndex={imageIndex} />
        </div>
      </div>


      {/* Footer */}
      <NewFooter locale="p" />
    </div>
  );
};

export default Home;
