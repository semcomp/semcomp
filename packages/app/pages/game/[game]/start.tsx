import { useRouter } from 'next/router';

import { Card } from '@mui/material';

import GameConfig from "../../../libs/game-config";
import Navbar from "../../../components/navbar";
import Sidebar from '../../../components/sidebar';
import Footer from "../../../components/Footer";
import GameStart from "../../../components/game/start";

function StartPage({children}) {
  const router = useRouter();

  const { game } = router.query;

  const gameConfig = new GameConfig(game as string);

  return (<>
    <Navbar />
    <Sidebar />
      <div className='p-6'>
        <Card className='p-6'>
          <GameStart gameConfig={gameConfig}></GameStart>
        </Card>
      </div>
    <Footer />
  </>);
}

export default StartPage;
