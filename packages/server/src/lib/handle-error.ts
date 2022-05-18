import { NextFunction } from "express";

import HttpError from "./http-error";

export function handleError(error, next): NextFunction {
  console.log(error);

  if (!(error instanceof HttpError)) {
    error = new HttpError(500, ["Erro no servidor."]);
  }

  return next(error);
}
