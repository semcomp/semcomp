import { Router } from "express";

import authRouter from "./auth.router";
import gameQuestionsRouter from "./game-question.router";
import gameGroupsRouter from "./game-group.router";
import adminUsersRouter from "./admin-user.router";
import UsersRouter from "./user.router";
import logsRouter from "./log.router";
import achievementsRouter from "./achievement.router";
import eventsRouter from "./event.router";
import housesRouter from "./house.router";
import emailRouter from "./email.router";
import subscriptionRouter from "./subscription.router";
import treasureHuntImageRouter from "./treasure-hunt-image.router";
import pushNotificationRouter from "./push-notification.router";
import TShirtRouter from "./t-shirt.router";
import SaleRouter from "./sale.router";
import adminAuthMiddleware from "../../middlewares/admin-auth.middleware";
import PaymentServiceImpl from "../../services/payment-impl.service";
import PaymentRouter from "./payment.router";

const tShirtRouter = new TShirtRouter(adminAuthMiddleware);
const salesRouter = new SaleRouter(adminAuthMiddleware);

export default class AdminRouter {
  private paymentService: PaymentServiceImpl;
  private usersRouter: UsersRouter;
  private paymentRouter: PaymentRouter;

  constructor(paymentService: PaymentServiceImpl) {
    this.paymentService = paymentService;
    this.usersRouter = new UsersRouter(this.paymentService);
    this.paymentRouter = new PaymentRouter(adminAuthMiddleware, this.paymentService);
  }

  public create(): Router {
    const router = Router();

    router.use("/auth", authRouter);
    router.use("/game/questions", gameQuestionsRouter);
    router.use("/game/groups", gameGroupsRouter);
    router.use("/admin-users", adminUsersRouter);
    router.use("/users", this.usersRouter.create());
    router.use("/logs", logsRouter);
    router.use("/payments", this.paymentRouter.create());
    router.use("/achievements", achievementsRouter);
    router.use("/events", eventsRouter);
    router.use("/houses", housesRouter);
    router.use("/email", emailRouter);
    router.use("/push-notification", pushNotificationRouter);
    router.use("/t-shirts", tShirtRouter.create());
    router.use("/sales", salesRouter.create());
    router.use("/subscription", subscriptionRouter);
    router.use("/treasure-hunt-images", treasureHuntImageRouter);

    return router;
  }
}
