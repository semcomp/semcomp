import { handleError } from "../lib/handle-error";
import PaymentService from "../services/payment.service";

export default class PaymentController {
  private paymentService: PaymentService;

  constructor(paymentService: PaymentService) {
    this.paymentService = paymentService;
  }

  public async create(req, res, next) {
    try {
      console.log("[userid]", req.user.id)

       const payment = await this.paymentService.createPayment(
         req.user?.id,
         req.body?.withSocialBenefit,
         req.body?.socialBenefitFileName,
         req.body?.tShirtSize,
         req.body?.foodOption,
         req.body?.kitOption,
       )
       console.log("[payment]", payment)
      
      return res.status(200).json(payment);
      console.log("Cheguei até a ultima step da fiunc de pagamento!")
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
