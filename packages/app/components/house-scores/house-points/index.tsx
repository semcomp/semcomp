import Image from "next/image";

import PicaPau from "../../../assets/pica-pau.png";
import OncaPintada from "../../../assets/onca-pintada.png";
import TatuBola from "../../../assets/tatu-bola.png";
import LoboGuara from "../../../assets/lobo-guara.png";

function HousePoints({ name, score, largestScore }) {
  const percentage = (100 * score) / largestScore;

  const houseImageSrc = {
    "Pica-pau": PicaPau,
    "Onça-pintada": OncaPintada,
    "Tatu-bola": TatuBola,
    "Lobo-guara": LoboGuara,
  }[name];

  return (
    <div className="house-points-component__root">
      <Image
        src={houseImageSrc}
        alt="House logo"
        className="house-points-component__logo"
      />
      <div className="house-points-component__text-container">
        <p className="house-points-component__name">{name}</p>
        <p className="house-points-component__score">{score} pontos</p>
        <div className="house-points-component__progress-bar-container">
          <div
            style={{ width: `${percentage}%` }}
            className="house-points-component__progress-bar"
          />
        </div>
      </div>
    </div>
  );
}

export default HousePoints;
