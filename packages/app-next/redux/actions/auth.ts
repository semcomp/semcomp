import API from "../../api";

export async function login(email, password) {
  const { data } = await API.login(email, password);
  return { type: "AUTH_SET_USER", user: data };
}

/**
 */
export async function signup(userInfo) {
  let response = await API.signup(userInfo);
  const { data } = response;
  return { type: "AUTH_SET_USER", user: data };
}

export async function resetPassword(email, code, newPassword) {
  const response = await API.resetPassword(email, code, newPassword);
  return { type: "AUTH_SET_USER", user: response.data };
}

export function setUser(user) {
  return { type: "AUTH_SET_USER", user };
}

export function setToken(token) {
  return { type: "AUTH_SET_TOKEN", token };
}

export function logout() {
  return { type: "AUTH_LOGOUT" };
}
