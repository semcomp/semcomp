import { Router } from "express";

import PaymentController from "../../controllers/admin/payment.controller";
import PaymentServiceImpl from "../../services/payment-impl.service";

export default class PaymentRouter {
  private adminAuthMiddleware: any;
  private paymentController: PaymentController;

  constructor(adminAuthMiddleware: any, paymentServiceImpl: PaymentServiceImpl) {
    this.adminAuthMiddleware = adminAuthMiddleware;
    this.paymentController = new PaymentController(paymentServiceImpl);
  }

  public create(): Router {
    const router = Router();

    router.post(
      "/sync",
      [this.adminAuthMiddleware.authenticate, this.adminAuthMiddleware.isAuthenticated],
      (req, res, next) => this.paymentController.syncUsersPayment(req, res, next),
    );

    return router;
  }
}
