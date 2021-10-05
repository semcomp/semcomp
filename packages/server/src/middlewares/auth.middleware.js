const createError = require("http-errors");
const jwt = require("jsonwebtoken");

const UserModel = require("../models/user");
const HouseModel = require("../models/house");

module.exports.authenticate = async (req, res, next) => {
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
    return next(createError.InternalServerError("Erro no servidor."));
  }
};

module.exports.authenticateUserHouse = async (req, res, next) => {
  try {
    const userHouse = await HouseModel.findOne({ members: req.user.id });

    req.userHouse = userHouse;

    next();
  } catch (error) {
    console.log(error);
    return next(createError.InternalServerError("Erro no servidor."));
  }
};

module.exports.isAuthenticated = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(createError.Unauthorized());
    }

    next();
  } catch (error) {
    console.log(error);
    return next(createError.InternalServerError("Erro no servidor."));
  }
};
