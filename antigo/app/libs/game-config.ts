import Game from "./constants/games";
import API from "../api";

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
  private numberOfQuestions: number;

  constructor(game: Game) {
    this.game = game;
    this.game.startDate = new Date(game.startDate)
    this.game.endDate = new Date(game.endDate)
  }

  public getName(): string {
    return this.game.game;
  }

  public getTitle(): string {
    return this.game.title;
  }

  public getDescription(): string {
    return this.game.description;
  }

  public getRules(): string {
    return this.game.rules;
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

  public hasGroups(): Boolean {
    return this.game.hasGroups;
  }

  public getMaximumNumberOfMembersInGroup(): number {
    return this.game.maximumNumberOfMembersInGroup;
  }

  public async verifyIfIsHappening(): Promise<boolean> {
    // console.log(new Date(Math.max(Date.now() - this.getStartDate().getTime(), 0)).getTime() > 0 && (this.getEndDate().getTime() - Date.now() > 0))
    const result = await API.game.getIsHappening();

    if (!result && !result.data) {
      return false;
    }

    const gameOpen = result.data.isHappeningGames?.find(game => {
      if (game.prefix === this.game.eventPrefix) {
        return game.isHappening;
    }});

    return gameOpen && (new Date(Math.max(Date.now() - this.getStartDate().getTime(), 0)).getTime() > 0) && (this.getEndDate().getTime() - Date.now() > 0)
  }

  public getRoutes(): { [key: string]: string } {
    return {
      [GameRoutes.BASE]: `/game/${this.getName()}`,
      [GameRoutes.PLAY]: `/game/${this.getName()}/play`,
      [GameRoutes.LOBBY]: `/game/${this.getName()}/lobby`,
      [GameRoutes.START]: `/game/${this.getName()}/start`,
      [GameRoutes.JOIN_TEAM]: `/game/${this.getName()}/join-team`,
      [GameRoutes.CREATE_TEAM]: `/game/${this.getName()}/create-team`,
      [GameRoutes.LINK]: `/game/${this.getName()}/link`,
      [GameRoutes.GAME]: `/game/${this.getName()}/game`,
      [GameRoutes.GAME_OVER]: `/game/${this.getName()}/game-over`,
    };
  }
}
