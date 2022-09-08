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
