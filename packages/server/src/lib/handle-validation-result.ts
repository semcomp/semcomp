import { validationResult } from "express-validator";

import HttpError from "./http-error";

export function handleValidationResult(req): void {
  const validationErrors = validationResult(req);

  if (!validationErrors.isEmpty()) {
    throw new HttpError(
      400,
      validationErrors.array().map(item => item.msg)
    );
  }
}
