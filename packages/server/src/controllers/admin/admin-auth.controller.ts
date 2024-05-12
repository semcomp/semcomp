import createError from "http-errors";

import {
  handleValidationResult,
} from "../../lib/handle-validation-result";
import AdminUser from "../../models/admin-user";
import adminAuthService from "../../services/admin-auth.service";
import { handleError } from "../../lib/handle-error";

class AdminAuthController {
  public async signup(req, res, next) {
    try {
      handleValidationResult(req);

      // const { key } = req.body;

      // if (key !== process.env.ADMIN_KEY) {
      //   throw new createError.Forbidden("Palavra chave incorreta.");
      // }

      const createdUser = await adminAuthService.signup(req.body);

      const token = await adminAuthService.createToken(createdUser);

      res.setHeader("Authorization", `Bearer ${token}`);


      return res.status(200).json(AdminAuthController.mapUserResponse(createdUser));
    } catch (error) {
      return handleError(error, next);
    }
  }

  public async login(req, res, next) {
    try {
      handleValidationResult(req);

      const { email, password } = req.body;

      const foundUser = await adminAuthService.login(email, password);

      const token = await adminAuthService.createToken(foundUser);

      res.setHeader("Authorization", `Bearer ${token}`);

      return res.status(200).json(AdminAuthController.mapUserResponse(foundUser));
    } catch (error) {
      return handleError(error, next);
    }
  }

  public async forgotPassword(req, res, next) {
    try {
      handleValidationResult(req);

      const { email } = req.body;

      await adminAuthService.forgotPassword(email);

      return res.status(200).json();
    } catch (error) {
      return handleError(error, next);
    }
  }

  public async resetPassword(req, res, next) {
    try {
      handleValidationResult(req);

      const { email, code, password } = req.body;

      const foundUser = await adminAuthService.resetPassword(email, code, password);

      const token = await adminAuthService.createToken(foundUser);

      res.setHeader("Authorization", `Bearer ${token}`);

      return res.status(200).json(AdminAuthController.mapUserResponse(foundUser));
    } catch (error) {
      return handleError(error, next);
    }
  }

  public static mapUserResponse(adminUser: AdminUser) {
    return {
      email: adminUser.email,
      id: adminUser.id,
    };
  }
}

export default new AdminAuthController();

