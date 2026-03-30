import API from '../../api';


/**
 * Makes a request for the backend to log the user in.
 *
 * @param {string} email The user's email
 * @param {string} password The user's password
 *
 * @return {object}
 */
export async function login(email, password) {
  const response = await API.login(email, password);
  return {type: 'AUTH_SET_USER', user: response.data};
}

/**
 * This is mainly used by the API whenever it receives a new authentication token
 * from the backend
 *
 * @param {string} token
 *
 * @return {object}
 */
export function setToken(token) {
  return {type: 'AUTH_SET_TOKEN', token};
}

/**
 * Logs the user out. Should delete all user `auth` information, including JWT tokens.
 *
 * @return {object}
 */
export function logout() {
  return {type: 'AUTH_LOGOUT'};
}
