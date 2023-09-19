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
    getCurrent: withNoErrorMessage(() => API.get("/events/current")),
    markAttendance: withNoErrorMessage((eventId: string) => API.get(`/events/${eventId}`)),
    markAttendanceByQrCode: withNoErrorMessage((token: string) => API.post(`/events/mark-attendance`, { token })),
  },
  game: {
    createTeam: withCustomError((data) => API.post("/game/group", data), {
      400: "Este nome já existe!",
    }),
    joinTeam: withCustomError(
      (teamId) => API.put("/game/group/join?id=" + teamId),
      { 418: `O limite de jogadores já foi atingido` },
    ),
    leaveTeam: () => API.put("/game/group/leave"),
    useClue: () => API.post("/game/group/use-clue"),
    useSkip: () => API.post("/game/group/use-skip"),

    getQuestion: (questionIndex) => API.get("/game/question/" + questionIndex),
  },
  achievements: {
    getAchievements: withNoErrorMessage(() => API.get("/achievements")),
  },
  coffee: {
    createPayment: (
      withSocialBenefit: boolean,
      socialBenefitFileName: string,
      tShirtSize: string,
      foodOption: string,
      kitOption: string
    ) => API.post("/payments", {
      withSocialBenefit,
      socialBenefitFileName,
      tShirtSize,
      foodOption,
      kitOption
    })
  },
  upload: {
    single: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      return API.post("/upload/single", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    },
  },
};

export default Handlers;
