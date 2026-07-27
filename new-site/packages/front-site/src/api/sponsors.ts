import client from "./client";

export interface Sponsor {
  cnpj: string;
  name: string;
  logo: string;
  website: string;
}

export function getSponsorImageUrl(imagePath: string): string {
  if (!imagePath) return "";
  if (imagePath.startsWith("http") || imagePath.startsWith("/")) return imagePath;
  const cleanPath = imagePath.startsWith("./") ? imagePath.slice(2) : imagePath;
  // Paths de upload (ex: "uploads/sponsors/cnpj.png") → sempre via /api/ relativo ao origin,
  // assim funciona tanto no Docker local quanto em produção sem depender do BASEURL.
  if (cleanPath.startsWith("uploads/")) return `/api/${cleanPath}`;
  // URLs externas sem protocolo (ex: "empresa.com/logo.png") → adiciona https://
  return `https://${cleanPath}`;
}

export const sponsorsAPI = {
  getAll: async (): Promise<Sponsor[]> => {
    const response = await client.get<Sponsor[]>("/sponsors");
    return response.data;
  },
};

export function recordSponsorClick(cnpj: string): void {
  client.post(`/sponsors/${cnpj}/click`).catch(() => {});
}
