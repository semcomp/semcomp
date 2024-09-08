import { useEffect, useState } from "react";
import { useAppContext } from "../libs/contextLib";
import { useRouter } from "next/router";
import image1 from "../assets/27-imgs/bgs/1.jpg";
import image2 from "../assets/27-imgs/bgs/2.jpg";
import image3 from "../assets/27-imgs/bgs/3.jpg";
import image4 from "../assets/27-imgs/bgs/4.jpg";
import image5 from "../assets/27-imgs/bgs/5.jpg";
import image6 from "../assets/27-imgs/bgs/6.jpg";
import image7 from "../assets/27-imgs/bgs/7.jpg";
import image8 from "../assets/27-imgs/bgs/8.jpg";
import image9 from "../assets/27-imgs/bgs/9.jpg";
import image10 from "../assets/27-imgs/bgs/10.jpg";
import image11 from "../assets/27-imgs/bgs/11.jpg";

import image3bottom from "../assets/27-imgs/bgs-bottom/3.png";
import image4bottom from "../assets/27-imgs/bgs-bottom/4.png";
import image5bottom from "../assets/27-imgs/bgs-bottom/5.png";
import image6bottom from "../assets/27-imgs/bgs-bottom/6.png";
import image7bottom from "../assets/27-imgs/bgs-bottom/7.png";
import image10bottom from "../assets/27-imgs/bgs-bottom/10.png";
import image11bottom from "../assets/27-imgs/bgs-bottom/11.png";

// array dos backgrounds
const images = [
  image1, image2, image3, image4, image5, image6, 
  image7, image8, image9, image10, image11
];

// associação dos bottoms apenas para os backgrounds 3, 4, 5, 6, 7, 10 e 11
const bottomImagesMap: { [key: number]: string } = {
  2: image3bottom.src,  // Index 2 para image3
  3: image4bottom.src,  // Index 3 para image4
  4: image5bottom.src,  // Index 4 para image5
  5: image6bottom.src,  // Index 5 para image6
  6: image7bottom.src,  // Index 6 para image7
  9: image10bottom.src, // Index 9 para image10
  10: image11bottom.src // Index 10 para image11
};

// cada background tem um horário específico
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

// posição do background levando em conta a posição do sol/lua
const backgroundPositions = [
  "left bottom", "left bottom", "left center", "center top", "center top",
  "center top", "right center", "right bottom", "right bottom", "left center", "center top"
];

const Home: React.FC = () => {
  const { setUser, setToken } = useAppContext();
  const router = useRouter();
  const [backgroundImage, setBackgroundImage] = useState<string>(images[0].src);
  const [bottomImage, setBottomImage] = useState<string>(""); // Estado para a imagem bottom
  const [backgroundPosition, setBackgroundPosition] = useState<string>(backgroundPositions[0]);

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
      const currentHour = new Date().getHours();
      const matchedImage = timeToImage.find(({ start, end }) => currentHour >= start && currentHour < end);
      const imgIndex = matchedImage?.imgIndex ?? 10;
      setBackgroundImage(images[imgIndex].src);
      setBottomImage(bottomImagesMap[imgIndex] || ""); // Define o bottomImage apenas se existir
      setBackgroundPosition(backgroundPositions[imgIndex]);
    };

    updateBackgroundImage();
    const intervalId = setInterval(updateBackgroundImage, 3600000);
    return () => clearInterval(intervalId);
  }, [router, setUser, setToken]);

  return (
    <main
      className="min-h-screen bg-gray-800 home"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundPosition: backgroundPosition,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
      {bottomImage && ( // Exibe a div apenas se houver bottomImage definido
        <div
          style={{
            backgroundImage: `url(${bottomImage})`, // Usa o bottom correspondente
            backgroundPosition: "bottom center",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            height: "100vh", // Ajusta a altura da div
            width: "100%", // Ajusta a largura da div
            position: "absolute", // Faz a div sobrepor o conteúdo
            top: 0, // Coloca no topo
            left: 0, // Alinha à esquerda
            zIndex: 1, // Garante que fique acima do fundo principal
          }}
        >
          {/* Conteúdo opcional pode ser colocado aqui */}
        </div>
      )}
    </main>
  );
};

export default Home;
