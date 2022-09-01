import axios from "axios";

import { getDefaultMessage } from "./error-message";

let globalAPI;

function initializeAPI(config) {
  const {
    baseURL,
    onError = () => { },
    timeout,
    token,
    setToken,
    onBadToken,
  } = config;

  const api = axios.create({
    timeout,
    baseURL,
  });

  // Sends a token if there's one in redux
  api.interceptors.request.use((request) => {
    // If a token is already set, don't override it.
    if (request.headers.authorization) return request;

    if (token) request.headers.authorization = token;
    return request;
  });

  // Updates token if 'Authorization' header is filled
  api.interceptors.response.use((response) => {
    const newToken = response.headers.authorization;
    if (newToken) {
      setToken(newToken);
      localStorage.setItem("token", newToken);
    }
    return response;
  });

  // Handle errors
  api.interceptors.response.use(
    (r) => r,
    (error) => {
      const response = error.response;
      if (response && response.status === 401) onBadToken();

      setTimeout(() => {
        if (!response) {
          onError(getDefaultMessage());
        } else {
          const message = response.errorMessage || getDefaultMessage(response);
          if (message !== "_NO_ERROR_MESSAGE") onError(message);
        }
      });

      throw response;
    }
  );

  globalAPI = api;
  return api;
}

/** This proxy is to make sure the API has been initialized before being accessed
@type { import('axios').AxiosInstance } */
const APIProtectorProxy: any = new Proxy(
  {},
  {
    get(target, prop) {
      if (!globalAPI)
        throw new Error("Cannot access API before it's initialization");
      else return globalAPI[prop];
    },
  }
);

export default APIProtectorProxy;
export { initializeAPI };
