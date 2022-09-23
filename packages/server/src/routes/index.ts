import { Router } from "express";
import { config } from "dotenv";
config({ path: `./config/env/${process.env.NODE_ENV === "production" ? "production" : "development"}.env` });

import AdminRouter from "./admin";
import achievementsRouter from "./achievement.router";
import gameRouter from "./game.router";
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
import UploadRouter from "./upload.router";
import AuthRouter from "./auth.router";
import AuthController from "../controllers/auth.controller";

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

const uploadRouter = new UploadRouter(authMiddleware, process.env.FILE_UPLOAD_PATH);
router.use("/upload", uploadRouter.create());

const authController = new AuthController(paymentServiceImpl);
const authRouter = new AuthRouter(authController);
router.use("/auth", authRouter.create());

const adminRouter = new AdminRouter(paymentServiceImpl);
router.use("/admin", adminRouter.create());

router.use("/achievements", achievementsRouter);
router.use("/game", gameRouter);
router.use("/events", eventsRouter);
router.use("/users", userRouter);
router.use("/houses", houseRouter);
router.use("/push-notifications", pushNotificationRouter);

export default router;
