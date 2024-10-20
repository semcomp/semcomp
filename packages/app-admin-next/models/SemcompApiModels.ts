import { TShirtSize } from "../components/t-shirt/TShirtForm";
import AchievementCategories from "../libs/constants/achievement-categories-enum";
import AchievementTypes from "../libs/constants/achievement-types-enum";
import EventType from "../libs/constants/event-types-enum";
import Game from "../libs/constants/game-enum";
import Status from "../libs/constants/status-treasure-hunt-enum";
import { PaginationResponse } from "./Pagination";

export class SemcompApiPaginationRequest {
  private page: number;
  private items: number;

  constructor(page?: number, items?: number) {
    this.page = 1;
    if (page) {
      this.page = page;
    }

    this.items = 25;
    if (items) {
      this.items = items;
    }
  }

  public getPage(): number {
    return this.page;
  }

  public getItems(): number {
    return this.items;
  }
}

export enum PaymentStatus {
  PENDING = "pending",
  APPROVED = "approved",
}

export type SemcompApiLocalStorageUser = {
  id: string;
  email: string;
};

export type SemcompApiUser = {
  id: string;
  email: string;
  name: string;
  course: string;
  discord: string;
  house: {
    name: string;
  };
  payment: {
    status: PaymentStatus[];
    tShirtSize: TShirtSize;
    saleOption: string[][];
  };
  gotKit: boolean;
  telegram: string;
  disabilities: string[];
  permission: boolean;
  wantNameTag: boolean;
  createdAt: number;
  updatedAt: number;
};

export type UserData = {
  "ID": string,
  "E-mail": string,
  "Nome": string,
  "Curso": string,
  "Telegram": string,
  "Casa": string,
  "Status do pagamento": string,
  "Retirou Kit": boolean,
  "Tamanho da camiseta": TShirtSize,
  "Permite divulgação?": string,
  "Criado em": string,
}

export type SemcompApiAdminUser = {
  id: string;
  email: string;
  adminRole: string[];
  createdAt: number;
  updatedAt: number;
};

export type SemcompApiGetUsersResponse = PaginationResponse<SemcompApiUser>;

export type SemcompApiGetAdminUserResponse =
  PaginationResponse<SemcompApiAdminUser>;

export type SemcompApiLoginResponse = {
  email: string;
  id: string;
};

export type SemcompApiHouse = {
  id: string;
  name: string;
  description: string;
  telegramLink: string;
  score: number;
  createdAt: number;
  updatedAt: number;
};

export type SemcompApiGetHousesResponse = PaginationResponse<SemcompApiHouse>;

export type SemcompApiCreateHouseRequest = {
  name: string;
  description: string;
  telegramLink: string;
  imageBase64: string;
};

export type SemcompApiTShirt = {
  id: string;
  size: string;
  quantity: number;
  usedQuantity: number;
  createdAt: number;
  updatedAt: number;
};

export type SemcompApiGetTShirtsResponse = PaginationResponse<SemcompApiTShirt>;

export enum SaleType {
  ITEM = "Item",
  SALE = "Venda",
};

export type SemcompApiSale = {
  id: string;
  name: string;
  type: SaleType;
  quantity: number;
  usedQuantity: number;
  price: number;
  hasTShirt: boolean;
  hasKit: boolean;
  hasCoffee: boolean;
  items: string[];
  allowHalfPayment: boolean;
  createdAt: number;
  updatedAt: number;
}

export type SemcompApiGetSalesResponse = PaginationResponse<SemcompApiSale>;


export type SemcompApiGameConfig = {
  id: string;
  game: Game;
  title: string;
  description: string;
  rules: string;
  eventPrefix: string;
  startDate: number;
  endDate: number;
  hasGroups: boolean;
  maximumNumberOfMembersInGroup: number;
  createdAt: number;
  updatedAt: number;
};

export type SemcompApiGetGameConfigResponse = PaginationResponse<SemcompApiGameConfig>;

export type SemcompApiEvent = {
  id: string;
  name: string;
  speaker: string;
  description: string;
  maxOfSubscriptions: number;
  startDate: number;
  endDate: number;
  type: EventType;
  location: string;
  link: string;
  isInGroup: boolean;
  showOnSchedule: boolean;
  showStream: boolean;
  showOnSubscribables: boolean;
  needInfoOnSubscription: boolean;
  attendances: any[];
  subscribers: any[];
  numOfSubscriptions: number;
  createdAt: number;
  updatedAt: number;
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
  location: string;
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

export type SemcompApiGetGameQuestionsResponse =
  PaginationResponse<SemcompApiGameQuestion>;

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

export type SemcompApiEditGameQuestionRequest =
  SemcompApiCreateGameQuestionRequest;

export type SemcompApiGameGroup = {
  id: string;
  game: Game;
  name: string;
  completedQuestions: any[];
  availableClues: number;
  availableSkips: number;
  createdAt: number;
  updatedAt: number;
};

export type SemcompApiGetGameGroupsResponse =
  PaginationResponse<SemcompApiGameGroup>;
export type SemcompApiGetGameWinnersResponse = Record<string, SemcompApiGameGroup>

export type SemcompApiTreasureHuntImage = {
  id: string;
  place: string;
  status: Status;
  imgUrl: string;
  createdAt: number;
  updatedAt: number;
};

export type SemcompApiGetTreasureHuntImageResponse =
  PaginationResponse<SemcompApiTreasureHuntImage>;

export type SemcompApiCreateTreasureHuntImageRequest = {
  place: string;
  status: Status;
  imgUrl: string;
};

export type SemcompApiEditTreasureHuntImageRequest = SemcompApiCreateTreasureHuntImageRequest;

export type SemcompApiAchievement = {
  id: string;
  title: string;
  description: string;
  startDate: number;
  endDate: number;
  type: AchievementTypes;
  minPercentage: number;
  category: AchievementCategories;
  eventId: string;
  eventType: EventType;
  numberOfPresences: number;
  numberOfAchievements: number;
  createdAt: number;
  updatedAt: number;
}; 

export type SemcompApiGetAchievementsResponse = PaginationResponse<SemcompApiAchievement>;

export type SemcompApiCreateAchievementRequest = {
  title: string;
  description: string;
  startDate: number;
  endDate: number;
  type: AchievementTypes;
  minPercentage: number;
  category: AchievementCategories;
  eventId: string;
  eventType: EventType;
  numberOfPresences: number;
  numberOfAchievements: number;
  imageBase64: string;
};

export type SemcompApiEditAchievementRequest = SemcompApiCreateAchievementRequest;

export type SemcompApiConfigs = {
  id?: string;
  coffeeTotal: number;
  switchBeta: boolean;
  openSignup: boolean;
  showLogin: boolean;
  openSales: boolean;
  createdAt?: number;
  updatedAt?: number;
};

export type SemcompApiPaymentUser = {
  userId: string;
  status: PaymentStatus;
  qrCode?: string;
  qrCodeBase64?: string;
  withSocialBenefit: boolean;
  socialBenefitFileName: string;
  tShirtSize: TShirtSize;
  userName: string,
  userEmail: string,
  salesOption: string[];
  price?: number;
  createdAt?: number;
  updatedAt?: number;
}

export type SemcompApiPayment = {
  userId: string;
  status: PaymentStatus;
  qrCode?: string;
  qrCodeBase64?: string;
  withSocialBenefit: boolean;
  socialBenefitFileName: string;
  tShirtSize: TShirtSize;
  salesOption: string[];
  price?: number;
  createdAt?: number;
  updatedAt?: number;
}

export type SemcompApiGetPaymentsResponse = PaginationResponse<SemcompApiPayment>;