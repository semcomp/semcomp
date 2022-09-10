import { Router } from "express";

import authRouter from "./auth.router";
import hardToClickQuestionsRouter from "./hard-to-click-question.router";
import hardToClickGroupsRouter from "./hard-to-click-group.router";
import riddleQuestionsRouter from "./riddle-question.router";
import riddleGroupsRouter from "./riddle-group.router";
import riddlethonQuestionsRouter from "./riddlethon-question.router";
import riddlethonGroupsRouter from "./riddlethon-group.router";
import adminUsersRouter from "./admin-user.router";
import usersRouter from "./user.router";
import logsRouter from "./log.router";
import achievementsRouter from "./achievement.router";
import eventsRouter from "./event.router";
import housesRouter from "./house.router";
import emailRouter from "./email.router";
import pushNotificationRouter from "./push-notification.router";
import TShirtRouter from "./t-shirt.router";
import adminAuthMiddleware from "../../middlewares/admin-auth.middleware";

const router = Router();

const tShirtRouter = new TShirtRouter(adminAuthMiddleware);

router.use("/auth", authRouter);
router.use("/hard-to-click/questions", hardToClickQuestionsRouter);
router.use("/hard-to-click/groups", hardToClickGroupsRouter);
router.use("/riddle/questions", riddleQuestionsRouter);
router.use("/riddle/groups", riddleGroupsRouter);
router.use("/riddlethon/questions", riddlethonQuestionsRouter);
router.use("/riddlethon/groups", riddlethonGroupsRouter);
router.use("/admin-users", adminUsersRouter);
router.use("/users", usersRouter);
router.use("/logs", logsRouter);
router.use("/achievements", achievementsRouter);
router.use("/events", eventsRouter);
router.use("/houses", housesRouter);
router.use("/email", emailRouter);
router.use("/push-notification", pushNotificationRouter);
router.use("/t-shirts", tShirtRouter.create());

export default router;
