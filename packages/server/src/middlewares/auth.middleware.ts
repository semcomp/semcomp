import createError from "http-errors";
import jwt from "jsonwebtoken";

import UserModel from "../models/user";
import HouseModel from "../models/house";

export const authenticate = async (req, res, next) => {
  try {
    let token = req.header("Authorization");
    if (token) {
      token = token.replace("Bearer ", "");
      const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY).data;

      const user = await UserModel.findById(decoded.id);

      req.user = user;
    }

    next();
  } catch (error) {
    console.log(error);
    return next(new createError.InternalServerError("Erro no servidor."));
  }
};

export const authenticateUserHouse = async (req, res, next) => {
  try {
    const userHouse = await HouseModel.findOne({ members: req.user.id });

    req.userHouse = userHouse;

    next();
  } catch (error) {
    console.log(error);
    return next(new createError.InternalServerError("Erro no servidor."));
  }
};

export const isAuthenticated = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(new createError.Unauthorized());
    }

    next();
  } catch (error) {
    console.log(error);
    return next(new createError.InternalServerError("Erro no servidor."));
  }
};
