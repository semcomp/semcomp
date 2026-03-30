import { Router } from "express";
import { body } from "express-validator";

import authMiddleware from "../middlewares/auth.middleware";
import treasureHuntImageController from "../controllers/treasure-hunt.controller";

const router = Router();

router.get(
    "/:id",
    treasureHuntImageController.getOne
);

export default router;
