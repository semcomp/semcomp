import { useEffect, useState } from "react";
import { useAppContext } from "../libs/contextLib";
import { useRouter } from "next/router";
import image1 from "../assets/27-imgs/bgs/1.png";
import image2 from "../assets/27-imgs/bgs/2.png";
import image3 from "../assets/27-imgs/bgs/3.png";
import image4 from "../assets/27-imgs/bgs/4.png";
import image5 from "../assets/27-imgs/bgs/5.png";
import image6 from "../assets/27-imgs/bgs/6.png";
import image7 from "../assets/27-imgs/bgs/7.png";
import image8 from "../assets/27-imgs/bgs/8.png";
import image9 from "../assets/27-imgs/bgs/9.png";
import image10 from "../assets/27-imgs/bgs/10.png";
import image11 from "../assets/27-imgs/bgs/11.png";
import cloudy from "../assets/27-imgs/cloudy.png";

import image3bottom from "../assets/27-imgs/bgs-bottom/3.png";
import image4bottom from "../assets/27-imgs/bgs-bottom/4.png";
import image5bottom from "../assets/27-imgs/bgs-bottom/5.png";
import image6bottom from "../assets/27-imgs/bgs-bottom/6.png";
import image7bottom from "../assets/27-imgs/bgs-bottom/7.png";
import image10bottom from "../assets/27-imgs/bgs-bottom/10.png";
import image11bottom from "../assets/27-imgs/bgs-bottom/11.png";

// lista com todas as imagens de background
const images = [
  image1, image2, image3, image4, image5, image6, 
  image7, image8, image9, image10, image11
];

// mapeamento das imagens que ficam na parte inferior, associadas a cada background
const bottomImagesMap: { [key: number]: string } = {
  2: image3bottom.src,  
  3: image4bottom.src,  
  4: image5bottom.src,  
  5: image6bottom.src,  
  6: image7bottom.src,  
  9: image10bottom.src, 
  10: image11bottom.src 
};

// lista de filtros de cores aplicados de acordo com a ambientação de cada bg
const filters = [
  "brightness(0.9) contrast(1.2)", // para image1
  "brightness(1.0) hue-rotate(30deg)", // para image2
  "brightness(1.2) contrast(0.7)", // para image3
  "brightness(1.2) hue-rotate(-20deg)", // para image4
  "brightness(1.2) contrast(1.0)", // para image5
  "brightness(1.1) sepia(0.3)", // para image6
  "brightness(1.0) contrast(1.3)", // para image7
  "brightness(1.0) hue-rotate(60deg)", // para image8
  "brightness(0.7) contrast(1.5)", // para image9
  "brightness(0.6) sepia(0.3)", // para image10
  "brightness(0.5) hue-rotate(90deg)", // para image11
];

// define a correspondência entre faixas de horário e imagens de background
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

// define as posições de background para cada imagem
const backgroundPositions = [
  "left bottom", "left bottom", "left center", "center top", "center top",
  "center top", "right center", "right bottom", "right bottom", "left center", "center top"
];

const Home: React.FC = () => {
  const { setUser, setToken } = useAppContext();
  const router = useRouter();
  
  const [backgroundImage, setBackgroundImage] = useState<string>(images[0].src);
  const [bottomImage, setBottomImage] = useState<string>("");
  const [backgroundPosition, setBackgroundPosition] = useState<string>(backgroundPositions[0]);
  const [cloudFilter, setCloudFilter] = useState<string>(filters[0]); // estado para o filtro da nuvem
  const [clouds, setClouds] = useState<Array<{ id: number, top: number, left: number, width: number }>>([]);

  const [devMode, setDevMode] = useState<boolean>(false);
  const [manualBackgroundIndex, setManualBackgroundIndex] = useState<number | null>(null); 

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

    const updateBackgroundImage = () => {
      let imgIndex;
      if (devMode && manualBackgroundIndex !== null) {
        imgIndex = manualBackgroundIndex;
      } else {
        const currentHour = new Date().getHours();
        const matchedImage = timeToImage.find(({ start, end }) => currentHour >= start && currentHour < end);
        imgIndex = matchedImage?.imgIndex ?? 10;
      }

      setBackgroundImage(images[imgIndex].src);
      setBottomImage(bottomImagesMap[imgIndex] || "");
      setBackgroundPosition(backgroundPositions[imgIndex]);
      setCloudFilter(filters[imgIndex]);
    };

    updateBackgroundImage();
    const intervalId = setInterval(updateBackgroundImage, 3600000);
    return () => clearInterval(intervalId);
  }, [router, setUser, setToken, devMode, manualBackgroundIndex]);

  const initializeClouds = () => {
    const initialClouds: Array<{ id: number, top: number, left: number, width: number }> = [];
    for (let i = 0; i < 4; i++) {
      initialClouds.push({
        id: i,
        top: Math.random() * (window.innerHeight - 200), // Randomiza a posição vertical
        left: Math.random() * window.innerWidth, // Posição inicial aleatória na tela
        width: Math.random() * 150 + 100, // Largura aleatória entre 100 e 250px
      });
    }
    setClouds(initialClouds);
  };

  const moveClouds = () => {
    setClouds((prevClouds) =>
      prevClouds.map((cloud) => {
        let newLeft = cloud.left + 1; // Movimenta a nuvem para a direita

        // Se a nuvem sair pela direita, reaparece na esquerda
        if (newLeft > window.innerWidth) {
          newLeft = -cloud.width;
        }

        return {
          ...cloud,
          left: newLeft,
        };
      })
    );
  };

  useEffect(() => {
    initializeClouds();

    const intervalId = setInterval(moveClouds, 16); // Movimenta as nuvens
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden"; // Desativa a rolagem

    return () => {
      document.body.style.overflow = ""; // Restaura o comportamento padrão ao desmontar
    };
  }, []);
  
  return (
    <main className="relative min-h-screen bg-gray-800">
      {/* Camada de fundo */}
      <div
        className="absolute inset-0 z-10"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundPosition: backgroundPosition,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
      >
        {bottomImage && (
          <div
            style={{
              backgroundImage: `url(${bottomImage})`,
              backgroundPosition: "bottom center",
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              height: "100vh",
              width: "100%",
              position: "absolute",
              top: 0,
              left: 0,
              zIndex: 10,
            }}
          ></div>
        )}
      </div>

      {/* Camada das nuvens */}
      <div className="absolute inset-0 z-20">
        {clouds.map((cloud) => (
          <div
            key={cloud.id}
            className="absolute"
            style={{
              top: `${cloud.top}px`,
              left: `${cloud.left}px`,
              width: `${cloud.width}px`,
              height: '200px',
              backgroundImage: `url(${cloudy.src})`,
              backgroundPosition: 'center',
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              filter: cloudFilter,
            }}
          />
        ))}
      </div>

      {/* Interface para ativar o modo de desenvolvimento e setar manualmente o background */}
      <div className="absolute top-0 left-0 z-50 p-4">
        <label>
          <input
            type="checkbox"
            checked={devMode}
            onChange={() => setDevMode(!devMode)}
          />
          modo de desenvolvimento
        </label>
        {devMode && (
          <div>
            <label>
              defina o background manualmente (0 a {images.length - 1}):
              <input
                type="number"
                value={manualBackgroundIndex ?? ''}
                onChange={(e) => setManualBackgroundIndex(Number(e.target.value))}
                min={0}
                max={images.length - 1}
              />
            </label>
          </div>
        )}
      </div>
    </main>
  );
};

export default Home;
