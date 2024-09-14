import { useEffect, useState } from "react";
import { useAppContext } from "../libs/contextLib";
import { useRouter } from "next/router";
import AnimatedBG from "./animatedBG";
import ButtonMenuHome from "../components/home/ButtonMenuHome";

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

  // Estado para armazenar o índice da imagem
  const [imageIndex, setImageIndex] = useState<number>(10);

  // Calcula o índice da imagem baseado na hora atual
  useEffect(() => {
    const currentHour = new Date().getHours();
    const matchedImage = timeToImage.find(({ start, end }) => currentHour >= start && currentHour < end);
    setImageIndex(matchedImage?.imgIndex ?? 10);
  }, []);

  // Verifica o usuário e token
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
    // Lógica de ação do botão
  }

  function handleSobre() {

  }

  function handleCronograma() {

  }

  function handleFaq() {
    
  }

  return (
    <main className="relative min-h-screen bg-gray-800">
      {/* Passando o TimeIndex para AnimatedBG */}
      <AnimatedBG imageIndex={1} />

      {/* Conteúdo principal */}
      <div className="relative z-20 p-8">
        <h1 className="text-4xl font-bold text-white">Bem-vindo à Página Inicial da Semcomp</h1>
        <p className="text-white">oioioioii</p>
        <div className="w-full flex items-center flex-col gap-4">
          <ButtonMenuHome timeIndex={imageIndex} label="INSCREVA-SE" onClick={handleInscrevase} />
          <ButtonMenuHome timeIndex={imageIndex} label="SOBRE" onClick={handleInscrevase} />
          <ButtonMenuHome timeIndex={imageIndex} label="CRONOGRAMA" onClick={handleInscrevase} />
          <ButtonMenuHome timeIndex={imageIndex} label="FAQ" onClick={handleInscrevase} />
        </div>
      </div>
    </main>
  );
};

export default Home;
