import useGetData from '../../libs/hooks/use-get-data';
import API from '../../api';
import Spinner from '../spinner';
import HousePoints from './house-points';

function HouseScores() {
  const { data, error, isLoading } = useGetData(API.getHouseScores);

  if (isLoading) return <Spinner />;

  if (error) return <div>Houve um erro ao buscar as pontuações das casa.</div>;

  const houses = data;
  const largestScore = houses.reduce((prev, curr) => (prev > curr.score ? prev : curr.score), 0);

  return (<>
      {houses.map((house) => (
        <HousePoints
          key={house.name}
          largestScore={largestScore}
          name={house.name}
          score={house.score}
        />
      ))}
    </>
  );
}

export default HouseScores;
