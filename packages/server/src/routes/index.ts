import { Router } from "express";

import adminRouter from "./admin";
import achievementsRouter from "./achievement.router";
import authRouter from "./auth.router";
import riddleRouter from "./riddle.router";
import riddlethonRouter from "./riddlethon.router";
import hardToClickRouter from "./hard-to-click.router";
import eventsRouter from "./event.router";
import userRouter from "./user.router";
import housesRouter from "./house.router";
import pushNotificationRouter from "./push-notification.router";

const router = Router();

router.use("/admin", adminRouter);
router.use("/achievements", achievementsRouter);
router.use("/auth", authRouter);
router.use("/riddle", riddleRouter);
router.use("/riddlethon", riddlethonRouter);
router.use("/hard-to-click", hardToClickRouter);
router.use("/events", eventsRouter);
router.use("/users", userRouter);
router.use("/houses", housesRouter);
router.use("/push-notifications", pushNotificationRouter);

export default router;
