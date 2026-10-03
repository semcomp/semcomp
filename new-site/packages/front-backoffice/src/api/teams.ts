import client from "./client";
import type { TeamRankingEntry, TeamRankingResponse } from "@/types/TeamRankingType";

interface BackendRankingEntry {
  position: number;
  team_id: number;
  name: string;
  solved_count: number;
  riddles_total: number;
  finished: boolean;
  finished_at?: string | null;
  members_count: number;
}

interface BackendRankingResponse {
  teams: BackendRankingEntry[] | null;
  riddles_total: number;
}

const mapBackendRankingEntry = (entry: BackendRankingEntry): TeamRankingEntry => ({
  position: entry.position,
  teamId: entry.team_id,
  name: entry.name,
  solvedCount: entry.solved_count,
  riddlesTotal: entry.riddles_total,
  finished: Boolean(entry.finished),
  // finished_at é omitido pelo backend quando a equipe não terminou.
  finishedAt: entry.finished_at ?? null,
  membersCount: entry.members_count,
});

export const teamsAPI = {
  /** Ranking das equipes do jogo de enigmas (somente leitura). A ordem e a
   *  posição vêm prontas do backend — renderize na ordem recebida. */
  getRanking: async (): Promise<TeamRankingResponse> => {
    const response = await client.get<BackendRankingResponse>("/admin/teams/ranking");
    return {
      teams: (response.data.teams ?? []).map(mapBackendRankingEntry),
      riddlesTotal: response.data.riddles_total ?? 0,
    };
  },
};
