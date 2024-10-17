import { useRouter } from 'next/router';

import { Card } from '@mui/material';

import GameConfig from "../../../libs/game-config";
import Navbar from "../../../components/navbar";
import Sidebar from '../../../components/sidebar';
import Footer from "../../../components/Footer";
import GameStart from "../../../components/game/start";
import { useState } from 'react';
import API from "../../../api"

function StartPage({children}) {
  const router = useRouter();
  const [gameConfig, setGameConfig] = useState(null);
  const { game } =  router.query;
  async function fetchGameConfig() {
    try {
      const result = await API.game.getConfig(game as string);
      
      if(result.data){
        const gameConfigInstance = new GameConfig(result.data);
        setGameConfig(gameConfigInstance);  // Agora você passa a instância da classe
      }
    } catch (e) {
      console.error(e);
    } finally {
    }
  }

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
