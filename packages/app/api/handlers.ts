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
    joinTeam: withCustomError(
      (game, teamId) => API.put(`/game/${game}/group/join?id=${teamId}`),
      { 418: `O limite de jogadores já foi atingido` },
    ),
    leaveTeam: (game) => API.put(`/game/${game}/group/leave`),
    useClue: (game) => API.post(`/game/${game}/group/use-clue`),
    useSkip: (game) => API.post(`/game/${game}/group/use-skip`),
    getQuestion: (game, questionIndex) => API.get(`/game/${game}/question/${questionIndex}`),
  },
  achievements: {
    getAchievements: withNoErrorMessage(() => API.get("/achievements")),
  },
  coffee: {
    createPayment: (
      withSocialBenefit: boolean,
      socialBenefitFileName: string,
      // tShirtSize: string,
      foodOption: string,
    ) => API.post("/payments", {
      withSocialBenefit,
      socialBenefitFileName,
      // tShirtSize,
      foodOption,
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
