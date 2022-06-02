import API from "./base-api";
import { withCustomError, withNoErrorMessage } from "./error-message";

const Handlers = {
  loginUsp: withNoErrorMessage(() =>
    API.get("/auth/success", {
      withCredentials: true,
      headers: { "Access-Control-Allow-Credentials": true },
    })
  ),
  login: withCustomError(
    (email, password) => API.post(`/auth/login`, { email, password }),
    {
      401: "Usuário ou senha inválidos",
    }
  ),
  signup: withCustomError((userInfo) => API.post(`/auth/signup`, userInfo), {
    401: "Este e-mail já está cadastrado.",
  }),
  signupUSP: withCustomError(
    (userInfo, USPToken) =>
      API.post(`/auth/signup-usp-second-step`, userInfo, {
        headers: { authorization: USPToken },
      }),
    { 401: "Este e-mail já está cadastrado." }
  ),
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
      }
    ),
    joinTeam: (teamId) => API.put("/riddlethon/group/join?id=" + teamId),
    leaveTeam: () => API.put("/riddlethon/group/leave"),

    getQuestion: (questionIndex) =>
      API.get("riddlethon/question/" + questionIndex),
  },
  hardToClick: {
    createTeam: withCustomError(
      (teamName) => API.post("/hard-to-click/group", { name: teamName }),
      { 400: "Este nome já existe!" }
    ),
    joinTeam: (teamId) => API.put("/hard-to-click/group/join?id=" + teamId),
    leaveTeam: () => API.put("/hard-to-click/group/leave"),

    getQuestion: (questionIndex) =>
      API.get("hard-to-click/question/" + questionIndex),
  },
  achievements: {
    getAchievements: withNoErrorMessage(() => API.get("/achievements")),
  },
};

export default Handlers;
