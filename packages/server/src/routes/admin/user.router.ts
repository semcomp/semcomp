import { Router } from "express";

import adminAuthMiddleware from "../../middlewares/admin-auth.middleware";
import UserAdminController from "../../controllers/admin/user.controller";
import PaymentServiceImpl from "../../services/payment-impl.service";

export default class UserAdminRouter {
  private paymentService: PaymentServiceImpl;
  private userAdminController: UserAdminController;

  constructor(paymentService: PaymentServiceImpl) {
    this.paymentService = paymentService;
    this.userAdminController = new UserAdminController(this.paymentService);
  }

  public create(): Router {
    const router = Router();

    router.get(
      "/",
      [adminAuthMiddleware.authenticate, adminAuthMiddleware.isAuthenticated],
      (req, res, next) => this.userAdminController.list(req, res, next),
    );

    router.get(
      "/for-enterprise",
      [adminAuthMiddleware.authenticate, adminAuthMiddleware.isAuthenticated],
      (req, res, next) => this.userAdminController.listForEnterprise(req, res, next),
    );

    router.get(
      "/attendance/:id",
      [adminAuthMiddleware.authenticate, adminAuthMiddleware.isAuthenticated],
      (req, res, next) => this.userAdminController.getAttendance(req, res, next),
    );

    router.post(
      "/generate-qr-codes",
      [adminAuthMiddleware.authenticate, adminAuthMiddleware.isAuthenticated],
      (req, res, next) => this.userAdminController.generateQrCodes(req, res, next),
    );

    router.post(
      "/:userId/achievements/:achievementId",
      [adminAuthMiddleware.authenticate, adminAuthMiddleware.isAuthenticated],
      (req, res, next) => this.userAdminController.addUserAchievement(req, res, next),
    );

    router.get(
      "/:id",
      [adminAuthMiddleware.authenticate, adminAuthMiddleware.isAuthenticated],
      (req, res, next) => this.userAdminController.get(req, res, next),
    );

    router.put(
      "/:id",
      [adminAuthMiddleware.authenticate, adminAuthMiddleware.isAuthenticated],
      (req, res, next) => this.userAdminController.update(req, res, next),
    );

    router.delete(
      "/:id",
      [adminAuthMiddleware.authenticate, adminAuthMiddleware.isAuthenticated],
      (req, res, next) => this.userAdminController.deleteById(req, res, next),
    );

    return router;
  }
}
