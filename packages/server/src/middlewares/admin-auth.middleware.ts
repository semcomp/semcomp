import createError from "http-errors";

import { handleError } from "../lib/handle-error";
import adminAuthService from "../services/admin-auth.service";

class AdminAuthMiddleware {
  public async authenticate(req, res, next) {
    try {
      let token = req.header("Authorization");

      req.user = await adminAuthService.authenticate(token);

      next();
    } catch (error) {
      return handleError(error, next);
    }
  }

  public async isAuthenticated(req, res, next) {
    try {
      if (!req.user) {
        return next(new createError.Unauthorized());
      }

      next();
    } catch (error) {
      return handleError(error, next);
    }
  }
}

export default new AdminAuthMiddleware();
