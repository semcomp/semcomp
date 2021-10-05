const createError = require("http-errors");

/**
 * handleValidationResult
 *
 * @param {object} error
 * @param {object} next Express next object
 *
 * @return {object}
 */
function handleError(error, next) {
  console.log(error);

  if (!(error instanceof createError.HttpError)) {
    error = new createError.InternalServerError("Erro no servidor.");
  }

  return next(error);
}

module.exports = {
  handleError,
};
