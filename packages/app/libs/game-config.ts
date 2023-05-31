import Game, { HARD_TO_CLICK, RIDDLE, RIDDLETHON } from "./constants/games";

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

  constructor(gameSlug: string) {
    if (gameSlug === HARD_TO_CLICK.slug) {
      this.game = HARD_TO_CLICK;
      return;
    }
    if (gameSlug === RIDDLETHON.slug) {
      this.game = RIDDLETHON;
      return;
    }
    if (gameSlug === RIDDLE.slug) {
      this.game = RIDDLE;
      return;
    }

    throw Error('Jogo não existente');
  }

  public getName(): string {
    return this.game.name;
  }

  public getDescription(): JSX.Element {
    return this.game.description;
  }

  public getSlug(): string {
    return this.game.slug;
  }

  public getEventPrefix(): string {
    return this.game.eventPrefix;
  }

  public getStartDate(): Date {
    return this.game.startDate;
  }

  public getEndDate(): Date {
    return this.game.endDate;
  }

  public getNumberOfQuestions(): number {
    return this.game.numberOfQuestions;
  }

  public getRoutes(): { [key: string]: string } {
    return {
      [GameRoutes.BASE]: `/game/${this.game.slug}`,
      [GameRoutes.PLAY]: `/game/${this.game.slug}/play`,
      [GameRoutes.LOBBY]: `/game/${this.game.slug}/lobby`,
      [GameRoutes.START]: `/game/${this.game.slug}/start`,
      [GameRoutes.JOIN_TEAM]: `/game/${this.game.slug}/join-team`,
      [GameRoutes.CREATE_TEAM]: `/game/${this.game.slug}/create-team`,
      [GameRoutes.LINK]: `/game/${this.game.slug}/link`,
      [GameRoutes.GAME]: `/game/${this.game.slug}/game`,
      [GameRoutes.GAME_OVER]: `/game/${this.game.slug}/game-over`,
    };
  }
}
