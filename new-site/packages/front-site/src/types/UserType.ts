export type UserType = {
  user_number: number;
  name: string;
  email: string;
  presence_rate?: number;
  // Novos atributos
  age?: number;
  gender?: string;
  city?: string;
  education?: string;
  hasPapfe?: boolean;
  disabilities?: string[];
  profession?: string;
  linkedin?: string;
  telegram?: string;
  quer_cracha?: boolean;
};
