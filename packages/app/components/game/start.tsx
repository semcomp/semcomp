import Link from "next/link";

import GameConfig, { GameRoutes } from "../../libs/game-config";

function GameStart({ gameConfig }: { gameConfig: GameConfig }) {
  return (
    <>
      <div className="flex flex-col">
        <h1 className="text-4xl text-center pb-4">{gameConfig.getName}</h1>
        {gameConfig.getDescription()}
        <div className="flex justify-center">
          <button className="bg-tertiary text-white text-lg md:text-2xl m-2 p-2 md:p-4 rounded-2xl hover:bg-secondary hover:text-black w-fit">
            <Link href={gameConfig.getRoutes()[GameRoutes.LOBBY]}>Jogar</Link>
          </button>
        </div>
      </div>
    </>
  );
}

export default GameStart;
