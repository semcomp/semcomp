import createError from "http-errors";
import jwt from "jsonwebtoken";

import AdminUserModel from "../models/admin-user";

export const authenticate = async (req, res, next) => {
  try {
    let token = req.header("Authorization");
    if (token) {
      token = token.replace("Bearer ", "");
      const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY).data;

      const adminUser = await AdminUserModel.findById(
        decoded.id,
        "-password -createdAt -updatedAt -__v -resetPasswordCode"
      );

      req.adminUser = adminUser;
    }

    next();
  } catch (error) {
    console.log(error);
    return next(new createError.InternalServerError("Erro no servidor."));
  }
};

export const isAuthenticated = async (req, res, next) => {
  try {
    if (!req.adminUser) {
      return next(new createError.Unauthorized());
    }

    next();
  } catch (error) {
    console.log(error);
    return next(new createError.InternalServerError("Erro no servidor."));
  }
};
