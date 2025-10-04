import GameController from '../controllers/game/game.controller';

class CacheManagerService {
  private gameControllers: GameController[] = [];

  registerGameController(controller: GameController) {
    this.gameControllers.push(controller);
  }

  clearUserCache(userId: string) {
    this.gameControllers.forEach(controller => {
      controller.clearUserCache(userId);
    });
  }
}

export default new CacheManagerService();