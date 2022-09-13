import { TShirtSize } from "../components/t-shirt/TShirtForm";

export type SemcompApiUser = {
  id: string,
  email: string,
  name: string,
  course: string,
  discord: string,
  house: {
    name: string,
  },
  telegram: string,
  disabilities: string[],
  paid: boolean,
  tShirtSize: TShirtSize,
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
