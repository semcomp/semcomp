import type { MyGame, PublicRiddle, SolveResult, Team } from "./riddle";

// ────────────────────────────────────────────────────────────────
// Mock do jogo de enigmas (front-site).
//
// Ativado quando VITE_MOCK_RIDDLE=true no .env do front-site.
// Permite iterar sobre o visual de /riddle sem backend:
//
//   ?scenario=nostart   → "O jogo ainda não começou" (0 enigmas ativos)
//   ?scenario=noteam    → cards de criar/entrar em equipe
//   ?scenario=team      → equipe + enigma atual (default, sem param)
//   ?scenario=finished  → tela do trofeo
//
// Resposta correta do mock: "resposta" (case-insensitive). Qualquer
// outro texto simula uma resposta errada (banner de feedback).
// ────────────────────────────────────────────────────────────────

const DELAY_MS = 450;

interface MockRiddle {
  id: number;
  hint_1: string;
  hint_2: string;
  /** Só existe aqui para simular o solve — nunca chega ao cliente real. */
  answer: string;
  image_url?: string;
}

const FIXTURES: MockRiddle[] = [
  {
    id: 1,
    hint_1: "Como em todo bom jogo, a primeira dica é sempre a mais fácil.",
    hint_2: "Digite a palavra correta para resolver: 'resposta'.",
    answer: "resposta",
  },
  {
    id: 2,
    hint_1: "Sigo de perto o primeiro, mas não posso saltar seu lugar.",
    hint_2: "A resposta é a mesma de sempre: 'resposta'.",
    answer: "resposta",
  },
  {
    id: 3,
    hint_1: "O final se aproxima: uma equipe que chega aqui já é campeão.",
    hint_2: "Uma última vez, a chave é 'resposta'.",
    answer: "resposta",
    image_url: "https://picsum.photos/seed/semcomp-final/640/400",
  },
];

const MEMBERS = [
  { user_number: 1, name: "Artur" },
  { user_number: 2, name: "Maria" },
  { user_number: 3, name: "Lucas" },
];

const BASE_TEAM: Team = {
  id: 1,
  name: "Os Enigmeros",
  code: "ABC123XY",
  current_riddle_index: 1,
  members: MEMBERS,
};

interface MockState {
  scenario: string;
  team: Team | null;
  index: number;
}

let state: MockState | null = null;

function getState(): MockState {
  if (state) return state;

  const scenario =
    new URLSearchParams(window.location.search).get("scenario") ?? "team";

  switch (scenario) {
    case "nostart":
      state = { scenario, team: null, index: 0 };
      break;
    case "noteam":
      state = { scenario, team: null, index: 0 };
      break;
    case "finished":
      state = {
        scenario,
        team: { ...BASE_TEAM, current_riddle_index: FIXTURES.length, finished_at: new Date().toISOString() },
        index: FIXTURES.length,
      };
      break;
    case "team":
    default:
      state = { scenario, team: BASE_TEAM, index: 1 };
  }

  return state;
}

function toPublic(r: MockRiddle): PublicRiddle {
  return { id: r.id, hint_1: r.hint_1, hint_2: r.hint_2, image_url: r.image_url };
}

function delay(ms: number = DELAY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const mockRiddleAPI = {
  /** GET /api/riddles/my-game — estado do jogo (nunca incluye la respuesta). */
  getMyGame: async (): Promise<MyGame> => {
    await delay();
    const s = getState();
    const activeCount = s.scenario === "nostart" ? 0 : FIXTURES.length;
    const current = s.index < FIXTURES.length ? toPublic(FIXTURES[s.index]) : null;
    return { team: s.team, riddles_total: activeCount, current_riddle: current };
  },

  /** POST /api/riddles/create-team — cria equipe com o usuário como fundador. */
  createTeam: async (name: string): Promise<Team> => {
    await delay();
    const team: Team = {
      id: 2,
      name,
      code: "NEW7T5XK",
      current_riddle_index: 0,
      members: [{ user_number: 1, name: "Você" }],
    };
    state = { ...getState(), team, index: 0 };
    return team;
  },

  /** POST /api/riddles/join-team — entra em equipe pelo código. */
  joinTeam: async (code: string): Promise<Team> => {
    await delay();
    const team: Team = {
      id: 3,
      name: `Equipe ${code}`,
      code,
      current_riddle_index: 0,
      members: [
        { user_number: 1, name: "Você" },
        { user_number: 999, name: "Capitana" },
      ],
    };
    state = { ...getState(), team, index: 0 };
    return team;
  },

  /** POST /api/riddles/solve — "resposta" avanza; qualquer outra coisa falha. */
  solve: async (_riddleId: number, answer: string): Promise<SolveResult> => {
    await delay();
    const s = getState();

    if (answer.trim().toLowerCase() !== "resposta") {
      return {
        correct: false,
        message: "Resposta incorreta! Tente novamente.",
        current_riddle: s.index < FIXTURES.length ? toPublic(FIXTURES[s.index]) : null,
        finished: false,
      };
    }

    const nextIndex = s.index + 1;
    const finished = nextIndex >= FIXTURES.length;
    let team = s.team;
    if (team) {
      team = { ...team, current_riddle_index: nextIndex };
      if (finished) team = { ...team, finished_at: new Date().toISOString() };
    }
    state = { ...s, team, index: nextIndex };

    return {
      correct: true,
      message: "Resposta correta!",
      current_riddle: nextIndex < FIXTURES.length ? toPublic(FIXTURES[nextIndex]) : null,
      finished,
    };
  },
};