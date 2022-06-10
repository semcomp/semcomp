import { Router } from "express";

export default class PaymentRouter {
  // private authMiddleware: any;
  private paymentController: any;

  constructor(/*authMiddleware: any, */paymentController: any) {
    // this.authMiddleware = authMiddleware;
    this.paymentController = paymentController;
  }

  public create(): Router {
    const router = Router();

    // router.post(
    //   "/",
    //   [
    //     this.authMiddleware.authenticate,
    //     this.authMiddleware.isAuthenticated,
    //   ],
    //   (req, res, next) => this.paymentController.create(req, res, next)
    // );

    router.post(
      "/:id",
      (req, res, next) => this.paymentController.receive(req, res, next)
    );

    return router;
  }
}

