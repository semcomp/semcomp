import client from "./client";
import type { RiddleType } from "@/types/RiddleType";

const CSV_COLUMNS = {
  index:    "Ordem (index)",
  title:    "Título",
  subtitle: "Subtítulo",
  image:    "Imagem",
  answer:   "Senha",
} as const;

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let i = 0;
  while (i < line.length) {
    if (line[i] === '"') {
      let value = "";
      i++;
      while (i < line.length) {
        if (line[i] === '"' && line[i + 1] === '"') {
          value += '"';
          i += 2;
        } else if (line[i] === '"') {
          i++;
          break;
        } else {
          value += line[i++];
        }
      }
      result.push(value);
      if (i < line.length && line[i] === ',') i++;
    } else {
      const end = line.indexOf(',', i);
      if (end === -1) {
        result.push(line.slice(i));
        break;
      }
      result.push(line.slice(i, end));
      i = end + 1;
    }
  }
  return result;
}

function csvQuote(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return '"' + value.replace(/"/g, '""') + '"';
  }
  return value;
}

async function transformCsvToBackendFormat(file: File): Promise<File> {
  const text = await file.text();
  const lines = text.replace(/^﻿/, '').split(/\r?\n/);

  if (lines.length === 0) throw new Error("CSV vazio");

  const header = parseCsvLine(lines[0]);

  const col = {
    index:    header.findIndex(h => h.trim() === CSV_COLUMNS.index),
    title:    header.findIndex(h => h.trim() === CSV_COLUMNS.title),
    subtitle: header.findIndex(h => h.trim() === CSV_COLUMNS.subtitle),
    image:    header.findIndex(h => h.trim() === CSV_COLUMNS.image),
    answer:   header.findIndex(h => h.trim() === CSV_COLUMNS.answer),
  };

  if (col.title === -1 || col.subtitle === -1 || col.answer === -1) {
    throw new Error(
      `CSV inválido: colunas obrigatórias não encontradas. Esperado: "${CSV_COLUMNS.title}", "${CSV_COLUMNS.subtitle}", "${CSV_COLUMNS.answer}"`
    );
  }

  const rows: { order: number; fields: string[] }[] = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const fields = parseCsvLine(lines[i]);
    const raw = col.index !== -1 ? fields[col.index] : "";
    const order = parseInt(raw ?? "", 10);
    rows.push({ order: isNaN(order) ? i - 1 : order, fields });
  }

  rows.sort((a, b) => a.order - b.order);

  const output = ["hint1,hint2,answer,image_url"];
  for (const { fields } of rows) {
    output.push([
      csvQuote(fields[col.title]?.trim()    ?? ""),
      csvQuote(fields[col.subtitle]?.trim() ?? ""),
      csvQuote(fields[col.answer]?.trim()   ?? ""),
      csvQuote(fields[col.image]?.trim()    ?? ""),
    ].join(","));
  }

  const blob = new Blob([output.join("\n")], { type: "text/csv" });
  return new File([blob], file.name, { type: "text/csv" });
}

export interface RiddlesListResponse {
  page: number;
  limit: number;
  sort_by: string;
  sort_order: string;
  search_by: string | null;
  search_value: string | null;
  total_records: number;
  filtered_records: number;
  riddles: RiddleType[];
}

const mapBackendRiddle = (riddle: any): RiddleType => {
  return {
    id: String(riddle.id),
    riddleId: riddle.id,
    hint1: riddle.hint_1,
    hint2: riddle.hint_2,
    answer: riddle.answer,
    imageUrl: riddle.image_url,
    isActive: Boolean(riddle.is_active),
    createdAt: riddle.created_at,
  };
};

const mapToBackendRiddle = (riddle: Partial<RiddleType>) => ({
  hint_1: riddle.hint1,
  hint_2: riddle.hint2,
  answer: riddle.answer,
  image_url: riddle.imageUrl,
  is_active: riddle.isActive,
});

// hint1/hint2 não precisam de mapeamento: o nome do campo já bate com a
// coluna real no banco (o GORM não insere "_" antes de dígito em "Hint1"/"Hint2").
const fieldMap: Record<string, string> = {
  isActive: "is_active",
};

export const riddlesAPI = {
  getAll: async (
    page = 1,
    limit = 10,
    sortBy = "id",
    sortOrder = "asc",
    searchBy?: string,
    searchValue?: string
  ): Promise<RiddlesListResponse> => {
    const backendSortBy = fieldMap[sortBy] ?? sortBy;
    const backendSearchBy = searchBy ? (fieldMap[searchBy] ?? searchBy) : undefined;

    let url = `/admin/riddles?page=${page}&limit=${limit}&sort_by=${backendSortBy}&sort_order=${sortOrder}`;
    if (backendSearchBy && searchValue) {
      url += `&search_by=${backendSearchBy}&search_value=${searchValue}`;
    }
    const response = await client.get<any>(url);
    return {
      ...response.data,
      riddles: response.data.riddles.map(mapBackendRiddle),
    };
  },

  getByID: async (id: number): Promise<RiddleType> => {
    const response = await client.get<any>(`/admin/riddles/${id}`);
    return mapBackendRiddle(response.data);
  },

  create: async (data: Omit<RiddleType, "id" | "riddleId" | "createdAt">): Promise<RiddleType> => {
    const payload = mapToBackendRiddle(data);
    const response = await client.post<any>("/admin/riddles", payload);
    return mapBackendRiddle(response.data.riddle);
  },

  update: async (id: number, data: Partial<RiddleType>): Promise<RiddleType> => {
    const payload = mapToBackendRiddle(data);
    const response = await client.put<any>(`/admin/riddles/${id}`, payload);
    return mapBackendRiddle(response.data.riddle);
  },

  delete: async (id: number): Promise<{ message: string }> => {
    const response = await client.delete<{ message: string }>(`/admin/riddles/${id}`);
    return response.data;
  },

  uploadCsv: async (file: File): Promise<RiddleType[]> => {
    const transformed = await transformCsvToBackendFormat(file);
    const formData = new FormData();
    formData.append("file", transformed);
    const response = await client.post<any>("/admin/riddles/upload-csv", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.riddles.map(mapBackendRiddle);
  },
};
