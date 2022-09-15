import { handleError } from "../../lib/handle-error";
import PaymentServiceImpl from "../../services/payment-impl.service";

export default class PaymentController {
  paymentServiceImpl: PaymentServiceImpl;

  constructor(paymentServiceImpl: PaymentServiceImpl) {
    this.paymentServiceImpl = paymentServiceImpl;
  }

  public async syncUsersPayment(req, res, next) {
    try {
      await this.paymentServiceImpl.syncUsersPayment();

      return res.status(200).json();
    } catch (error) {
      return handleError(error, next);
    }
  }
}
