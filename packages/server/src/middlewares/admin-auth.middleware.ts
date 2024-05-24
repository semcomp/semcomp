import createError from "http-errors";

import { handleError } from "../lib/handle-error";
import adminAuthService from "../services/admin-auth.service";

class AdminAuthMiddleware {
  public async authenticate(req, res, next) {
    try {
      let token = req.header("Authorization");

      req.adminUser = await adminAuthService.authenticate(token);

      next();
    } catch (error) {
      return handleError(error, next);
    }
  }

  public async isAuthenticated(req, res, next) {
    try {
      if (!req.adminUser) {
        return next(new createError.Unauthorized());
      }

      next();
    } catch (error) {
      return handleError(error, next);
    }
  }

  public async authToDelete(req, res, next) {
    try {
      if (!req.adminUser) {
        return next(new createError.Unauthorized());
      }
      req.adminUser = await adminAuthService.authToDelete(req.adminUser);
       
      next();
    } catch (error) {
      return handleError(error, next);
    }
  }

}

export default new AdminAuthMiddleware();
