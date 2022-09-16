import PaymentServiceImpl from "../../services/payment-impl.service";

export default class PaymentController {
  paymentServiceImpl: PaymentServiceImpl;

  constructor(paymentServiceImpl: PaymentServiceImpl) {
    this.paymentServiceImpl = paymentServiceImpl;
  }
}
