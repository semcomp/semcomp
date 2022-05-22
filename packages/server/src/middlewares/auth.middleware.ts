import createError from "http-errors";

import { handleError } from "../lib/handle-error";
import HouseModel from "../models/house";
import AuthService from "../services/auth.service";

export default class AuthMiddleware {
  public async authenticate(req, res, next) {
    return authenticate(req, res, next);
  }

  public async authenticateUserHouse(req, res, next) {
    return authenticateUserHouse(req, res, next);
  }

  public async isAuthenticated(req, res, next) {
    return isAuthenticated(req, res, next);
  }
}

export const authenticate = async (req, res, next) => {
  try {
    let token = req.header("Authorization");

    req.user = await AuthService.authenticate(token);

    next();
  } catch (error) {
    return handleError(error, next);
  }
};

export const authenticateUserHouse = async (req, res, next) => {
  try {
    const userHouse = await HouseModel.findOne({ members: req.user.id });

    req.userHouse = userHouse;

    next();
  } catch (error) {
    return handleError(error, next);
  }
};

export const isAuthenticated = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(new createError.Unauthorized());
    }

    next();
  } catch (error) {
    return handleError(error, next);
  }
};
