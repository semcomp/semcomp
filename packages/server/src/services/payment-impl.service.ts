import PaymentModel from "../models/payment";

import IdService from "./id.service";
import { UserService } from "./user.service";
import PaymentIntegrationService from "./payment-integration.service";
import PaymentService from "./payment.service";

export default class PaymentServiceImpl implements PaymentService {
  private idService: IdService;
  private paymentIntegrationService: PaymentIntegrationService;
  private userService: UserService;
  private notificationUrl: string;

  constructor(
    idService: IdService,
    paymentIntegrationService: PaymentIntegrationService,
    userService: UserService,
    notificationUrl: string,
  ) {
    this.idService = idService;
    this.paymentIntegrationService = paymentIntegrationService;
    this.userService = userService;
    this.notificationUrl = notificationUrl;
  }

  public async create(userId: string): Promise<any> {
    const user = await this.userService.findById(userId);
    const id = this.idService.create();

    await PaymentModel.create({
      id,
      userId: user.id,
    });

    const paymentResponse = await this.paymentIntegrationService.create(
      0.01,
      user.email,
      "Semcomp",
      `${this.notificationUrl}/${id}`
    );

    await PaymentModel.findOneAndUpdate({ id }, {
      paymentIntegrationId: paymentResponse.id,
    })

    return paymentResponse;
  }

  public async receive(id: number): Promise<void> {
    const payment = await PaymentModel.findOne({ id });
    const paymentResponse = await this.paymentIntegrationService.receive(payment.paymentIntegrationId);

    if (paymentResponse.status === 'approved') {
      await this.userService.pay(payment.userId);
    }
  }
}
