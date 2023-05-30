import Game from "./constants/game-enum";

export enum GameRoutes {
  BASE = "base",
  PLAY = "play",
  LOBBY = "lobby",
  START = "start",
  JOIN_TEAM = "join-team",
  CREATE_TEAM = "create-team",
  LINK = "link",
  GAME = "game",
  GAME_OVER = "game-over",
}

export default class GameConfig {
  private game: Game;

  constructor(game: Game) {
    this.game = game;
  }

  public getGame(): string {
    if (this.game === Game.HARD_TO_CLICK) {
      return 'hard-to-click';
    } else {
      return this.game;
    }
  }

  public getRoutes(): { [key: string]: string } {
    return {
      [GameRoutes.BASE]: `/game/${this.game}`,
      [GameRoutes.PLAY]: `/game/${this.game}/play`,
      [GameRoutes.LOBBY]: `/game/${this.game}/lobby`,
      [GameRoutes.START]: `/game/${this.game}/start`,
      [GameRoutes.JOIN_TEAM]: `/game/${this.game}/join-team`,
      [GameRoutes.CREATE_TEAM]: `/game/${this.game}/create-team`,
      [GameRoutes.LINK]: `/game/${this.game}/link`,
      [GameRoutes.GAME]: `/game/${this.game}/game`,
      [GameRoutes.GAME_OVER]: `/game/${this.game}/game-over`,
    };
  }

  public getStartDate(): Date {
    return new Date("2022-01-23 17:30");
  }

  public getEndDate(): Date {
    return new Date("2023-09-28 17:30");
  }

  public getNumberOfQuestions(): number {
    return 58;
  }
}