import createError from "http-errors";

import authService from "../services/auth.service";
import userService from "../services/user.service";
import { handleValidationResult } from "../lib/handle-validation-result";
import { handleError } from "../lib/handle-error";
import User from "../models/user";
import House from "../models/house";

class AuthController {
  public async signup(req, res, next) {
    try {
      handleValidationResult(req);

      const createdUser = await authService.signup(req.body, req.body.disabilities);

      const token = await authService.createToken(createdUser);

      res.setHeader("Authorization", `Bearer ${token}`);

      const userHouse = await userService.getUserHouse(createdUser.id);

      return res.status(200).json(AuthController.mapUserResponse(createdUser, userHouse));
    } catch (error) {
      return handleError(error, next);
    }
  }

  public async signupUspSecondStep(req, res, next) {
    try {
      handleValidationResult(req);

      const user = req.user;
      const { course, discord, telegram, permission, disabilities } =
        req.body;

      await authService.signupUspSecondStep(
        user,
        course,
        discord,
        telegram,
        permission,
        disabilities
      );

      const token = await authService.createToken(user);

      res.setHeader("Authorization", `Bearer ${token}`);

      const userHouse = await userService.getUserHouse(user.id);

      return res.status(200).json(AuthController.mapUserResponse(user, userHouse));
    } catch (error) {
      return handleError(error, next);
    }
  }

  public async login(req, res, next) {
    try {
      handleValidationResult(req);

      const { email, password } = req.body;

      const foundUser = await authService.login(email, password);

      const token = await authService.createToken(foundUser);

      res.setHeader("Authorization", `Bearer ${token}`);

      const userHouse = await userService.getUserHouse(foundUser.id);

      return res.status(200).json(AuthController.mapUserResponse(foundUser, userHouse));
    } catch (error) {
      return handleError(error, next);
    }
  }

  public async forgotPassword(req, res, next) {
    try {
      handleValidationResult(req);

      const { email } = req.body;

      await authService.forgotPassword(email);

      return res.status(200).json();
    } catch (error) {
      return handleError(error, next);
    }
  }

  public async resetPassword(req, res, next) {
    try {
      handleValidationResult(req);

      const { email, code, password } = req.body;

      const foundUser = await authService.resetPassword(email, code, password);

      const token = await authService.createToken(foundUser);

      res.setHeader("Authorization", `Bearer ${token}`);

      const userHouse = await userService.getUserHouse(foundUser.id);

      return res.status(200).json(AuthController.mapUserResponse(foundUser, userHouse));
    } catch (error) {
      return handleError(error, next);
    }
  }

  public async getLoggedUser(req, res, next) {
    try {
      const userHouse = await userService.getUserHouse(req.user.id);

      return res.status(200).json(AuthController.mapUserResponse(req.user, userHouse));
    } catch (error) {
      return handleError(error, next);
    }
  }

  public async authenticateUser(data, cb) {
    const user = JSON.parse(data);

    const currentUser = await authService.authenticateUser(
      user.loginUsuario,
      user.emailUspUsuario,
      user.nomeUsuario
    );

    return cb(null, currentUser);
  }

  public async authenticationSuccess(req, res, next) {
    try {
      if (!req.user) {
        throw new createError.Forbidden("Usuário não encontrado.");
      }

      const token = await authService.createToken(req.user);

      res.setHeader("Authorization", `Bearer ${token}`);

      const userHouse = await userService.getUserHouse(req.user.id);

      if (req.user && req.user.nusp) {
        return res.status(200).json({
          success: true,
          isSignup: false,
          ...AuthController.mapUserResponse(req.user, userHouse),
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
  }

  public async authenticationFailure(req, res, next) {
    return next(
      new createError.Forbidden({
        success: false,
        message: "Falha ao autenticar usuário.",
      }.toString())
    );
  }

  public async logout(req, res) {
    req.logout();
    res.redirect(process.env.FRONTEND_URL);
  }

  public static mapUserResponse(user: User, house: House) {
    return {
      email: user.email,
      nusp: user.nusp,
      name: user.name,
      id: user.id,
      course: user.course,
      paid: user.paid,
      permission: user.permission,
      discord: user.discord,
      telegram: user.telegram,
      house: {
        name: house.name,
        description: house.description,
        telegramLink: house.telegramLink,
      },
    };
  }
}

export default new AuthController();
