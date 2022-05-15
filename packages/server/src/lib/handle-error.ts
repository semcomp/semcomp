import createError from "http-errors";

/**
 * handleValidationResult
 *
 * @param {object} error
 * @param {object} next Express next object
 *
 * @return {object}
 */
export function handleError(error, next) {
  console.log(error);

  if (!(error instanceof createError.HttpError)) {
    error = new createError.InternalServerError("Erro no servidor.");
  }

  return next(error);
}
