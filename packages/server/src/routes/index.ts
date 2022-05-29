import { Router } from "express";
import 'dotenv/config'

import adminRouter from "./admin";
import achievementsRouter from "./achievement.router";
import authRouter from "./auth.router";
import riddleRouter from "./riddle.router";
import riddlethonRouter from "./riddlethon.router";
import hardToClickRouter from "./hard-to-click.router";
import eventsRouter from "./event.router";
import userRouter from "./user.router";
import houseRouter from "./house.router";
import PaymentRouter from "./payment.router";
import pushNotificationRouter from "./push-notification.router";
import authMiddleware from "../middlewares/auth.middleware";
import PaymentController from "../controllers/payment.controller";
import IdSeviceImpl from "../services/id-impl.service";
import PaymentServiceImpl from "../services/payment-impl.service";
import MercadoPagoPaymentService from "../services/mercado-pago-payment.service";
import userServiceImpl from "../services/user.service";

const router = Router();

const idServiceImpl = new IdSeviceImpl();
const mercadoPagoPaymentService = new MercadoPagoPaymentService(process.env.MERCADO_PAGO_TOKEN);
const paymentServiceImpl = new PaymentServiceImpl(
  idServiceImpl,
  mercadoPagoPaymentService,
  userServiceImpl,
  process.env.PAYMENT_BASE_URL
);
const paymentController = new PaymentController(paymentServiceImpl);

const paymentRouter = new PaymentRouter(authMiddleware, paymentController);
router.use("/payments", paymentRouter.create());

router.use("/admin", adminRouter);
router.use("/achievements", achievementsRouter);
router.use("/auth", authRouter);
router.use("/riddle", riddleRouter);
router.use("/riddlethon", riddlethonRouter);
router.use("/hard-to-click", hardToClickRouter);
router.use("/events", eventsRouter);
router.use("/users", userRouter);
router.use("/houses", houseRouter);
router.use("/push-notifications", pushNotificationRouter);

export default router;
