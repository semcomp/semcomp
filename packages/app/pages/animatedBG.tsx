import { useEffect, useState } from "react";
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

// posições de background para alinhar corretamente cada imagem de fundo
const backgroundPositions = [
  "left bottom", "left bottom", "left center", "center top", "center top",
  "center top", "right center", "right bottom", "right bottom", "left center", "center top"
];

interface AnimatedBGProps {
  imageIndex: number;  // Adicione a prop imageIndex
}

const AnimatedBG: React.FC<AnimatedBGProps> = ({ imageIndex }) => {
  const [backgroundImage, setBackgroundImage] = useState<string>(images[imageIndex].src);
  const [bottomImage, setBottomImage] = useState<string>("");
  const [backgroundPosition, setBackgroundPosition] = useState<string>(backgroundPositions[imageIndex]);
  const [cloudFilter, setCloudFilter] = useState<string>(filters[imageIndex]);
  const [airplaneFilter, setAirplaneFilter] = useState<string>(filtersAirplane[imageIndex]);
  const [showObjects, setShowObjects] = useState(true);

  useEffect(() => {
    // Atualiza a imagem de fundo e outros estados com base no imageIndex recebido
    setBackgroundImage(images[imageIndex].src);
    setBottomImage(bottomImagesMap[imageIndex] || "");
    setBackgroundPosition(backgroundPositions[imageIndex]);
    setCloudFilter(filters[imageIndex]);
    setAirplaneFilter(filtersAirplane[imageIndex]);
  }, [imageIndex]);

  useEffect(() => {
    // Função para verificar o nível de zoom da página
    const checkZoomLevel = () => {
      const zoom = window.devicePixelRatio * 100; // Calcula o zoom em porcentagem
      setShowObjects(zoom >= 75); // Se o zoom for menor que 75%, não mostra os objetos
    };

    //verifica o zoom inicial ao carregar a página
    checkZoomLevel();

    // adiciona um listener para verificar o zoom quando a janela é redimensionada
    window.addEventListener("resize", checkZoomLevel);

    // remove o listener quando o componente é desmontado
    return () => {
      window.removeEventListener("resize", checkZoomLevel);
    };
  }, []);

  return (
    <main>
      <div
        className="absolute inset-0 z-0"
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

      {showObjects && (
        <>
          <ObjectFly
            maxItems={4}
            direction="right"
            image={cloudy.src}
            filter={cloudFilter}
            minSize={200}
            maxSize={300}
          />

          <ObjectFly
            maxItems={1}
            direction="left"
            image={airplane.src}
            filter={airplaneFilter}
            minSize={1000}
            maxSize={1000}
          />
        </>
      )}
    </main>
  );
};

export default AnimatedBG;
