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

// filtros aplicados às nuvens e ao avião para cada imagem de fundo
const filters = [
  "brightness(0.9) contrast(1.2)",
  "brightness(1.0) hue-rotate(30deg)",
  // (outros filtros...)
];

const filtersAirplane = [
  "brightness(0.9) contrast(1.2)",
  "brightness(1.0) hue-rotate(30deg)",
  // (outros filtros...)
];

// posições de background para alinhar corretamente cada imagem de fundo
const backgroundPositions = [
  "left bottom", "left bottom", "left center", "center top", 
  // (outras posições...)
];

interface AnimatedBGProps {
  showDevMode?: boolean;
  imageIndex: number;  // Adicione a prop imageIndex
}

const AnimatedBG: React.FC<AnimatedBGProps> = ({ showDevMode = false, imageIndex }) => {
  const [backgroundImage, setBackgroundImage] = useState<string>(images[imageIndex].src);
  const [bottomImage, setBottomImage] = useState<string>("");
  const [backgroundPosition, setBackgroundPosition] = useState<string>(backgroundPositions[imageIndex]);
  const [cloudFilter, setCloudFilter] = useState<string>(filters[imageIndex]);
  const [airplaneFilter, setAirplaneFilter] = useState<string>(filtersAirplane[imageIndex]);

  useEffect(() => {
    // Atualiza a imagem de fundo e outros estados com base no imageIndex recebido
    setBackgroundImage(images[imageIndex].src);
    setBottomImage(bottomImagesMap[imageIndex] || "");
    setBackgroundPosition(backgroundPositions[imageIndex]);
    setCloudFilter(filters[imageIndex]);
    setAirplaneFilter(filtersAirplane[imageIndex]);
  }, [imageIndex]);

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
    </main>
  );
};

export default AnimatedBG
