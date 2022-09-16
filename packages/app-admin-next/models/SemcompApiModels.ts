import { TShirtSize } from "../components/t-shirt/TShirtForm";

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

export type SemcompApiGetUsersResponse = {
  users: SemcompApiUser[]
};

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

export type SemcompApiGetHousesResponse = SemcompApiHouse[];

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

export type SemcompApiGetTShirtsResponse = SemcompApiTShirt[];
