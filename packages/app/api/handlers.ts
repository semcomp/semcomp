import { FoodOption, TShirtSize } from "../components/profile/coffeePayment/coffee-step-2";
import { withCustomError, withNoErrorMessage } from "./error-message";
import API from "./base-api";

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
  user: {
    getAllAtendancesByUser: withNoErrorMessage(() => API.get(`/users/get-attendance`)),
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
    getConfig: (game) => API.get(`/game/${game}/config`),
    getIsHappening: () => API.get(`/game/isHappening`),
    getNumberOfQuestions: (game) => API.get(`/game/${game}/numberOfQuestions`)
  },
  achievements: {
    getAchievements: withNoErrorMessage(() => API.get("/achievements")),
    readUserAchievementByQrCode: withNoErrorMessage((achievementId: string) => API.post(`/achievements/${achievementId}/qrcode`)),
  },
  config: {
    getConfig: withNoErrorMessage(() => API.get("/config")),
    checkCoffeeTotal: withNoErrorMessage(() => API.get("/config/coffee-total")),
    checkRemainingCoffee: withNoErrorMessage(() => API.get("/config/coffee-remaining")), },
  coffee: {
    createPayment: (
      withSocialBenefit: boolean,
      socialBenefitFileName: string,
      tShirtSize: TShirtSize,
      foodOption: FoodOption,
      saleOption: string[],
    ) => API.post("/payments", {
      withSocialBenefit,
      socialBenefitFileName,
      tShirtSize,
      foodOption,
      saleOption
    }),
    getPaymentInfo: withNoErrorMessage((id: string) => API.get(`payments/user-id/${id}`)),
    getPurchasedCoffees: withNoErrorMessage(() => API.get("payments/purchased-coffees")),
    getAvailableTShirts: withNoErrorMessage(() => API.get("payments/remaining-tshirts")),
  },
  sales: {
    getSales: withNoErrorMessage(() => API.get("/sales/get-sales")),
    getAvailableSales: withNoErrorMessage(() => API.get("/sales/get-availables")),
    getOneSale: withNoErrorMessage((id: string) => API.get(`/sales/${id}`)),
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
  treasureHunt : {
    getImage: withNoErrorMessage((imageId: string) => API.get(`/treasure-hunt-images/${imageId}`))
  }
};

export default Handlers;
