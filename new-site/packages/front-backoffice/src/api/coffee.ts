import client from "./client";
import type { CoffeeType } from "@/types/CoffeeType";

export interface CoffeeValidationResponse {
  hasCoffee: boolean;
  userNumber: string;
}

export interface CoffeeListResponse {
  coffees: CoffeeType[];
}

const formatDateTime = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
      })
    : "";

/** Converte um Product (type=COFFEE) do backend para o formato do front. */
const mapBackendCoffee = (product: any): CoffeeType => {
  const dateTime: string | undefined = product.coffee?.date_time;
  return {
    id: String(product.id),
    name: product.name,
    description: product.description,
    price: product.price,
    date: dateTime, // ISO original: é o valor enviado na verificação
    dateLabel: formatDateTime(dateTime), // texto para exibir na tabela
  };
};

export const coffeeAPI = {
  /**
   * Verifica se o usuário tem compra PAGA para o coffee do horário informado.
   * GET /admin/coffees/verify/:userNumber/:dateTime
   */
  validateCoffee: async (
    userNumber: string,
    dateTime: string
  ): Promise<CoffeeValidationResponse> => {
    const response = await client.get<any>(
      `/admin/coffees/verify/${encodeURIComponent(userNumber)}/${encodeURIComponent(dateTime)}`
    );
    return {
      hasCoffee: Boolean(response.data.has_access),
      userNumber,
    };
  },

  /** Lista os coffees à venda (o backend devolve todos, sem paginação). */
  getAll: async (): Promise<CoffeeListResponse> => {
    const response = await client.get<any>("/admin/coffees");
    return {
      coffees: (response.data.coffees ?? []).map(mapBackendCoffee),
    };
  },
};