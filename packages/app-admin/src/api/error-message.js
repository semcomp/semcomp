/** Constant that contains the default messages for each status code. */
const defaultMessages = {
  // default
  default: 'Ocorreu um erro desconhecido.',

  // network error
  undefined: 'Erro de conexão! Verifique a sua internet.',

  // 400
  400: 'Parece que algo que você me enviou está incorreto! Por favor, tente novamente.',
  401: 'Vish! Sua sessâo expirou! Por favor, faça login novamente.',
  403: 'Você não tem acesso a esse recurso! O que você está tentando fazer?',
  404: 'Opa! esse recurso não existe! Parece que seu link está quebrado.',

  // 500
  500: 'Nosso servidor quebrou! Nos perdoe! D:',
  503: 'Parece que nosso servidor não está diposnível. Por favor, tente novamente mais tarde.',
};

defaultMessages.NETWORK_ERROR = defaultMessages[undefined];

defaultMessages.BAD_REQUEST = defaultMessages[400];
defaultMessages.UNAUTHORIZED = defaultMessages[401];
defaultMessages.FORBIDDEN = defaultMessages[403];
defaultMessages.NOT_FOUND = defaultMessages[404];

defaultMessages.INTERNAL_SERVER_ERROR = defaultMessages[500];
defaultMessages.SERVICE_UNAVAILABLE = defaultMessages[503];

/**
 * @param {object} response
 *
 * @return {object}
 */
export function getDefaultMessage(response) {
  if (response && response.data && response.data.message) {
    return response.data.message;
  } else if (response) {
    return defaultMessages[response.status] || defaultMessages.default;
  } else {
    return defaultMessages.undefined;
  }
}

/**
 * @param {object} response
 * @param {object} customError
 *
 * @return {object}
 */
function customErrorHandler(response, customError) {
  if (!customError) {
    throw new Error('Custom error must be provided!');
  } else if (customError instanceof Function) {
    return customError(response);
  } else if (!response) {
    return null;
  } else if (typeof customError === 'string') {
    return customError;
  } else if (typeof customError[response.status] === 'string') {
    return customError[response.status];
  } else if (customError[response.status] instanceof Function) {
    return customError[response.status](response);
  } else {
    console.error(`CustomError ${customError} was not recognized`);
  }
}

/** This is a `Higher Order Function` that allows for custom errors on an API
handler. If there is any kind of error, this function will use the `customError`
to try to replace the default error.
@template T
@argument { T } handler
@argument { CustomError } customError used to replace the default error.
- if `customError` is a string, it will replace the default error with that string.
Will not replace the error if it was a `network error`
- if `customError` is a function, it will be called when an error occurs with the
response as its only argument. Will be called even on a `network error`.
- if `customError` is an object, it's keys should be the status code numbers whose
default error messages should be replaced. If it's values are strings, they will
replace the default error message. If they are functions, they will be called
with the `response` as it's only argument. Will not be called on a `network error`
@return { T }
*/
export function withCustomError(handler, customError) {
  return async function(...handlerArgs) {
    try {
      const response = await handler(...handlerArgs);
      return response;
    } catch (response) {
      const errorMessage = customErrorHandler(response, customError);
      if (errorMessage && response) response.errorMessage = errorMessage;
      throw response;
    }
  };
}

/**
 * @param {object} handler
 *
 * @return {object}
 */
export function withNoErrorMessage(handler) {
  return async function(...handlerArgs) {
    try {
      const response = await handler(...handlerArgs);
      return response;
    } catch (response) {
      response.shouldOmitError = true;
      throw response;
    }
  };
}
