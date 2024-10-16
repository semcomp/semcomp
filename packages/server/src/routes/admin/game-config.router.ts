import { Router } from "express";

import gameConfigController from "../../controllers/admin/game-config.controller";
import adminAuthMiddleware from "../../middlewares/admin-auth.middleware";

const router = Router();

router.get(
    "/",
    [
        adminAuthMiddleware.authenticate,
        adminAuthMiddleware.isAuthenticated
    ],
    gameConfigController.list
);

router.post(
    "/",
    [
        adminAuthMiddleware.authenticate,
        adminAuthMiddleware.isAuthenticated,
    ],
    gameConfigController.create
);

router.put(
    "/:id",
    [
        adminAuthMiddleware.authenticate,
        adminAuthMiddleware.isAuthenticated,
    ],
    gameConfigController.update
);

router.delete(
    "/:id",
    [
        adminAuthMiddleware.authenticate,
        adminAuthMiddleware.isAuthenticated,
    ],
    gameConfigController.delete
);

export default router;
