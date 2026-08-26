import client from "./client";

// --- Tipos públicos (sem answer) ---------

export interface PublicRiddle {
  id: number;
  hint_1: string;
  hint_2: string;
  image_url?: string;
}

export interface TeamMember {
  user_number: number;
  name: string;
}

export interface Team {
  id: number;
  name: string;
  code: string;
  current_riddle_index: number;
  finished_at?: string | null;
  members?: TeamMember[];
}

export interface MyGame {
  team: Team | null;
  riddles_total: number;
  current_riddle: PublicRiddle | null;
}

export interface SolveResult {
  correct: boolean;
  message: string;
  current_riddle: PublicRiddle | null;
  finished: boolean;
}

// --- Tipos das respostas da API (snake_case natural) ---------

interface CreateTeamApiResponse {
  message: string;
  team: Team;
}

interface JoinTeamApiResponse {
  message: string;
  team: Team;
}

interface MyGameApiResponse {
  message: string;
  team: Team | null;
  riddles_total: number;
  current_riddle: PublicRiddle | null;
}

// --- Objeto API ---------

export const riddleAPI = {
  // POST /api/riddles/create-team — cria equipe com o usuário autenticado como fundador
  createTeam: async (name: string): Promise<Team> => {
    const response = await client.post<CreateTeamApiResponse>("/api/riddles/create-team", { name });
    return response.data.team;
  },

  // POST /api/riddles/join-team — entra em uma equipe pelo código de convite
  joinTeam: async (code: string): Promise<Team> => {
    const response = await client.post<JoinTeamApiResponse>("/api/riddles/join-team", { code });
    return response.data.team;
  },

  // GET /api/riddles/my-game — estado do jogo do participante autenticado
  getMyGame: async (): Promise<MyGame> => {
    const response = await client.get<MyGameApiResponse>("/api/riddles/my-game");
    return {
      team: response.data.team,
      riddles_total: response.data.riddles_total,
      current_riddle: response.data.current_riddle,
    };
  },

  // POST /api/riddles/solve — tenta responder ao enigma atual
  solve: async (riddleId: number, answer: string): Promise<SolveResult> => {
    const response = await client.post<SolveResult>("/api/riddles/solve", {
      riddle_id: riddleId,
      answer,
    });
    return response.data;
  },
};