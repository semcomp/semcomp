import createError from "http-errors";

import authService from "../services/auth.service";
import userService from "../services/user.service";
import { formatUser } from "../lib/format-user";
import { handleValidationResult } from "../lib/handle-validation-result";
import { handleError } from "../lib/handle-error";

/**
 * formatUserResponse
 *
 * @param {object} user
 * @param {object} house
 *
 * @return {object} Formated user
 */
function formatUserResponse(user, house) {
  return {
    email: user.email,
    nusp: user.nusp,
    name: user.name,
    id: user._id,
    course: user.course,
    permission: user.permission,
    userTelegram: user.userTelegram,
    house: {
      name: house && house.name,
      description: house && house.description,
      telegramLink: house && house.telegramLink,
    },
  };
}

const authController = {
  signup: async (req, res, next) => {
    try {
      handleValidationResult(req);

      const {
        email,
        name,
        password,
        course,
        discord,
        userTelegram,
        permission,
        disabilities,
      } = req.body;

      const createdUser = await authService.signup(
        email,
        name,
        password,
        course,
        discord,
        userTelegram,
        permission,
        disabilities
      );

      const token = authService.createToken(createdUser);

      res.setHeader("Authorization", `Bearer ${token}`);

      const userHouse = await userService.getUserHouse(createdUser.id);

      return res.status(200).json(formatUserResponse(createdUser, userHouse));
    } catch (error) {
      return handleError(error, next);
    }
  },
  signupUspSecondStep: async (req, res, next) => {
    try {
      handleValidationResult(req);

      const user = req.user;
      const { course, discord, userTelegram, permission, disabilities } =
        req.body;

      authService.signupUspSecondStep(
        user,
        course,
        discord,
        userTelegram,
        permission,
        disabilities
      );

      const token = authService.createToken(user);

      res.setHeader("Authorization", `Bearer ${token}`);

      const userHouse = await userService.getUserHouse(user.id);

      return res.status(200).json(formatUserResponse(user, userHouse));
    } catch (error) {
      return handleError(error, next);
    }
  },
  login: async (req, res, next) => {
    try {
      handleValidationResult(req);

      const { email, password } = req.body;

      const foundUser = await authService.login(email, password);

      const token = authService.createToken(foundUser);

      res.setHeader("Authorization", `Bearer ${token}`);

      const userHouse = await userService.getUserHouse(foundUser.id);

      return res.status(200).json(formatUserResponse(foundUser, userHouse));
    } catch (error) {
      return handleError(error, next);
    }
  },
  forgotPassword: async (req, res, next) => {
    try {
      handleValidationResult(req);

      const { email } = req.body;

      authService.forgotPassword(email);

      return res.status(200).json();
    } catch (error) {
      return handleError(error, next);
    }
  },
  resetPassword: async (req, res, next) => {
    try {
      handleValidationResult(req);

      const { email, code, password } = req.body;

      const foundUser = await authService.resetPassword(email, code, password);

      const token = authService.createToken(foundUser);

      res.setHeader("Authorization", `Bearer ${token}`);

      const userHouse = await userService.getUserHouse(foundUser.id);

      return res.status(200).json(formatUserResponse(foundUser, userHouse));
    } catch (error) {
      return handleError(error, next);
    }
  },
  getLoggedUser: async (req, res, next) => {
    try {
      const userHouse = await userService.getUserHouse(req.user.id);

      return res.status(200).json(formatUserResponse(req.user, userHouse));
    } catch (error) {
      return handleError(error, next);
    }
  },
  authenticateUser: async (data, cb) => {
    const user = JSON.parse(data);

    const currentUser = await authService.authenticateUser(
      user.loginUsuario,
      user.emailUspUsuario,
      user.nomeUsuario
    );

    return cb(null, formatUser(currentUser, ["_id"]));
  },
  authenticationSuccess: async (req, res, next) => {
    try {
      if (!req.user) {
        throw new createError.Forbidden("Usuário não encontrado.");
      }

      const token = authService.createToken(req.user);

      res.setHeader("Authorization", `Bearer ${token}`);

      const userHouse = await userService.getUserHouse(req.user.id);

      if (req.user && req.user.nusp) {
        return res.status(200).json({
          success: true,
          isSignup: false,
          ...formatUserResponse(req.user, userHouse),
          token,
        });
      }
      return res.status(200).json({
        isSignup: true,
        success: true,
        token,
      });
    } catch (error) {
      return handleError(error, next);
    }
  },
  authenticationFailure: async (req, res, next) => {
    return next(
      new createError.Forbidden({
        success: false,
        message: "Falha ao autenticar usuário.",
      }.toString())
    );
  },
  logout: async (req, res) => {
    req.logout();
    res.redirect(process.env.FRONTEND_URL);
  },
};

export default authController;
