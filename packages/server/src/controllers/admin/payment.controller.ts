import { handleError } from "../../lib/handle-error";
import { handleValidationResult } from "../../lib/handle-validation-result";
import { PaginationRequest } from "../../lib/pagination";
import PaymentServiceImpl from "../../services/payment-impl.service";

export default class PaymentController {
  paymentService: PaymentServiceImpl;

  constructor(paymentService: PaymentServiceImpl) {
    this.paymentService = paymentService;
  }

  public async create(req, res, next) {
    try {
      handleValidationResult(req);

      const event = req.body;

      const createdPayment = await this.paymentService.create(event);

      return res.status(200).json(createdPayment);
    } catch (error) {
      return handleError(error, next);
    }
  };

  public async generateQrCodes(req, res, next) {
    try {
      await this.paymentService.generateQrCodes();

      return res.status(200).json();
    } catch (error) {
      return handleError(error, next);
    }
  }

  public async getPaymentWithUser(req, res, next) {
    const pagination = new PaginationRequest(
      +req.query.page,
      +req.query.items,
    );
    
    try {
      const payments = await this.paymentService.getPaymentWithUsers(pagination);

      return res.status(200).json(payments);
    } catch (error) {
      return handleError(error, next);
    }
  }
}
