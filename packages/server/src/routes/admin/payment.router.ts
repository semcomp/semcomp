import { Router } from "express";

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

    return router;
  }
}
