const { Router } = require("express");

const adminRouter = require("./admin");
const achievementsRouter = require("./achievement.router");
const authRouter = require("./auth.router");
const riddleRouter = require("./riddle.router");
const riddlethonRouter = require("./riddlethon.router");
const hardToClickRouter = require("./hard-to-click.router");
const eventsRouter = require("./event.router");
const userRouter = require("./user.router");
const housesRouter = require("./house.router");
const pushNotificationRouter = require("./push-notification.router");

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

module.exports = router;
