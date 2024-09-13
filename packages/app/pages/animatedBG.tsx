import { useEffect, useState } from "react";
import { useAppContext } from "../libs/contextLib";
import { useRouter } from "next/router";
import ObjectFly from "../components/home/ObjectFly";
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
import airplane from "../assets/27-imgs/airplane.gif";

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

// filtros aplicados ao avião para cada imagem de fundo
const filtersAirplane = [
  "brightness(0.9) contrast(1.2)",
  "brightness(1.0) hue-rotate(30deg)",
  "brightness(1.1) contrast(0.8)",
  "brightness(1.2) hue-rotate(-20deg)",
  "brightness(1.2) contrast(1.0)",
  "brightness(1.1) sepia(0.3)",
  "brightness(1.0) contrast(1.3)",
  "brightness(1.0) hue-rotate(40deg)",
  "brightness(0.9) contrast(1.3)",
  "brightness(0.7) sepia(0.3)",
  "brightness(0.6) hue-rotate(50deg)"
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

// Adiciona showDevMode como uma prop opcional
interface AnimatedBGProps {
  showDevMode?: boolean;
}

const AnimatedBG: React.FC<AnimatedBGProps> = ({ showDevMode = false }) => {
  const { setUser, setToken } = useAppContext();
  const router = useRouter();

  // estado para a imagem de fundo e outras configurações
  const [backgroundImage, setBackgroundImage] = useState<string>(images[0].src);
  const [bottomImage, setBottomImage] = useState<string>("");
  const [backgroundPosition, setBackgroundPosition] = useState<string>(backgroundPositions[0]);
  const [cloudFilter, setCloudFilter] = useState<string>(filters[0]);
  const [airplaneFilter, setAirplaneFilter] = useState<string>(filtersAirplane[0]); // filtro para o avião
  const [devMode, setDevMode] = useState<boolean>(showDevMode); // usa a prop para setar o modo dev inicialmente
  const [manualBackgroundIndex, setManualBackgroundIndex] = useState<number | null>(null);

  useEffect(() => {
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
      setAirplaneFilter(filtersAirplane[imgIndex]); // aplica o filtro de avião apropriado
    };

    updateBackgroundImage();
    // atualiza a cada 1 hora
    const intervalId = setInterval(updateBackgroundImage, 3600000);
    return () => clearInterval(intervalId);
  }, [router, setUser, setToken, devMode, manualBackgroundIndex]);

  return (
    <main>
      {/* div que contém o background principal */}
      <div
        className="absolute inset-0 z-0" 
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
      
      <ObjectFly
        maxItems={4}
        direction="right"
        image={cloudy.src}
        filter={cloudFilter} // aplica filtro para as nuvens
        minSize={200}
        maxSize={300}
      />

      <ObjectFly
        maxItems={1}
        direction="left"
        image={airplane.src}
        filter={airplaneFilter} // aplica filtro para o avião
        minSize={1000}
        maxSize={1000}
      />

      {/* controles de desenvolvimento */}
      {devMode && (
        <div className="absolute top-0 left-0 z-50 p-4">
          <label>
            <input
              type="checkbox"
              checked={devMode}
              onChange={() => setDevMode(!devMode)}
            />
            modo de desenvolvimento
          </label>
          <div>
            <label>
              altere o background manualmente (0 a {images.length - 1}):
              <input
                type="number"
                value={manualBackgroundIndex ?? ''}
                onChange={(e) => setManualBackgroundIndex(Number(e.target.value))}
                min={0}
                max={images.length - 1}
              />
            </label>
          </div>
        </div>
      )}
    </main>
  );
};

export default AnimatedBG;
