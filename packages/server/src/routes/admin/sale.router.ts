import { Router } from "express";

import SaleController from "../../controllers/admin/sale.controller";

export default class SaleRouter {
  private adminAuthMiddleware: any;

  constructor(adminAuthMiddleware: any) {
    this.adminAuthMiddleware = adminAuthMiddleware;
  }

  public create(): Router {
    const router = Router();

    router.get(
      "/",
      [this.adminAuthMiddleware.authenticate, this.adminAuthMiddleware.isAuthenticated],
      SaleController.list
    );

    router.post(
      "/",
      [
        this.adminAuthMiddleware.authenticate,
        this.adminAuthMiddleware.isAuthenticated,
      ],
      SaleController.create
    );

    router.put(
      "/:id",
      [
        this.adminAuthMiddleware.authenticate,
        this.adminAuthMiddleware.isAuthenticated,
      ],
      SaleController.update
    );

    return router;
  }
}
