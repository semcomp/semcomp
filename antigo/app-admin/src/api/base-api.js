import axios from 'axios';
import {getDefaultMessage} from './error-message';

let globalAPI;

/**
 * @param {object} config
 *
 * @return {object}
 */
function initializeAPI(config) {
  const {
    baseURL,
    onBadToken = () => {},
    onError = () => {},
    tokenDispatcher,
    tokenSelector,
    timeout,
  } = config;

  const api = axios.create({
    timeout,
    baseURL,
  });

  // Sends a token if there's one in redux
  api.interceptors.request.use((request) => {
    const token = tokenSelector();
    if (token) request.headers.authorization = token;
    return request;
  });

  // Updates token if 'Authorization' header is filled
  api.interceptors.response.use((response) => {
    const token = response.headers.authorization || (response.data && response.data.token);
    if (token) tokenDispatcher(token);
    return response;
  });

  // Handle errors
  api.interceptors.response.use((r) => r, (error) => {
    const response = error.response;
    if (response && response.status === 401) onBadToken();

    if (response) response.errorMessage = response.errorMessage || getDefaultMessage(response);

    setTimeout(() => {
      if (!response) {
        onError(getDefaultMessage());
      } else {
        console.log('debug', response);
        if (!response.shouldOmitError) onError(response.errorMessage);
      }
    });

    throw response;
  });

  globalAPI = api;
  return api;
}

/** This proxy is to make sure the API has been initialized before being accessed
@type { import('axios').AxiosInstance } */
const APIProtectorProxy = new Proxy({}, {
  get(target, prop) {
    // React will try to access this property to determine if this is a React component or not.
    // This is not a component, therefore, a null is returned
    if (prop === '$$typeof') return null;
    if (!globalAPI) throw new Error('Cannot access API before it\'s initialization. Please call `initializeAPI()` before using this import.');
    else return globalAPI[prop];
  },
});

export default APIProtectorProxy;
export {initializeAPI};
