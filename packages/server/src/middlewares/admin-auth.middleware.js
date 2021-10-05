const createError = require("http-errors");
const jwt = require("jsonwebtoken");

const AdminUserModel = require("../models/admin-user");

module.exports.authenticate = async (req, res, next) => {
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
    return next(createError.InternalServerError("Erro no servidor."));
  }
};

module.exports.isAuthenticated = async (req, res, next) => {
  try {
    if (!req.adminUser) {
      return next(createError.Unauthorized());
    }

    next();
  } catch (error) {
    console.log(error);
    return next(createError.InternalServerError("Erro no servidor."));
  }
};
