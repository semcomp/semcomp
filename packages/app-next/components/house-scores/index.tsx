// import useGetData from '../../libs/hooks/use-get-data';
// import API from '../../api';
// import Spinner from '../spinner';
// import HousePoints from './house-points';

import "../../styles/House-Scores.module.css";

function HouseScores() {
  // Remove this to show scores again.
  return (
    <div className="house-scores-component__root">
      <h1 className="house-scores-component__title">Pontuações</h1>
      <p style={{ textAlign: "center", maxWidth: "300px" }}>
        As pontuações serão reveladas na sexta-feira (01/10 às 19h) durante o
        encerramento da Semcomp.
      </p>
    </div>
  );

  // const { data, error, isLoading } = useGetData(API.getHouseScores);

  // if (isLoading) return <Spinner />;

  // if (error) return <div>Houve um erro ao buscar as pontuações das casa.</div>;

  // const houses = data;
  // const largestScore = houses.reduce((prev, curr) => (prev > curr.score ? prev : curr.score), 0);

  // return (
  //   <div className="house-scores-component__root">
  //     <h1 className="house-scores-component__title">Pontuações</h1>
  //     {houses.map((house) => (
  //       <HousePoints
  //         key={house.name}
  //         largestScore={largestScore}
  //         name={house.name}
  //         score={house.score}
  //       />
  //     ))}
  //   </div>
  // );
}

export default HouseScores;
