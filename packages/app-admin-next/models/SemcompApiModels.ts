import { TShirtSize } from "../components/t-shirt/TShirtForm";
import EventType from "../libs/constants/event-types-enum";
import Game from "../libs/constants/game-enum";
import { PaginationResponse } from "./Pagination";

export class SemcompApiPaginationRequest {
  private page: number;
  private items: number;

  constructor(page?: number, items?: number) {
    this.page = 1;
    if (page) {
      this.page = page
    }

    this.items = 25;
    if (items) {
      this.items = items
    }
  }

  public getPage(): number {
    return this.page;
  }

  public getItems(): number {
    return this.items;
  }
};

export enum PaymentStatus {
  PENDING = "pending",
  APPROVED = "approved",
};

export type SemcompApiUser = {
  id: string,
  email: string,
  name: string,
  course: string,
  discord: string,
  house: {
    name: string,
  },
  payment: {
    status: PaymentStatus,
    tShirtSize: TShirtSize,
  },
  telegram: string,
  disabilities: string[],
  permission: boolean,
  createdAt: number,
  updatedAt: number,
};

export type SemcompApiGetUsersResponse = PaginationResponse<SemcompApiUser>;

export type SemcompApiLoginResponse = {
  email: string,
  id: string,
};

export type SemcompApiHouse = {
  id: string,
  name: string,
  description: string,
  telegramLink: string,
  score: number,
  createdAt: number,
  updatedAt: number,
};

export type SemcompApiGetHousesResponse = PaginationResponse<SemcompApiHouse>;

export type SemcompApiCreateHouseRequest = {
  name: string;
  description: string;
  telegramLink: string;
};

export type SemcompApiTShirt = {
  id: string,
  size: string,
  quantity: number,
  usedQuantity: number,
  createdAt: number,
  updatedAt: number,
};

export type SemcompApiGetTShirtsResponse = PaginationResponse<SemcompApiTShirt>;

export type SemcompApiEvent = {
  id: string,
  name: string;
  speaker: string;
  description: string;
  maxOfSubscriptions: number;
  startDate: number;
  endDate: number;
  type: EventType;
  link: string;
  isInGroup: boolean;
  showOnSchedule: boolean;
  showStream: boolean;
  showOnSubscribables: boolean;
  needInfoOnSubscription: boolean;
  attendances: any[],
  subscribers: any[],
  createdAt: number,
  updatedAt: number,
};

export type SemcompApiGetEventsResponse = PaginationResponse<SemcompApiEvent>;

export type SemcompApiCreateEventRequest = {
  name: string;
  speaker: string;
  description: string;
  maxOfSubscriptions: number;
  startDate: number;
  endDate: number;
  type: EventType;
  link: string;
  isInGroup: boolean;
  showOnSchedule: boolean;
  showStream: boolean;
  showOnSubscribables: boolean;
  needInfoOnSubscription: boolean;
};

export type SemcompApiEditEventRequest = SemcompApiCreateEventRequest;

export type SemcompApiGameQuestion = {
  id: string;
  game: Game;
  index: number;
  title: string;
  question: string;
  imgUrl: string;
  clue: string;
  answer: string;
  isLegendary: boolean;
  createdAt: number;
  updatedAt: number;
};

export type SemcompApiGetGameQuestionsResponse = PaginationResponse<SemcompApiGameQuestion>;

export type SemcompApiCreateGameQuestionRequest = {
  game: Game;
  index: number;
  title: string;
  question: string;
  imgUrl: string;
  clue: string;
  answer: string;
  isLegendary: boolean;
};

export type SemcompApiEditGameQuestionRequest = SemcompApiCreateGameQuestionRequest;

export type SemcompApiGameGroup = {
  id: string;
  game: Game;
  name: string;
  availableClues: number;
  availableSkips: number;
  createdAt: number;
  updatedAt: number;
};

export type SemcompApiGetGameGroupsResponse = PaginationResponse<SemcompApiGameGroup>;
