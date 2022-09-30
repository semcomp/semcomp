import EventType from "../libs/constants/event-types-enum";
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

export type SemcompApiLoginResponse = {
  email: string,
  id: string,
};

export type SemcompApiEvent = {
  id: string,
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
  attendances: any[],
  subscribers: any[],
  createdAt: number,
  updatedAt: number,
};

export type SemcompApiGetEventsResponse = PaginationResponse<SemcompApiEvent>;
