import client from "./client";

export function recordVisit(): void {
  client.post("/visit").catch(() => {});
}

export async function getVisitorCount(): Promise<number> {
  try {
    const res = await client.get<{ visitor_count: number }>("/stats");
    return res.data.visitor_count;
  } catch {
    return 0;
  }
}
