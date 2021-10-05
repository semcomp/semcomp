const { validationResult } = require("express-validator");
const createError = require("http-errors");

/**
 * handleValidationResult
 *
 * @param {object} req Express request object
 */
function handleValidationResult(req) {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    throw new createError.BadRequest({ errors: validationErrors.array() });
  }
}

module.exports = {
  handleValidationResult,
};
