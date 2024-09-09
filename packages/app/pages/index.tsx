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

// array com todas as imagens de fundo possíveis
const images = [
  image1, image2, image3, image4, image5, image6, 
  image7, image8, image9, image10, image11
];

// mapeia imagens da parte inferior de acordo com o índice da imagem principal
const bottomImagesMap: { [key: number]: string } = {
  2: image3bottom.src,  
  3: image4bottom.src,  
  4: image5bottom.src,  
  5: image6bottom.src,  
  6: image7bottom.src,  
  9: image10bottom.src, 
  10: image11bottom.src 
};

// filtros aplicados às nuvens para cada imagem de fundo
const filters = [
  "brightness(0.9) contrast(1.2)", 
  "brightness(1.0) hue-rotate(30deg)", 
  "brightness(1.2) contrast(0.7)", 
  "brightness(1.2) hue-rotate(-20deg)", 
  "brightness(1.2) contrast(1.0)", 
  "brightness(1.1) sepia(0.3)", 
  "brightness(1.0) contrast(1.3)", 
  "brightness(1.0) hue-rotate(60deg)", 
  "brightness(0.7) contrast(1.5)", 
  "brightness(0.6) sepia(0.3)", 
  "brightness(0.5) hue-rotate(90deg)"
];

// relaciona o horário com o índice da imagem correspondente
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

// posições de background para alinhar corretamente cada imagem de fundo
const backgroundPositions = [
  "left bottom", "left bottom", "left center", "center top", "center top",
  "center top", "right center", "right bottom", "right bottom", "left center", "center top"
];

interface Cloud {
  id: number;
  top: number;
  left: number;
  width: number;
}

// verificar se a nova posição é válida, considerando o tamanho da nuvem, assim evitando sobreposição
function isValidPosition(newCloud: Cloud, existingClouds: Cloud[]): boolean {
  for (const cloud of existingClouds) {
    // faz o calcula da distância entre as nuvens
    const distance = Math.sqrt(
      Math.pow(newCloud.left - cloud.left, 2) + Math.pow(newCloud.top - cloud.top, 2)
    );
    //  margem mínima proporcional ao tamanho das nuvens
    const minDistance = (newCloud.width + cloud.width) / 2; 

    if (distance < minDistance) {
      return false; // quando a posição é muito próxima de outra nuvem
    }
  }
  return true;
}

// gera uma nova posição aleatória
function generateRandomPosition(): Cloud {
  const top = Math.random() * (window.innerHeight - 350); // Limita a altura para evitar sair da tela
  const left = Math.random() * window.innerWidth;
  const width = Math.random() * 150 + 100; // Tamanho aleatório entre 100px e 250px
  return { id: Date.now(), top, left, width };
}

// inicializa as nuvens com validação de posicionamento
function initializeClouds(numClouds: number, setClouds: React.Dispatch<React.SetStateAction<Cloud[]>>) {
  const initialClouds: Cloud[] = [];
  while (initialClouds.length < numClouds) {
    const newCloud = generateRandomPosition();
    if (isValidPosition(newCloud, initialClouds)) {
      initialClouds.push(newCloud);
    }
  }
  setClouds(initialClouds);
}

const Home: React.FC = () => {
  const { setUser, setToken } = useAppContext();
  const router = useRouter();

  // estado para a imagem de fundo e outras configurações
  const [backgroundImage, setBackgroundImage] = useState<string>(images[0].src);
  const [bottomImage, setBottomImage] = useState<string>("");
  const [backgroundPosition, setBackgroundPosition] = useState<string>(backgroundPositions[0]);
  const [cloudFilter, setCloudFilter] = useState<string>(filters[0]);
  const [clouds, setClouds] = useState<Cloud[]>([]);
  const [showClouds, setShowClouds] = useState<boolean>(true); // controla se as nuvens serão exibidas
  const [devMode, setDevMode] = useState<boolean>(false);
  const [manualBackgroundIndex, setManualBackgroundIndex] = useState<number | null>(null); 
  const [resizeTimeout, setResizeTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // verifica se o usuário e token estão no localStorage
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!user || !token) {
      setUser(null);
      setToken(null);
    }

    // garante que a URL no navegador esteja correta
    if (window.location.pathname !== router.pathname) {
      router.push(window.location.pathname);
    }

    // atualiza a imagem de fundo com base no horário ou no modo dev
    const updateBackgroundImage = () => {
      let imgIndex;
      if (devMode && manualBackgroundIndex !== null) {
        imgIndex = manualBackgroundIndex; // usa índice manual no modo dev
      } else {
        const currentHour = new Date().getHours(); // pega a hora atual
        const matchedImage = timeToImage.find(({ start, end }) => currentHour >= start && currentHour < end);
        imgIndex = matchedImage?.imgIndex ?? 10; // define a imagem de fundo correspondente
      }

      setBackgroundImage(images[imgIndex].src);
      setBottomImage(bottomImagesMap[imgIndex] || ""); // verifica se há imagem de fundo inferior
      setBackgroundPosition(backgroundPositions[imgIndex]);
      setCloudFilter(filters[imgIndex]); // aplica o filtro de nuvens apropriado
    };

    updateBackgroundImage();
    // atualiza a cada 1 hora
    const intervalId = setInterval(updateBackgroundImage, 3600000);
    return () => clearInterval(intervalId);
  }, [router, setUser, setToken, devMode, manualBackgroundIndex]);

  // inicia as nuvens em posições aleatórias com validação de posicionamento
  useEffect(() => {
    initializeClouds(4, setClouds);
    const intervalId = setInterval(() => {
      setClouds((prevClouds) =>
        prevClouds.map((cloud) => {
          let newLeft = cloud.left + 1;
          if (newLeft > window.innerWidth) {
            newLeft = -cloud.width; // reinicia o movimento da nuvem quando o usuário redimensiona
          }
          return { ...cloud, left: newLeft };
        })
      );
    }, 85); // move as nuvens a cada 85ms
    return () => clearInterval(intervalId);
  }, []);

  // trata o redimensionamento da janela, esconde as nuvens e as re-inicializa após estabilização
  useEffect(() => {
    const handleResize = () => {
      setShowClouds(false); // esconde as nuvens durante o redimensionamento
      setClouds([]); // remove todas as nuvens
      
      if (resizeTimeout) {
        clearTimeout(resizeTimeout); // limpa o timeout anterior se houver
      }

      // define um timeout para re-inicializar as nuvens após 500ms de estabilização
      const timeout = setTimeout(() => {
        setShowClouds(true); // exibe as nuvens novamente
        initializeClouds(4, setClouds); // re-inicializa as nuvens após o redimensionamento
      }, 500); // tempo de estabilização

      setResizeTimeout(timeout); // armazena o novo timeout
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (resizeTimeout) {
        clearTimeout(resizeTimeout); // limpa o timeout ao desmontar
      }
    };
  }, [resizeTimeout]);

  return (
    <main className="relative min-h-screen bg-gray-800">
      {/* div que contém o background principal */}
      <div
        className="absolute inset-0 z-10"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundPosition: backgroundPosition,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* imagem de fundo para monitores mais achatados */}
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

      {/* div que contém as nuvens */}
      <div className="absolute inset-0 z-20">
        {showClouds && clouds.map((cloud) => (
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

      {/* controles de desenvolvimento */}
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
