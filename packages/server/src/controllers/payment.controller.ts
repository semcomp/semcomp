import { handleError } from "../lib/handle-error";
import PaymentService from "../services/payment.service";

export default class PaymentController {
  private paymentService: PaymentService;

  constructor(paymentService: PaymentService) {
    this.paymentService = paymentService;
  }

  public async create(req, res, next) {
    try {
      const payment = await this.paymentService.createPayment(
        req.user.id,
        req.body.withSocialBenefit,
        req.body.socialBenefitNumber,
        req.body.tShirtSize,
      );

      return res.status(200).json(payment);
    } catch (error) {
      return handleError(error, next);
    }
  }

  public async receive(req, res, next) {
    try {
      await this.paymentService.receive(req.params.id);

      return res.status(200).json();
    } catch (error) {
      return handleError(error, next);
    }
  }
}
