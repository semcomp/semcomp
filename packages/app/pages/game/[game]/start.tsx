import { useRouter } from 'next/router';

import { Card } from '@mui/material';

import GameConfig from "../../../libs/game-config";
import Game from "../../../libs/constants/game-enum";
import Navbar from "../../../components/navbar";
import Footer from "../../../components/Footer";
import GameStart from "../../../components/game/start";

function StartPage({children}) {
  const router = useRouter();

  const { game } = router.query;

  const gameConfig = new GameConfig(game as Game);

  return (<>
    <Navbar />
      <div className='p-6'>
        <Card className='p-6'>
          <GameStart gameConfig={gameConfig}></GameStart>
        </Card>
      </div>
    <Footer />
  </>);
}

export default StartPage;
