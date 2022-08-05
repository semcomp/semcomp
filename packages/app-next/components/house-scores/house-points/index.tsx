import Tardis from "../../../assets/tardis.jpg";
import Ocarina from "../../../assets/ocarina.jpg";
import DeLorean from "../../../assets/delorean.jpg";
import Agamotto from "../../../assets/agamotto.jpg";

import "../../../styles/House-Scores-House-Points.module.css";

function HousePoints({ name, score, largestScore }) {
  const percentage = (100 * score) / largestScore;

  const image = {
    Tardis,
    Ocarina,
    DeLorean,
    Agamotto,
  }[name];

  return (
    <div className="house-points-component__root">
      <img
        src={image.src}
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
