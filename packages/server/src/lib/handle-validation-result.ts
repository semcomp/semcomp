import { validationResult } from "express-validator";
import createError from "http-errors";

/**
 * handleValidationResult
 *
 * @param {object} req Express request object
 */
export function handleValidationResult(req) {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    throw new createError.BadRequest({ errors: validationErrors.array() }.toString());
  }
}
