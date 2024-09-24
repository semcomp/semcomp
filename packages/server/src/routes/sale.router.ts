import { Router } from "express";
import { body, param } from "express-validator";

import SaleController from "../controllers/sale.controller";
import authMiddleware from "../middlewares/auth.middleware";

const router = Router();

router.get(
    "/get-items",
    [authMiddleware.authenticate, authMiddleware.isAuthenticated],
    SaleController.getItems
  );

router.get(
  "/get-availables",
  [authMiddleware.authenticate, authMiddleware.isAuthenticated],
  SaleController.getAvailables
);

router.get(
  "/get-sales",
  [authMiddleware.authenticate, authMiddleware.isAuthenticated],
  SaleController.getSales
);

router.get(
  "/:id",
  [
    authMiddleware.authenticate,
    authMiddleware.isAuthenticated,
    param("id", "Invalid field 'saleId'").not().isEmpty(),
  ],
  SaleController.getOne
);


export default router;
