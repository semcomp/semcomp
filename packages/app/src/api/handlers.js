import API from "./base-api";
import { withCustomError, withNoErrorMessage } from "./error-message";

const Handlers = {
  login: withCustomError(
    (email, password) => API.post(`/auth/login`, { email, password }),
    {
      401: "Usuário ou senha inválidos",
    }
  ),
  signup: withCustomError((userInfo) => API.post(`/auth/signup`, userInfo), {
    401: "Este e-mail já está cadastrado.",
  }),
  auth: {
    me: withNoErrorMessage(() => API.get("/auth/me")),
  },
  updateUserInfo: (user) => API.put("/users", user),
  forgotPassword: withCustomError(
    (email) => API.post("/auth/forgot-password", { email }),
    {
      401: "Este e-mail não está cadastrado.",
    }
  ),
  resetPassword: (email, code, password) =>
    API.post("/auth/reset-password", { email, code, password }),
  getHouseScores: () => API.get("/houses/scores"),
  events: {
    // Esse primeiro tá muito feio. Foi feito só para funcionar.
    getAll: withNoErrorMessage(() => API.get("/events?items=50&page=0")),
    getSubscribables: withNoErrorMessage(() =>
      API.get("/events/subscribables")
    ),
    subscribe: withNoErrorMessage((eventId, info) =>
      API.post(`/events/${eventId}/subscribe`, { info })
    ),
    unsubscribe: withNoErrorMessage((eventId) =>
      API.delete(`/events/${eventId}/subscribe`)
    ),
    markPresence: withCustomError(
      (eventId) => API.post(`/events/mark-presence/${eventId}`),
      (res) =>
        (res && res.data && res.data.message) ||
        "Houve um erro ao marcar sua presença"
    ),
    getCurrent: withNoErrorMessage(() => API.get("/events/current")),
  },
  riddle: {
    createTeam: withCustomError(() => API.post("/riddle/group"), {
      400: "Este nome já existe!",
    }),
    leaveTeam: () => API.put("/riddle/group/leave"),
    useClue: () => API.post("riddle/group/use-clue"),
    useSkip: () => API.post("riddle/group/use-skip"),

    getQuestion: (questionIndex) => API.get("riddle/question/" + questionIndex),
  },
  riddlethon: {
    createTeam: withCustomError(
      (teamName) => API.post("/riddlethon/group", { name: teamName }),
      {
        400: "Este nome já existe!",
        418: `O limite de jogadores já foi atingido`,
      }
    ),
    joinTeam: withCustomError(
      (teamId) => API.put("/riddlethon/group/join?id=" + teamId),
      {418: `O limite de jogadores já foi atingido`},
    ),
    leaveTeam: withCustomError(() => API.put("/riddlethon/group/leave"), ),

    getQuestion: (questionIndex) =>
      API.get("riddlethon/question/" + questionIndex),
  },
  hardToClick: {
    createTeam: withCustomError(
      (teamName) => API.post("/hard-to-click/group", { name: teamName }),
      {
        400: "Este nome já existe!",
        418: `O limite de jogadores já foi atingido`,
      }
    ),
    joinTeam: withCustomError(
      (teamId) => API.put("/hard-to-click/group/join?id=" + teamId),
      {418: `O limite de jogadores já foi atingido`},
    ),
    leaveTeam: () => API.put("/hard-to-click/group/leave"),

    getQuestion: (questionIndex) =>
      API.get("hard-to-click/question/" + questionIndex),
  },
  achievements: {
    getAchievements: withNoErrorMessage(() => API.get("/achievements")),
  },
  coffee: {
    createPayment: withNoErrorMessage(() => API.post("/payments")),
  },
};

export default Handlers;
