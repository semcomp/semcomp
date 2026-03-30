import { Router } from "express";

export default class PaymentRouter {
  private authMiddleware: any;
  private paymentController: any;

  constructor(authMiddleware: any, paymentController: any) {
    this.authMiddleware = authMiddleware;
    this.paymentController = paymentController;
  }

  public create(): Router {
    const router = Router();
    
    router.get(
      "/user-id/:id",
      (req, res, next) => this.paymentController.findByUserId(req, res, next),
    );

    router.post(
      "/",
      [
        this.authMiddleware.authenticate,
        this.authMiddleware.isAuthenticated,
      ],
      (req, res, next) => this.paymentController.create(req, res, next)
    );

    router.post(
      "/:id",
      (req, res, next) => this.paymentController.receive(req, res, next)
    );

    router.get(
      '/purchased-coffees',
      (req, res, next) => this.paymentController.getPurchasedCoffee(req, res, next),
    );

    router.get(
      '/remaining-tshirts',
      (req, res, next) => this.paymentController.getRemainingTShirts(req, res, next),
    )

    return router;
  }
}

