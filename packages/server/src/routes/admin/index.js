const { Router } = require("express");

const authRouter = require("./auth.router");
const hardToClickQuestionsRouter = require("./hard-to-click-question.router");
const hardToClickGroupsRouter = require("./hard-to-click-group.router");
const riddleQuestionsRouter = require("./riddle-question.router");
const riddleGroupsRouter = require("./riddle-group.router");
const riddlethonQuestionsRouter = require("./riddlethon-question.router");
const riddlethonGroupsRouter = require("./riddlethon-group.router");
const adminUsersRouter = require("./admin-user.router");
const usersRouter = require("./user.router");
const logsRouter = require("./log.router");
const achievementsRouter = require("./achievement.router");
const eventsRouter = require("./event.router");
const housesRouter = require("./house.router");
const emailRouter = require("./email.router");
const pushNotificationRouter = require("./push-notification.router");

const router = Router();

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

module.exports = router;
