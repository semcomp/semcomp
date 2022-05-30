import createError from "http-errors";

import { handleError } from "../lib/handle-error";
import AuthService from "../services/auth.service";
import houseMemberService from "../services/house-member.service";
import houseService from "../services/house.service";

class AuthMiddleware {
  public async authenticate(req, res, next) {
    try {
      let token = req.header("Authorization");

      req.user = await AuthService.authenticate(token);

      next();
    } catch (error) {
      return handleError(error, next);
    }
  }

  public async authenticateUserHouse(req, res, next) {
    try {
      const userHouseMember = (await houseMemberService.find({ userId: req.user.id }))[0];
      const userHouse = await houseService.findById(userHouseMember.houseId);

      req.userHouse = userHouse;

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

export default new AuthMiddleware();
