import type { EventType } from "@/types/EventType.ts"

export type EventsResponse = {
  page: number;
  limit: number;
  sort_by: string;
  sort_order: string;
  search_by: string;
  search_value: string;
  total_records: number;
  filtered_records: number;
  events: EventType[];
};
