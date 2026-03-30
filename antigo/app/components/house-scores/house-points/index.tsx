import Image from "next/image";

import Indie from "../../../assets/26-imgs/brasao-indie.png";
import Rock from "../../../assets/26-imgs/brasao-rock.png";
import Funk from "../../../assets/26-imgs/brasao-funk.png";
import Pop from "../../../assets/26-imgs/brasao-pop.png";

function HousePoints({ name, score, largestScore }) {
  const percentage = (100 * score) / largestScore;

  const houseImageSrc = {
    "Pop": Pop,
    "Rock":Rock,
    "Indie": Indie,
    "Funk": Funk,
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
        <div className="w-full h-1.5 bg-gray">
          <div
            style={{ width: `${percentage}%` }}
            className="bg-tertiary h-full"
          />
        </div>
      </div>
    </div>
  );
}

export default HousePoints;
