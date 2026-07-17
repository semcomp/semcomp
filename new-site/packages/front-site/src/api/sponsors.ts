import client from "./client";
import { BASEURL } from "@/constants/ApiURL";

export interface Sponsor {
  ID: number;
  name: string;
  logo: string;
}

export function getSponsorImageUrl(imagePath: string): string {
  if (!imagePath) return "";
  // URLs absolutas (http/https) ou relativas ao origin (Vite assets) → retorna direto
  if (imagePath.startsWith("http") || imagePath.startsWith("/")) return imagePath;
  const cleanPath = imagePath.startsWith("./") ? imagePath.slice(2) : imagePath;
  return `${BASEURL}/${cleanPath}`;
}

export const sponsorsAPI = {
  getAll: async (): Promise<Sponsor[]> => {
    const response = await client.get<Sponsor[]>("/sponsors");
    return response.data;
  },
};
