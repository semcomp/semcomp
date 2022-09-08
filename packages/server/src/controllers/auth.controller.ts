import authService from "../services/auth.service";
import userService from "../services/user.service";
import PaymentService from "../services/payment.service";
import { handleValidationResult } from "../lib/handle-validation-result";
import { handleError } from "../lib/handle-error";
import User from "../models/user";
import House from "../models/house";
import Payment from "../models/payment";

class AuthController {
  private paymentService: PaymentService;

  constructor(paymentService: PaymentService) {
    this.paymentService = paymentService;
  }

  public async signup(req, res, next) {
    try {
      handleValidationResult(req);

      const createdUser = await authService.signup(req.body, req.body.disabilities);

      const token = await authService.createToken(createdUser);

      res.setHeader("Authorization", `Bearer ${token}`);

      const userHouse = await userService.getUserHouse(createdUser.id);

      return res.status(200).json(this.mapUserResponse(createdUser, userHouse));
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
      const userPayment = await this.paymentService.getUserPayment(foundUser.id);

      return res.status(200).json(this.mapUserResponse(foundUser, userHouse, userPayment));
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
      const userPayment = await this.paymentService.getUserPayment(foundUser.id);

      return res.status(200).json(this.mapUserResponse(foundUser, userHouse, userPayment));
    } catch (error) {
      return handleError(error, next);
    }
  }

  public async getLoggedUser(req, res, next) {
    try {
      const userHouse = await userService.getUserHouse(req.user.id);
      const userPayment = await this.paymentService.getUserPayment(req.user.id);

      return res.status(200).json(this.mapUserResponse(req.user, userHouse, userPayment));
    } catch (error) {
      return handleError(error, next);
    }
  }

  private mapUserResponse(user: User, house: House, payment?: Payment) {
    return {
      email: user.email,
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
      payment: {
        tShirtSize: payment?.tShirtSize || null,
      }
    };
  }
}

export default AuthController;
