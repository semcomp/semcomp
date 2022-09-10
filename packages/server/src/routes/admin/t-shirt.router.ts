import { Router } from "express";

import tShirtController from "../../controllers/admin/t-shirt.controller";

export default class TShirtRouter {
  private adminAuthMiddleware: any;

  constructor(adminAuthMiddleware: any) {
    this.adminAuthMiddleware = adminAuthMiddleware;
  }

  public create(): Router {
    const router = Router();

    router.get(
      "/",
      [this.adminAuthMiddleware.authenticate, this.adminAuthMiddleware.isAuthenticated],
      tShirtController.list
    );

    router.post(
      "/",
      [
        this.adminAuthMiddleware.authenticate,
        this.adminAuthMiddleware.isAuthenticated,
      ],
      tShirtController.create
    );

    router.put(
      "/",
      [
        this.adminAuthMiddleware.authenticate,
        this.adminAuthMiddleware.isAuthenticated,
      ],
      tShirtController.update
    );

    return router;
  }
}
