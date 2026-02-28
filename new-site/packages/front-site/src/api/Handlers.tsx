// import { withCustomError, withNoErrorMessage } from "./ErrorMessage";
// import API from "./BaseAPI";

// const Handlers = {
//   login: withCustomError(
//     (email, password) => API.post(`/auth/login`, { email, password }),
//     {
//       401: "Usuário ou senha inválidos",
//       403: "Usuário precisa confirmar email"
//     }
//   ),
//   signup: withCustomError((userInfo) => API.post(`/auth/signup`, userInfo), {
//     401: "Este e-mail já está cadastrado.",
//   }),
//   auth: {
//     me: withNoErrorMessage(() => API.get("/auth/me")),
//   },
//   updateUserInfo: (user) => API.put("/users", user),
//   forgotPassword: withCustomError(
//     (email) => API.post("/auth/forgot-password", { email }),
//     {
//       401: "Este e-mail não está cadastrado.",
//     }
//   ),
//   sendVerificationCode: withCustomError( // TODO: remover fluxo inutilizado (confirmar)
//     (email) => API.post("/auth/send-verification-code", { email }),
//     {
//       401: "Este e-mail não está cadastrado.",
//     }
//   ),
//   confirmVerificationCode: withCustomError((email: string, code: string) =>
//     API.post("/auth/confirm-verification-code", { email, code }), {
//       400: "Código/email inválido",
//       401: "Usuário não encontrado/inválido",
//     }),
//   resetPassword: (email, code, password) =>
//     API.post("/auth/reset-password", { email, code, password }),