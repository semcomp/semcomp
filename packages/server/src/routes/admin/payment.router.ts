import { Router } from "express";
import { body } from "express-validator";

import cron from "node-cron";

import PaymentController from "../../controllers/admin/payment.controller";
import PaymentServiceImpl from "../../services/payment-impl.service";

export default class PaymentRouter {
  private adminAuthMiddleware: any;
  private paymentController: PaymentController;
  private paymentService: PaymentServiceImpl;

  constructor(adminAuthMiddleware: any, paymentServiceImpl: PaymentServiceImpl) {
    this.adminAuthMiddleware = adminAuthMiddleware;
    this.paymentController = new PaymentController(paymentServiceImpl);
    this.paymentService = paymentServiceImpl;
  }

  public create(): Router {
    const router = Router();

    cron.schedule("0 3 * * *", async () => {
      await this.paymentService.cancelOldPendingPayments()
    });

    router.post(
      "/generate-qr-codes",
      [this.adminAuthMiddleware.authenticate, this.adminAuthMiddleware.isAuthenticated],
      (req, res, next) => this.paymentController.generateQrCodes(req, res, next),
    );

    router.post(
      "/",
      [
        body("userId", "Invalid field 'userId'").not().isEmpty(),
        body("status", "Invalid field 'status'").not().isEmpty(),
        body("withSocialBenefit", "Invalid field 'withSocialBenefit'").not().isEmpty(),
        this.adminAuthMiddleware.authenticate,
        this.adminAuthMiddleware.isAuthenticated,
      ],
      (req, res, next) => this.paymentController.create(req, res, next),
    );

    return router;
  }
}
